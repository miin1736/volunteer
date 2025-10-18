Param([int]$Port=3000)

Write-Host "==> Installing deps"
npm ci 2>$null; if ($LASTEXITCODE -ne 0) { npm install }

Write-Host "==> Building"
npm run build

Write-Host "==> Starting server"
Start-Process -FilePath "npm" -ArgumentList "run start" -NoNewWindow
Start-Sleep -Seconds 3
for ($i=0; $i -lt 60; $i++) {
  try { Invoke-WebRequest "http://localhost:$Port" -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Seconds 1 }
}

Write-Host "==> Landing page check"
$code = (Invoke-WebRequest "http://localhost:$Port/BrandA/down" -UseBasicParsing).StatusCode
Write-Host "GET /BrandA/down -> $code"; if ($code -ne 200) { exit 1 }

Write-Host "==> Filter/sort check"
$code = (Invoke-WebRequest "http://localhost:$Port/BrandA/down?downRatio=90-10&sort=priceDesc" -UseBasicParsing).StatusCode
Write-Host "GET /BrandA/down?downRatio=90-10&sort=priceDesc -> $code"; if ($code -ne 200) { exit 1 }

Write-Host "==> Outbound redirect check"
$resp = Invoke-WebRequest -Uri "http://localhost:$Port/api/out?to=https://example.com&pid=ex-001" -Method Head -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
$loc = $resp.Headers.Location
Write-Host "Location: $loc"
if ($loc -notmatch "subId=ewall_ex-001") { exit 1 }

Write-Host "==> Feed parser check"
npx ts-node --version *> $null; if ($LASTEXITCODE -ne 0) { npm i -D ts-node typescript }
npx ts-node scripts/parseFeeds.ts data/sample-products.json out/products.json
if (-Not (Test-Path "out/products.json")) { exit 1 }

Write-Host "==> SMOKE PASSED"