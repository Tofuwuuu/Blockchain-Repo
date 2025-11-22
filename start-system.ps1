# PowerShell script to start the system (Windows)

Write-Host "Starting Green Supply Chain Demo System..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    if (Test-Path ENV_VARIABLES.md) {
        # Extract env vars from ENV_VARIABLES.md
        Get-Content ENV_VARIABLES.md | Select-String -Pattern "^[A-Z_]+=" | Out-File .env
        Write-Host ".env file created. Please update EVM_PRIVATE_KEY after Ganache starts." -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: ENV_VARIABLES.md not found. Please create .env manually." -ForegroundColor Red
        exit 1
    }
}

# Step 1: Start Fabric
Write-Host "`n[1/5] Starting Hyperledger Fabric network..." -ForegroundColor Cyan
Set-Location infrastructure/fabric
docker-compose up -d
Start-Sleep -Seconds 15
Write-Host "Fabric network started. Run createChannel.sh and deployChaincode.sh manually if needed." -ForegroundColor Yellow
Set-Location ../..

# Step 2: Start EVM
Write-Host "`n[2/5] Starting EVM test node (Ganache)..." -ForegroundColor Cyan
Set-Location infrastructure/evm
docker-compose up -d
Start-Sleep -Seconds 5
Write-Host "Ganache started. Get private key from: docker logs ganache" -ForegroundColor Yellow
Set-Location ../..

# Step 3: Deploy Contracts
Write-Host "`n[3/5] Deploying smart contracts..." -ForegroundColor Cyan
Set-Location contracts
if (-not (Test-Path node_modules)) {
    npm install
}
npm run deploy:local
Set-Location ..

# Step 4: Start Backend
Write-Host "`n[4/5] Starting backend..." -ForegroundColor Cyan
Write-Host "Starting FastAPI backend in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Step 5: Start Frontend
Write-Host "`n[5/5] Starting frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host "Starting React frontend in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "`n✅ System startup initiated!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Get Ganache private key: docker logs ganache" -ForegroundColor White
Write-Host "2. Update .env with EVM_PRIVATE_KEY" -ForegroundColor White
Write-Host "3. Wait for backend: http://localhost:8000/docs" -ForegroundColor White
Write-Host "4. Wait for frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nTo stop: make stop" -ForegroundColor Cyan

