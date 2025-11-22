# Complete Fabric setup script (Windows)
# Run this from infrastructure/fabric directory

Write-Host "🚀 Setting up Hyperledger Fabric Network" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Step 2: Start containers
Write-Host "`n[2/4] Starting Fabric containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if containers are running
$containers = @("peer0.org1.example.com", "peer0.org2.example.com", "peer0.org3.example.com", "orderer.example.com")
$allRunning = $true
foreach ($container in $containers) {
    $running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$container$"
    if ($running) {
        Write-Host "✅ $container is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $container is not running" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "`n⚠️  Some containers are not running. Please check docker-compose logs" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# Step 3: Create channel
Write-Host "`n[3/4] Creating channel..." -ForegroundColor Yellow
if (Test-Path "scripts\createChannel.ps1") {
    & "scripts\createChannel.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Channel creation had issues. You may need to create it manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  createChannel.ps1 not found. Skipping channel creation." -ForegroundColor Yellow
    Write-Host "You may need to create the channel manually." -ForegroundColor Yellow
}

# Step 4: Deploy chaincode
Write-Host "`n[4/4] Deploying chaincode..." -ForegroundColor Yellow
if (Test-Path "scripts\deployChaincode.ps1") {
    & "scripts\deployChaincode.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Chaincode deployment had issues. You may need to deploy it manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  deployChaincode.ps1 not found. Skipping chaincode deployment." -ForegroundColor Yellow
    Write-Host "You may need to deploy chaincode manually." -ForegroundColor Yellow
}

Write-Host "`n✅ Fabric setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Check network health: http://localhost:3000/network" -ForegroundColor White
Write-Host "2. Verify channel: docker exec peer0.org1.example.com peer channel list" -ForegroundColor White
Write-Host "3. Verify chaincode: docker exec peer0.org1.example.com peer lifecycle chaincode querycommitted --channelID supplychain" -ForegroundColor White

