#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"
ENV_FILE="$TARGET/.env.local"
DEFAULT_MODEL_ID="gpt-5.6-sol"

if [[ ! -d "$TARGET/.git" ]]; then
  echo "ERROR: OpenMAIC non trovato in $TARGET. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE mancante. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 non disponibile." >&2
  exit 1
fi

printf 'Modello OpenAI [%s]: ' "$DEFAULT_MODEL_ID"
IFS= read -r MODEL_ID
MODEL_ID="${MODEL_ID:-$DEFAULT_MODEL_ID}"

printf 'OpenAI API key (input nascosto; non verrà stampata): '
IFS= read -rs OPENAI_API_KEY_VALUE
printf '\n'

if [[ -z "$OPENAI_API_KEY_VALUE" ]]; then
  echo "ERROR: chiave vuota; nessuna modifica eseguita." >&2
  exit 2
fi

export OPENAI_API_KEY_VALUE MODEL_ID ENV_FILE
python3 <<'PY'
from pathlib import Path
import json
import os

path = Path(os.environ["ENV_FILE"])
key = os.environ["OPENAI_API_KEY_VALUE"]
model = os.environ["MODEL_ID"]
route = json.dumps(
    {
        "maic-agent-driver": {
            "model": f"openai:{model}",
            "api": "openai-responses",
        }
    },
    separators=(",", ":"),
)

updates = {
    "OPENAI_API_KEY": key,
    "DEFAULT_MODEL": f"openai:{model}",
    "MODEL_ROUTES": route,
}

lines = path.read_text().splitlines()
seen = set()
out = []
for line in lines:
    replaced = False
    for name, value in updates.items():
        if line.startswith(name + "="):
            out.append(f"{name}={value}")
            seen.add(name)
            replaced = True
            break
    if not replaced:
        out.append(line)

if seen != updates.keys():
    out.append("")
    out.append("# Local provider configured by maic-lab/full-stock/configure-openai.sh")
    for name, value in updates.items():
        if name not in seen:
            out.append(f"{name}={value}")

path.write_text("\n".join(out) + "\n")
PY

chmod 600 "$ENV_FILE"
unset OPENAI_API_KEY_VALUE

cat <<EOF
Provider configurato localmente.
- file: $ENV_FILE
- model: openai:$MODEL_ID
- agent driver transport: openai-responses
- permissions: 600

La chiave NON è stata scritta nel repository ma solo nella .env.local del clone OpenMAIC.
Prima di avviare una chiamata API a pagamento, serve comunque l'approvazione di spesa prevista dal progetto Formalife.
EOF
