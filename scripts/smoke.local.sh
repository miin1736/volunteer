#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-3000}

echo "==> Installing deps"
npm ci || npm install

echo "==> Building"
npm run build

echo "==> Starting server"
npm run start &> .smoke_next.log &
PID=$!
trap "kill $PID || true" EXIT

echo "==> Waiting for server :$PORT ..."
for i in {1..90}; do
  if curl -sf "http://localhost:$PORT" >/dev/null; then break; fi
  sleep 1
done

echo "==> Landing page check"
code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/BrandA/down")
echo "GET /BrandA/down -> $code"
test "$code" = "200" || { echo "Server log:"; tail -n +1 .smoke_next.log || true; exit 1; }

echo "==> Filter/sort check"
code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/BrandA/down?downRatio=90-10&sort=priceDesc")
echo "GET /BrandA/down?downRatio=90-10&sort=priceDesc -> $code"
test "$code" = "200" || { echo "Server log:"; tail -n +1 .smoke_next.log || true; exit 1; }

echo "==> JSON-LD presence check"
page=$(curl -s --compressed "http://localhost:$PORT/BrandA/down" | tr -d $'\r')
echo "$page" | grep -qi 'application/ld+json' || { echo "First 200 lines:"; echo "$page" | sed -n '1,200p'; echo "Server log:"; tail -n +1 .smoke_next.log || true; exit 1; }
echo "JSON-LD OK"

echo "==> Outbound redirect check (GET header dump)"
loc=$(curl -s -D - -o /dev/null "http://localhost:$PORT/api/out?to=https://example.com&pid=ex-001" \
  | tr -d $'\r' \
  | awk 'tolower($0) ~ /^location:/ {sub(/^[^:]*:[[:space:]]*/, "", $0); print; exit}')
echo "Location: $loc"
echo "$loc" | grep -q 'subId=ewall_ex-001' || { echo "Server log:"; tail -n +1 .smoke_next.log || true; exit 1; }
echo "Redirect OK"

echo "==> Feed parser check"
if ! npx --yes ts-node -v >/dev/null 2>&1; then
  npm i -D ts-node typescript
fi
npx ts-node --esm scripts/parseFeeds.ts data/sample-products.json out/products.json
test -f out/products.json && echo "Feed parser OK"

echo "==> SMOKE PASSED"