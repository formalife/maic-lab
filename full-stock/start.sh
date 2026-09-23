#!/usr/bin/env bash
set -euo pipefail

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

if [[ ! -f .env.local ]]; then
  echo "ERROR: .env.local mancante. Esegui prima bootstrap.sh." >&2
  exit 1
fi

# Agent Workbench is server-backed by design. Upstream requires an explicit
# maic-agent-driver route and deliberately provides no fallback.
if ! grep -Eq '^MODEL_ROUTES=.*maic-agent-driver' .env.local; then
  cat >&2 <<'EOF'
ERROR: MODEL_ROUTES per maic-agent-driver non configurato in .env.local.
Usa il formato documentato dall'upstream, per esempio con OpenAI:
MODEL_ROUTES='{"maic-agent-driver":{"model":"openai:gpt-5.5","api":"openai-completions"}}'
EOF
  exit 2
fi

# Accept either a cloud API key or a configured local model endpoint. This is a
# preflight only; OpenMAIC remains the authority on provider validity at runtime.
if ! grep -Eq '^(OPENAI|AZURE_OPENAI|ANTHROPIC|GOOGLE|DEEPSEEK|QWEN|KIMI|MINIMAX|GLM|SILICONFLOW|DOUBAO|OPENROUTER|GROK|TENCENT|TENCENT_HUNYUAN|XIAOMI|MIMO)_API_KEY=.+$|^(OLLAMA|LEMONADE)_BASE_URL=.+$' .env.local; then
  echo "ERROR: nessun provider LLM server-side configurato in .env.local." >&2
  exit 2
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

cat <<'EOF'
Starting OpenMAIC FULL-STOCK lab...
- app: http://localhost:3000
- PostgreSQL: server-persistence profile
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
