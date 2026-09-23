#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="$(tr -d '[:space:]' < "$LAB_ROOT/full-stock/UPSTREAM_PIN")"
TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"
PG_CONTAINER="formalife-openmaic-postgres"
PG_PORT="${FORMALIFE_OPENMAIC_PG_PORT:-55432}"

if [[ ! -d "$TARGET/.git" ]]; then
  echo "ERROR: OpenMAIC non trovato in $TARGET. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

cd "$TARGET"

CURRENT_HEAD="$(git rev-parse HEAD)"
if [[ "$CURRENT_HEAD" != "$PIN" ]]; then
  echo "ERROR: clone OpenMAIC non sul pin approvato (expected $PIN, actual $CURRENT_HEAD)." >&2
  exit 2
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: il clone OpenMAIC contiene modifiche locali. Il baseline full-stock richiede sorgente upstream non modificato." >&2
  git status --short >&2
  exit 2
fi

if [[ ! -f .env.local ]]; then
  echo "ERROR: .env.local mancante. Esegui prima bootstrap.sh e configure-ollama.sh." >&2
  exit 1
fi

if ! grep -Eq '^FORMALIFE_ZERO_COST_MODE=1$' .env.local; then
  echo "ERROR: questo launcher dev è destinato al baseline zero-cost Ollama." >&2
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker non disponibile; serve solo per PostgreSQL." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js non trovato. OpenMAIC richiede Node >=22.19.0." >&2
  echo "Su Homebrew: brew install node@22" >&2
  exit 1
fi

if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22 || (a===22 && b>=19) ? 0 : 1)'; then
  echo "ERROR: Node $(node --version) troppo vecchio; OpenMAIC richiede >=22.19.0." >&2
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "ERROR: corepack non trovato. Usa Node 22 oppure installa/abilita Corepack." >&2
  exit 1
fi

if ! curl -fsS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "ERROR: Ollama non raggiungibile su http://127.0.0.1:11434." >&2
  exit 2
fi

LOCAL_MODEL="$(sed -n 's/^OLLAMA_MODELS=//p' .env.local | tail -n 1 | cut -d, -f1)"
if [[ -z "$LOCAL_MODEL" ]]; then
  echo "ERROR: OLLAMA_MODELS mancante in .env.local." >&2
  exit 2
fi

# Keep the model unloaded while installing/building workspace packages. Ollama
# reloads it automatically on the first inference request.
if command -v ollama >/dev/null 2>&1; then
  ollama stop "$LOCAL_MODEL" >/dev/null 2>&1 || true
fi

# PostgreSQL only: run it outside upstream Compose so the Next dev server can
# stay on the macOS host and avoid the memory-heavy production Docker build.
if docker ps -a --format '{{.Names}}' | grep -Fxq "$PG_CONTAINER"; then
  docker start "$PG_CONTAINER" >/dev/null
else
  docker run -d \
    --name "$PG_CONTAINER" \
    -e POSTGRES_DB=openmaic \
    -e POSTGRES_USER=openmaic \
    -e POSTGRES_PASSWORD=openmaic-dev \
    -p "127.0.0.1:${PG_PORT}:5432" \
    -v formalife-openmaic-postgres:/var/lib/postgresql/data \
    postgres:16 >/dev/null
fi

for _ in {1..30}; do
  if docker exec "$PG_CONTAINER" pg_isready -U openmaic -d openmaic >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if ! docker exec "$PG_CONTAINER" pg_isready -U openmaic -d openmaic >/dev/null 2>&1; then
  echo "ERROR: PostgreSQL locale non è diventato ready." >&2
  exit 2
fi

corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.28.0 --activate >/dev/null

if [[ ! -d node_modules ]]; then
  echo "Installing stock OpenMAIC dependencies on macOS host (one-time)..."
  NODE_OPTIONS=--max-old-space-size=1024 pnpm install --frozen-lockfile
fi

# Host-mode overrides only. .env.local remains unchanged and therefore still
# works with the Docker baseline if we need it later.
export DATABASE_URL="postgres://openmaic:openmaic-dev@127.0.0.1:${PG_PORT}/openmaic"
export OLLAMA_BASE_URL="http://127.0.0.1:11434/v1"
export NEXT_PUBLIC_PERSISTENCE=1
export NEXT_PUBLIC_PERSISTENCE_TOKEN=openmaic-local-dev
export NEXT_PUBLIC_PRO_WORKBENCH_ENABLED=true
export NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true
export OPENMAIC_AGENT_RUNTIME_ENABLED=true
export NEXT_PUBLIC_PI_CHAT_ENABLED=true
export NEXT_PUBLIC_COURSEWARE_REFERENCE_ENABLED=true
export OPENMAIC_ENABLE_VOCATIONAL=true
export NEXT_PUBLIC_SHOW_VOCATIONAL_TEST_UI=true
export NEXT_PUBLIC_ENABLE_PPTX_IMPORT=true
export NEXT_PUBLIC_MAIC_PLAYBACK_RENDERER_ENABLED=false
export NEXT_PUBLIC_MAIC_EDITOR_RENDERER_ENABLED=false
export NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=false

cat <<EOF
Starting OpenMAIC FULL-STOCK in upstream dev mode...
- source: exact upstream pin $PIN
- app: http://localhost:3000
- Next.js: macOS host / pnpm dev (no production Docker build)
- PostgreSQL: Docker only, localhost:${PG_PORT}
- Ollama: localhost:11434 / $LOCAL_MODEL / API cost 0
- Pro Workbench + MAIC Editor + Pi chat + Courseware references + Vocational: ON

Stop the app with Ctrl-C. PostgreSQL data remains in the Docker volume.
EOF

exec pnpm dev
