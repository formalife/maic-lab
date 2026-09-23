#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="$(tr -d '[:space:]' < "$LAB_ROOT/full-stock/UPSTREAM_PIN")"
TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"

if [[ ! -d "$TARGET/.git" ]]; then
  echo "ERROR: OpenMAIC non trovato in $TARGET. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker con Compose v2 non è disponibile." >&2
  exit 1
fi

cd "$TARGET"

CURRENT_HEAD="$(git rev-parse HEAD)"
if [[ "$CURRENT_HEAD" != "$PIN" ]]; then
  cat >&2 <<EOF
ERROR: il clone OpenMAIC non è sul pin approvato per questo esperimento.
expected: $PIN
actual:   $CURRENT_HEAD
Riesegui full-stock/bootstrap.sh oppure riallinea esplicitamente il clone prima del test.
EOF
  exit 2
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: il clone OpenMAIC contiene modifiche locali. Il baseline full-stock richiede sorgente upstream non modificato." >&2
  git status --short >&2
  exit 2
fi

if [[ ! -f .env.local ]]; then
  echo "ERROR: .env.local mancante. Esegui prima bootstrap.sh." >&2
  exit 1
fi

# Agent Workbench is server-backed by design. Upstream requires an explicit
# maic-agent-driver route and deliberately provides no fallback.
if ! grep -Eq '^MODEL_ROUTES=.*maic-agent-driver' .env.local; then
  cat >&2 <<'EOF'
ERROR: MODEL_ROUTES per maic-agent-driver non configurato in .env.local.
Per il percorso gratuito usa full-stock/configure-ollama.sh dal repository maic-lab.
EOF
  exit 2
fi

ZERO_COST_MODE=0
if grep -Eq '^FORMALIFE_ZERO_COST_MODE=1$' .env.local; then
  ZERO_COST_MODE=1
fi

CLOUD_KEY_RE='^(OPENAI|AZURE_OPENAI|ANTHROPIC|GOOGLE|DEEPSEEK|QWEN|KIMI|MINIMAX|GLM|SILICONFLOW|DOUBAO|OPENROUTER|GROK|TENCENT|TENCENT_HUNYUAN|XIAOMI|MIMO)_API_KEY=.+'

if (( ZERO_COST_MODE == 1 )); then
  # Zero-cost means zero paid-provider escape hatches in this dedicated lab env.
  if grep -Eq "$CLOUD_KEY_RE" .env.local; then
    echo "ERROR: FORMALIFE_ZERO_COST_MODE=1 ma .env.local contiene ancora una cloud API key attiva." >&2
    echo "Riesegui full-stock/configure-ollama.sh per disabilitare le chiavi cloud in questo lab." >&2
    exit 2
  fi

  if ! grep -Eq '^OLLAMA_BASE_URL=.+$' .env.local || ! grep -Eq '^OLLAMA_MODELS=.+$' .env.local; then
    echo "ERROR: zero-cost mode richiede OLLAMA_BASE_URL e OLLAMA_MODELS." >&2
    exit 2
  fi

  if ! grep -Eq '^DEFAULT_MODEL=ollama:.+$' .env.local; then
    echo "ERROR: zero-cost mode richiede DEFAULT_MODEL=ollama:<model>." >&2
    exit 2
  fi

  if ! grep -Eq '^MODEL_ROUTES=.*"maic-agent-driver".*"model":"ollama:.*".*"api":"openai-completions"' .env.local; then
    echo "ERROR: maic-agent-driver non è vincolato a Ollama/openai-completions." >&2
    exit 2
  fi

  if ! command -v curl >/dev/null 2>&1 || ! curl -fsS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "ERROR: Ollama locale non è raggiungibile su http://127.0.0.1:11434." >&2
    echo "Avvia Ollama e riprova." >&2
    exit 2
  fi

  LOCAL_MODEL="$(sed -n 's/^OLLAMA_MODELS=//p' .env.local | tail -n 1 | cut -d, -f1)"
  if command -v ollama >/dev/null 2>&1 && ! ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq "$LOCAL_MODEL"; then
    echo "ERROR: modello Ollama richiesto non installato: $LOCAL_MODEL" >&2
    echo "Riesegui full-stock/configure-ollama.sh." >&2
    exit 2
  fi
else
  # Non-zero-cost mode remains available for explicit future experiments, but
  # it is not the current Formalife path.
  if ! grep -Eq "$CLOUD_KEY_RE|^(OLLAMA|LEMONADE)_BASE_URL=.+$" .env.local; then
    echo "ERROR: nessun provider LLM server-side configurato in .env.local." >&2
    exit 2
  fi
fi

# NEXT_PUBLIC_* values are build-time inputs in OpenMAIC Docker Compose.
export NEXT_PUBLIC_PERSISTENCE=1
export NEXT_PUBLIC_PERSISTENCE_TOKEN=openmaic-local-dev
export NEXT_PUBLIC_PRO_WORKBENCH_ENABLED=true
export NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true
export NEXT_PUBLIC_PI_CHAT_ENABLED=true
export NEXT_PUBLIC_COURSEWARE_REFERENCE_ENABLED=true
export NEXT_PUBLIC_SHOW_VOCATIONAL_TEST_UI=true
export NEXT_PUBLIC_ENABLE_PPTX_IMPORT=true
export NEXT_PUBLIC_MAIC_PLAYBACK_RENDERER_ENABLED=false
export NEXT_PUBLIC_MAIC_EDITOR_RENDERER_ENABLED=false
export NEXT_PUBLIC_ENABLE_VIDEO_EXPORT=false

if (( ZERO_COST_MODE == 1 )); then
  COST_LINE="- provider: Ollama locale / API cost: 0"
else
  COST_LINE="- provider: configured external/local provider"
fi

cat <<EOF
Starting OpenMAIC FULL-STOCK lab...
- upstream pin: $PIN
- app: http://localhost:3000
- PostgreSQL: server-persistence profile
$COST_LINE
- Pro Workbench: ON
- MAIC Editor: ON
- Pi chat: ON
- Courseware references: ON
- Vocational Task Engine: ON
- PPTX import: ON
- experimental package renderer flags: OFF (stock app surfaces retained)
- video export render-service: OFF for this checkpoint

Stop with Ctrl-C. Data remains in Docker volumes unless explicitly deleted.
EOF

docker compose --profile server-persistence up --build
