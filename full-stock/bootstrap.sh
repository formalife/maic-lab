#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="$(tr -d '[:space:]' < "$LAB_ROOT/full-stock/UPSTREAM_PIN")"
UPSTREAM_REPO="https://github.com/THU-MAIC/OpenMAIC.git"
TARGET="${1:-$HOME/Downloads/OpenMAIC-full-stock}"
MARKER="# >>> FORMALIFE MAIC-LAB FULL-STOCK OVERLAY >>>"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git non trovato." >&2
  exit 1
fi

if [[ -e "$TARGET" && ! -d "$TARGET/.git" ]]; then
  echo "ERROR: $TARGET esiste ma non è un repository Git." >&2
  exit 1
fi

if [[ ! -d "$TARGET/.git" ]]; then
  echo "Cloning OpenMAIC into: $TARGET"
  git clone "$UPSTREAM_REPO" "$TARGET"
fi

cd "$TARGET"

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$REMOTE_URL" != "$UPSTREAM_REPO" && "$REMOTE_URL" != "git@github.com:THU-MAIC/OpenMAIC.git" ]]; then
  echo "ERROR: $TARGET non punta a THU-MAIC/OpenMAIC (origin=$REMOTE_URL)." >&2
  exit 1
fi

git fetch origin --tags
if ! git cat-file -e "$PIN^{commit}" 2>/dev/null; then
  echo "ERROR: upstream pin $PIN non disponibile dopo fetch." >&2
  exit 1
fi

git checkout --detach "$PIN"

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi

if ! grep -Fq "$MARKER" .env.local; then
  {
    printf '\n%s\n' "$MARKER"
    cat "$LAB_ROOT/full-stock/openmaic-stock.env.example"
    printf '# <<< FORMALIFE MAIC-LAB FULL-STOCK OVERLAY <<<\n'
  } >> .env.local
else
  echo "Overlay già presente in .env.local; non lo duplico."
fi

cat <<EOF

BOOTSTRAP OK
Upstream pin: $PIN
OpenMAIC path: $TARGET

Percorso Formalife corrente: ZERO COST / LLM LOCALE.
Prossimo step:

  bash "$LAB_ROOT/full-stock/configure-ollama.sh" "$TARGET"

L'helper installa/avvia Ollama se possibile, seleziona un Qwen3 adatto alla RAM,
verifica tool calling localmente e vincola OpenMAIC al provider locale.
Nessuna API key a pagamento è necessaria.
EOF
