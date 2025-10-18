Param([int]$Port=3000)

Write-Host "==> Installing deps"
npm ci 2>$null; if ($LASTEXITCODE -ne 0) { npm install }

Write-Host "==> Building"
npm run build

Write-Host "==> Starting server"
$proc = Start-Process -FilePath "npm" -ArgumentList "run start" -PassThru -WindowStyle Hidden
try {
  Write-Host "==> Waiting for server :$Port ..."
  for ($i=0; $i -lt 90; $i++) {
    try { Invoke-WebRequest "http://localhost:$Port" -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Seconds 1 }
  }

  Write-Host "==> Landing page check"
  $resp = Invoke-WebRequest "http://localhost:$Port/BrandA/down" -UseBasicParsing
  Write-Host ("GET /BrandA/down -> {0}" -f $resp.StatusCode)
  if ($resp.StatusCode -ne 200) { exit 1 }

  Write-Host "==> Filter/sort check"
  $resp = Invoke-WebRequest "http://localhost:$Port/BrandA/down?downRatio=90-10&sort=priceDesc" -UseBasicParsing
  Write-Host ("GET /BrandA/down?downRatio=90-10&sort=priceDesc -> {0}" -f $resp.StatusCode)
  if ($resp.StatusCode -ne 200) { exit 1 }

  Write-Host "==> JSON-LD presence check"
  $page = (Invoke-WebRequest "http://localhost:$Port/BrandA/down" -UseBasicParsing).Content
  if ($page -notmatch 'application/ld\+json') {
    $page.Split("`n") | Select-Object -First 200 | ForEach-Object { $_ }
    exit 1
  } else { Write-Host "JSON-LD OK" }

  Write-Host "==> Outbound redirect check (GET, no follow)"
  $resp = $null
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:$Port/api/out?to=https://example.com&pid=ex-001" -Method Get -MaximumRedirection 0 -ErrorAction Stop
  } catch {
    $resp = $_.Exception.Response
  }
  $loc = $resp.Headers['Location']
  Write-Host "Location: $loc"
  if (-not $loc -or ($loc -notmatch "subId=ewall_ex-001")) { exit 1 } else { Write-Host "Redirect OK" }

  Write-Host "==> Feed parser check"
  npx --yes -p ts-node -p typescript node --loader ts-node/esm scripts/parseFeeds.ts data/sample-products.json out/products.json
  if (-Not (Test-Path "out/products.json")) { exit 1 } else { Write-Host "Feed parser OK" }

  Write-Host "==> SMOKE PASSED"
}
finally {
  if ($proc -and -not $proc.HasExited) { $proc.Kill() | Out-Null }
}