#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"
ENV_FILE="$TARGET/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE non trovato. Esegui prima full-stock/bootstrap.sh." >&2
  exit 1
fi

# Use the smallest Qwen3 variant that still advertises tool support upstream.
# The existing configure helper performs a real local tool-call gate before
# accepting it, so this fails closed if the model/runtime combination regresses.
OPENMAIC_LOCAL_MODEL=qwen3:1.7b \
  bash "$LAB_ROOT/full-stock/configure-ollama.sh" "$TARGET"

python3 - "$ENV_FILE" <<'PY'
from __future__ import annotations
import json
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
text = path.read_text()
lines = text.splitlines()
out: list[str] = []
model_routes = None

for line in lines:
    if line.startswith("MODEL_ROUTES='") and line.endswith("'"):
        raw = line[len("MODEL_ROUTES='"):-1]
        routes = json.loads(raw)
        driver = routes.get("maic-agent-driver")
        if not isinstance(driver, dict):
            raise SystemExit("maic-agent-driver route missing after Ollama configuration")
        driver["contextWindow"] = 8192
        routes["maic-agent-driver"] = driver
        model_routes = json.dumps(routes, separators=(",", ":"))
        out.append(f"MODEL_ROUTES='{model_routes}'")
        continue
    if re.match(r'^(FORMALIFE_RAM_SAFE_MODE|OPENMAIC_AGENT_RUNTIME_MAX_CONCURRENT|PARALLEL_SCENE_CONCURRENCY)=', line):
        continue
    out.append(line)

if model_routes is None:
    raise SystemExit("MODEL_ROUTES not found in .env.local")

out += [
    "FORMALIFE_RAM_SAFE_MODE=1",
    "OPENMAIC_AGENT_RUNTIME_MAX_CONCURRENT=1",
    "PARALLEL_SCENE_CONCURRENCY=1",
]
path.write_text("\n".join(out) + "\n")
PY
chmod 600 "$ENV_FILE"

cat <<EOF

RAM-SAFE CONFIG OK
OpenMAIC path: $TARGET
Model: ollama:qwen3:1.7b
Agent context budget: 8192
Agent runtime concurrency: 1
Scene generation concurrency: 1
Cloud API keys: DISABLED (inherited zero-cost guard)
API cost: 0

Do NOT restart pnpm dev on the low-memory Mac.
Use the prebuilt ARM64 runtime produced by the RAM-safe workflow.
EOF
