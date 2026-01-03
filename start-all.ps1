# IntervueAI Startup Script
# Run this script to start all required services

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  IntervueAI Complete Startup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is running
Write-Host "📡 Checking Ollama status..." -ForegroundColor Yellow
$ollamaRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $ollamaRunning = $true
        Write-Host "✅ Ollama is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Ollama not detected - will start it" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting all services..." -ForegroundColor Cyan
Write-Host ""

# Start Ollama if not running
if (-not $ollamaRunning) {
    Write-Host "1️⃣  Starting Ollama service..." -ForegroundColor Magenta
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ollama serve"
    Start-Sleep -Seconds 3
}

# Start Python FastAPI
Write-Host "2️⃣  Starting Python FastAPI (Interview Coach)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python interview_api.py"
Start-Sleep -Seconds 3

# Start Node.js Backend
Write-Host "3️⃣  Starting Node.js Backend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 3

# Start React Frontend
Write-Host "4️⃣  Starting React Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  ✅ All Services Started!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:       http://localhost:5173" -ForegroundColor White
Write-Host "   Node Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   Python API:     http://localhost:8000" -ForegroundColor White
Write-Host "   Ollama:         http://localhost:11434" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Four PowerShell windows will open" -ForegroundColor Yellow
Write-Host "   Keep them running while using the app" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
