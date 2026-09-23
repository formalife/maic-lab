#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="$(tr -d '[:space:]' < "$LAB_ROOT/full-stock/UPSTREAM_PIN")"
TARGET="${2:-$HOME/Downloads/OpenMAIC-full-stock}"
IMAGE_ARCHIVE="${1:-}"
ENV_FILE="$TARGET/.env.local"
IMAGE="formalife-openmaic-ram-safe:${PIN}"
APP_CONTAINER="formalife-openmaic-app"
PG_CONTAINER="formalife-openmaic-postgres"
NETWORK="formalife-openmaic-net"
OLLAMA_PORT="${FORMALIFE_RAM_SAFE_OLLAMA_PORT:-11435}"
OLLAMA_LOG="$HOME/.ollama/formalife-openmaic-ram-safe.log"

if [[ -z "$IMAGE_ARCHIVE" || ! -f "$IMAGE_ARCHIVE" ]]; then
  cat >&2 <<EOF
ERROR: passa come primo argomento l'archivio ARM64 scaricato dal workflow RAM-safe.
Esempio:
  bash full-stock/start-ram-safe-prebuilt.sh ~/Downloads/openmaic-full-stock-${PIN}-linux-arm64.tar.gz
EOF
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE non trovato." >&2
  exit 1
fi

if ! grep -Eq '^FORMALIFE_ZERO_COST_MODE=1$' "$ENV_FILE" || ! grep -Eq '^FORMALIFE_RAM_SAFE_MODE=1$' "$ENV_FILE"; then
  echo "ERROR: profilo RAM-safe non configurato. Esegui full-stock/configure-ram-safe.sh." >&2
  exit 2
fi

for cmd in docker ollama curl gzip; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: comando richiesto non trovato: $cmd" >&2
    exit 1
  fi
done

# Prevent the old 4B baseline from occupying unified memory.
ollama stop qwen3:4b >/dev/null 2>&1 || true
ollama stop qwen3:8b >/dev/null 2>&1 || true
ollama stop qwen3:14b >/dev/null 2>&1 || true

# Dedicated low-memory Ollama endpoint. Keep one model and one inference active,
# bound the default context, and unload shortly after inactivity.
if ! curl -fsS --max-time 2 "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1; then
  mkdir -p "$HOME/.ollama"
  nohup env \
    OLLAMA_HOST="127.0.0.1:${OLLAMA_PORT}" \
    OLLAMA_NUM_PARALLEL=1 \
    OLLAMA_MAX_LOADED_MODELS=1 \
    OLLAMA_CONTEXT_LENGTH=8192 \
    OLLAMA_KEEP_ALIVE=30s \
    ollama serve >"$OLLAMA_LOG" 2>&1 &

  for _ in {1..30}; do
    if curl -fsS --max-time 2 "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

if ! curl -fsS --max-time 2 "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1; then
  echo "ERROR: istanza Ollama RAM-safe non raggiungibile su porta ${OLLAMA_PORT}. Log: $OLLAMA_LOG" >&2
  exit 2
fi

ollama pull qwen3:1.7b >/dev/null

# Load the production image built remotely on a native Linux ARM64 runner.
echo "Loading prebuilt OpenMAIC ARM64 image..."
gzip -dc "$IMAGE_ARCHIVE" | docker load
if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "ERROR: l'archivio non contiene l'immagine attesa: $IMAGE" >&2
  exit 2
fi

ARCH="$(docker image inspect "$IMAGE" --format '{{.Architecture}}')"
if [[ "$ARCH" != "arm64" ]]; then
  echo "ERROR: immagine inattesa ($ARCH); attesa arm64." >&2
  exit 2
fi

if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  docker network create "$NETWORK" >/dev/null
fi

if docker ps -a --format '{{.Names}}' | grep -Fxq "$PG_CONTAINER"; then
  docker rm -f "$PG_CONTAINER" >/dev/null
fi

