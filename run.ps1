# OmniChat Single-Run PowerShell Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "        Starting OmniChat AI Chatbot Services      " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 0. Free ports
Write-Host "`n[1/4] Checking and freeing ports 8000, 5000, 3000..." -ForegroundColor Yellow
$ports = @(8000, 5000, 3000)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# 1. Start Python FastAPI Backend
Write-Host "[2/4] Starting Python FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\AI PROJECT'; python -m uvicorn main:app --port 8000 --reload"

# 2. Start Express Backend Proxy
Write-Host "[3/4] Starting Express Backend Proxy on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\chatbot_backend'; npm start"

# 3. Start React Frontend
Write-Host "[4/4] Starting React Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\chatbot_frontend'; npm start"

Start-Sleep -Seconds 4

Write-Host "`nOpening browser at http://localhost:3000..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " All 3 services are now running!" -ForegroundColor Green
Write-Host " - FastAPI AI Service: http://localhost:8000" -ForegroundColor White
Write-Host " - Express Proxy:      http://localhost:5000" -ForegroundColor White
Write-Host " - React Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
