#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"
ENV_FILE="$TARGET/.env.local"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERROR: questo helper zero-cost è stato progettato e verificato per macOS." >&2
  exit 1
fi

if [[ "$(uname -m)" != "arm64" ]]; then
  echo "ERROR: questo helper è ottimizzato per Apple Silicon (arm64)." >&2
  exit 1
fi

if [[ ! -d "$TARGET/.git" || ! -f "$ENV_FILE" ]]; then
  echo "ERROR: OpenMAIC full-stock non inizializzato in $TARGET. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl non disponibile." >&2
  exit 1
fi

if ! command -v ollama >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Ollama non trovato. Installazione gratuita via Homebrew..."
    brew install ollama
  else
    cat >&2 <<'EOF'
ERROR: Ollama non è installato e Homebrew non è disponibile.
Installa Ollama dal sito ufficiale oppure installa Homebrew, poi riesegui questo helper.
EOF
    exit 2
  fi
fi

# Start the local Ollama service when it is not already reachable.
if ! curl -fsS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1 && brew list --formula ollama >/dev/null 2>&1; then
    echo "Avvio Ollama come servizio locale..."
    brew services start ollama >/dev/null
  else
    echo "Avvio Ollama in background..."
    nohup ollama serve >"$HOME/.ollama/formalife-openmaic.log" 2>&1 &
  fi

  for _ in {1..30}; do
    if curl -fsS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

if ! curl -fsS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "ERROR: Ollama installato ma non raggiungibile su http://127.0.0.1:11434." >&2
  exit 2
fi

# Choose a useful model without pretending every Mac has the same memory budget.
MEM_BYTES="$(sysctl -n hw.memsize)"
MEM_GB=$(( MEM_BYTES / 1024 / 1024 / 1024 ))

if [[ -n "${OPENMAIC_LOCAL_MODEL:-}" ]]; then
  MODEL="$OPENMAIC_LOCAL_MODEL"
elif (( MEM_GB >= 24 )); then
  MODEL="qwen3:14b"
elif (( MEM_GB >= 12 )); then
  MODEL="qwen3:8b"
else
  MODEL="qwen3:4b"
fi

if [[ ! "$MODEL" =~ ^[A-Za-z0-9._:+/-]+$ ]]; then
  echo "ERROR: model id Ollama non valido: $MODEL" >&2
  exit 2
fi

echo "RAM rilevata: ${MEM_GB} GB"
echo "Modello locale selezionato: $MODEL"
echo "Download/verifica del modello locale..."
ollama pull "$MODEL"

# Verify the exact capability OpenMAIC's agent driver needs: OpenAI-compatible
# function/tool calling. The test is fully local and incurs no API charge.
TOOL_TEST_PAYLOAD=$(cat <<EOF
{"model":"$MODEL","messages":[{"role":"user","content":"Call the get_status tool with value ready. Do not answer normally."}],"tools":[{"type":"function","function":{"name":"get_status","description":"Return a status value","parameters":{"type":"object","properties":{"value":{"type":"string"}},"required":["value"]}}}],"stream":false}
EOF
)

TOOL_TEST_RESPONSE="$(curl -fsS --max-time 180 \
  -H 'Content-Type: application/json' \
  -d "$TOOL_TEST_PAYLOAD" \
  http://127.0.0.1:11434/v1/chat/completions)"

if [[ "$TOOL_TEST_RESPONSE" != *'tool_calls'* ]]; then
  echo "ERROR: il modello risponde ma il test OpenAI-compatible tool calling non ha prodotto tool_calls." >&2
  echo "Scegli un modello Ollama con supporto tools e riesegui con OPENMAIC_LOCAL_MODEL=<model>." >&2
  exit 3
fi

# Remove active cloud-provider keys from this dedicated lab env so the zero-cost
# mode cannot accidentally fall back to a paid server provider. Values are not
# preserved or copied elsewhere.
TMP_ENV="$(mktemp)"
awk '
  /^(OPENAI|AZURE_OPENAI|ANTHROPIC|GOOGLE|DEEPSEEK|QWEN|KIMI|MINIMAX|GLM|SILICONFLOW|DOUBAO|OPENROUTER|GROK|TENCENT|TENCENT_HUNYUAN|XIAOMI|MIMO)_API_KEY=/ {
    split($0, a, "=");
    print "# " a[1] " disabled by FORMALIFE_ZERO_COST_MODE";
    next;
  }
  !/^(FORMALIFE_ZERO_COST_MODE|OLLAMA_BASE_URL|OLLAMA_MODELS|DEFAULT_MODEL|MODEL_ROUTES|ALLOW_LOCAL_NETWORKS)=/ { print }
' "$ENV_FILE" > "$TMP_ENV"

MODEL_FULL="ollama:$MODEL"
MODEL_ROUTES=$(cat <<EOF
{"scene-outlines-stream":"$MODEL_FULL","scene-content":"$MODEL_FULL","scene-actions":"$MODEL_FULL","agent-profiles":"$MODEL_FULL","quiz-grade":"$MODEL_FULL","pbl-chat":"$MODEL_FULL","pbl-v2-runtime":"$MODEL_FULL","chat-adapter":"$MODEL_FULL","generate-classroom":"$MODEL_FULL","web-search-query-rewrite":"$MODEL_FULL","maic-agent":"$MODEL_FULL","maic-agent-driver":{"model":"$MODEL_FULL","api":"openai-completions","contextWindow":32768},"conversation-title":"$MODEL_FULL"}
EOF
)

cat >> "$TMP_ENV" <<EOF

# >>> FORMALIFE ZERO-COST LOCAL PROVIDER >>>
FORMALIFE_ZERO_COST_MODE=1
# OpenMAIC runs inside Docker; on Docker Desktop for macOS this hostname reaches
# the Ollama service running on the host Mac.
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1
OLLAMA_MODELS=$MODEL
DEFAULT_MODEL=$MODEL_FULL
MODEL_ROUTES='$MODEL_ROUTES'
ALLOW_LOCAL_NETWORKS=true
# <<< FORMALIFE ZERO-COST LOCAL PROVIDER <<<
EOF

mv "$TMP_ENV" "$ENV_FILE"
chmod 600 "$ENV_FILE"

cat <<EOF

OLLAMA ZERO-COST CONFIG OK
OpenMAIC path: $TARGET
Model: $MODEL_FULL
Tool calling: PASS
Cloud API keys in this lab env: DISABLED
Per-call API cost: 0

Avvio full-stock:
  bash "$LAB_ROOT/full-stock/start.sh" "$TARGET"
EOF
