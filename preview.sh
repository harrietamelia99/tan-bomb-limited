#!/usr/bin/env bash
# Local preview server for the Tan Bomb theme (no Shopify required).
PORT="${1:-3456}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  Tan Bomb theme preview"
echo "  ─────────────────────"
echo "  Open: http://localhost:${PORT}/preview/"
echo "  Press Ctrl+C to stop"
echo ""

cd "$DIR" && python3 -m http.server "$PORT"
