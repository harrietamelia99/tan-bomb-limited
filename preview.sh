#!/usr/bin/env bash
# Local preview server for the Tan Bomb theme (no Shopify required).
# Mirrors vercel.json clean URLs so /products/... and /shop work.
PORT="${1:-3456}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  Tan Bomb theme preview"
echo "  ---------------------"
echo "  Open: http://localhost:${PORT}/"
echo "        http://localhost:${PORT}/shop/"
echo "        http://localhost:${PORT}/products/cherry-whip/"
echo "  Press Ctrl+C to stop"
echo ""

cd "$DIR" && python3 - "$PORT" <<'PY'
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1])

REWRITES = {
    "/": "/preview/index.html",
    "/shop": "/shop/index.html",
    "/shop/": "/shop/index.html",
    "/privacy": "/preview/privacy.html",
    "/privacy/": "/preview/privacy.html",
    "/products/cherry-whip": "/products/cherry-whip/index.html",
    "/products/cherry-whip/": "/products/cherry-whip/index.html",
    "/products/vanilla-creme": "/products/vanilla-creme/index.html",
    "/products/vanilla-creme/": "/products/vanilla-creme/index.html",
    "/products/christmas-special": "/products/christmas-special/index.html",
    "/products/christmas-special/": "/products/christmas-special/index.html",
}


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path, _, query = self.path.partition("?")
        dest = REWRITES.get(path)
        if dest:
            self.path = dest + (("?" + query) if query else "")
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


server = ThreadingHTTPServer(("", PORT), Handler)
print("Serving on http://localhost:%s/" % PORT, flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.", flush=True)
PY