docker run -d \
  --name "$PG_CONTAINER" \
  --network "$NETWORK" \
  --memory=256m \
  --memory-swap=384m \
  -e POSTGRES_DB=openmaic \
  -e POSTGRES_USER=openmaic \
  -e POSTGRES_PASSWORD=openmaic-dev \
  -v formalife-openmaic-postgres:/var/lib/postgresql/data \
  postgres:16 >/dev/null

for _ in {1..30}; do
  if docker exec "$PG_CONTAINER" pg_isready -U openmaic -d openmaic >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if docker ps -a --format '{{.Names}}' | grep -Fxq "$APP_CONTAINER"; then
  docker rm -f "$APP_CONTAINER" >/dev/null
fi

MODEL_ROUTES='{"scene-outlines-stream":"ollama:qwen3:1.7b","scene-content":"ollama:qwen3:1.7b","scene-actions":"ollama:qwen3:1.7b","agent-profiles":"ollama:qwen3:1.7b","quiz-grade":"ollama:qwen3:1.7b","pbl-chat":"ollama:qwen3:1.7b","pbl-v2-runtime":"ollama:qwen3:1.7b","chat-adapter":"ollama:qwen3:1.7b","generate-classroom":"ollama:qwen3:1.7b","web-search-query-rewrite":"ollama:qwen3:1.7b","maic-agent":"ollama:qwen3:1.7b","maic-agent-driver":{"model":"ollama:qwen3:1.7b","api":"openai-completions","contextWindow":8192},"conversation-title":"ollama:qwen3:1.7b"}'

docker run -d \
  --name "$APP_CONTAINER" \
  --network "$NETWORK" \
  --memory=1536m \
  --memory-swap=1792m \
  --cpus=2 \
  -p 127.0.0.1:3000:3000 \
  --env-file "$ENV_FILE" \
  -e DATABASE_URL="postgres://openmaic:openmaic-dev@${PG_CONTAINER}:5432/openmaic" \
  -e PERSISTENCE_DEV_TOKEN=openmaic-local-dev \
  -e OLLAMA_BASE_URL="http://host.docker.internal:${OLLAMA_PORT}/v1" \
  -e OLLAMA_MODELS=qwen3:1.7b \
  -e DEFAULT_MODEL=ollama:qwen3:1.7b \
  -e MODEL_ROUTES="$MODEL_ROUTES" \
  -e ALLOW_LOCAL_NETWORKS=true \
  -e OPENMAIC_AGENT_RUNTIME_ENABLED=true \
  -e OPENMAIC_AGENT_RUNTIME_MAX_CONCURRENT=1 \
  -e PARALLEL_SCENE_CONCURRENCY=1 \
  -v formalife-openmaic-data:/app/data \
  "$IMAGE" >/dev/null

for _ in {1..60}; do
  if curl -fsS --max-time 2 http://127.0.0.1:3000/ >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS --max-time 2 http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo "ERROR: OpenMAIC RAM-safe non è diventato ready." >&2
  docker logs --tail 120 "$APP_CONTAINER" >&2 || true
  exit 2
fi

cat <<EOF

OPENMAIC RAM-SAFE READY
- app: http://127.0.0.1:3000
- OpenMAIC: production runtime prebuilt on GitHub ARM64 (no local compile)
- app memory hard limit: 1536 MiB
- PostgreSQL memory hard limit: 256 MiB
- Ollama: qwen3:1.7b on dedicated port ${OLLAMA_PORT}
- Ollama context default: 8192
- Ollama parallel requests: 1
- Agent runtime concurrency: 1
- API cost: 0

Current container usage:
EOF

docker stats --no-stream "$APP_CONTAINER" "$PG_CONTAINER" || true
printf '\nOllama models loaded:\n'
OLLAMA_HOST="127.0.0.1:${OLLAMA_PORT}" ollama ps || true

cat <<EOF

Stop:
  docker stop $APP_CONTAINER $PG_CONTAINER
  OLLAMA_HOST=127.0.0.1:${OLLAMA_PORT} ollama stop qwen3:1.7b
EOF
