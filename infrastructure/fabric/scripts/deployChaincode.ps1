# PowerShell script to deploy chaincode (Windows)

$CHANNEL_NAME = if ($env:CHANNEL_NAME) { $env:CHANNEL_NAME } else { "supplychain" }
$CHAINCODE_NAME = if ($env:CHAINCODE_NAME) { $env:CHAINCODE_NAME } else { "assetcc" }
$CHAINCODE_VERSION = if ($env:CHAINCODE_VERSION) { $env:CHAINCODE_VERSION } else { "1.0" }
$CHAINCODE_PATH = if ($env:CHAINCODE_PATH) { $env:CHAINCODE_PATH } else { "/opt/gopath/src/github.com/chaincode/assetcc" }
$PEER_ORG1 = "peer0.org1.example.com:7051"
$PEER_ORG2 = "peer0.org2.example.com:9051"
$PEER_ORG3 = "peer0.org3.example.com:11051"
$ORDERER = "orderer.example.com:7050"

Write-Host "Deploying chaincode $CHAINCODE_NAME..." -ForegroundColor Cyan

# Check if containers are running
Write-Host "Checking if Fabric containers are running..." -ForegroundColor Yellow
$containers = @("peer0.org1.example.com", "peer0.org2.example.com", "peer0.org3.example.com", "orderer.example.com")
$allRunning = $true
foreach ($container in $containers) {
    $running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$container$"
    if ($running) {
        Write-Host "✅ $container is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $container is NOT running" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "`n❌ ERROR: Some Fabric containers are not running!" -ForegroundColor Red
    Write-Host "Please start the Fabric network first:" -ForegroundColor Yellow
    Write-Host "  cd infrastructure\fabric" -ForegroundColor White
    Write-Host "  docker-compose up -d" -ForegroundColor White
    Write-Host "`nThen wait 30-60 seconds and try again." -ForegroundColor Yellow
    exit 1
}

# Check if chaincode directory exists
# Get the project root directory
# Script is in: infrastructure/fabric/scripts
# So we need to go: ..\..\..\chaincode from script location

$scriptPath = $PSScriptRoot
$fabricDir = Split-Path $scriptPath
$infrastructureDir = Split-Path $fabricDir
$projectRoot = Split-Path $infrastructureDir
$chaincodeDir = Join-Path $projectRoot "chaincode"

# Also try relative to current working directory
if (-not (Test-Path $chaincodeDir)) {
    $currentDir = Get-Location
    $chaincodeDir = Join-Path $currentDir "chaincode"
    
    # If in infrastructure/fabric, go up 2 levels
    if ($currentDir.Path -like "*infrastructure\fabric*" -or $currentDir.Path -like "*infrastructure/fabric*") {
        $projectRoot = Split-Path (Split-Path $currentDir)
        $chaincodeDir = Join-Path $projectRoot "chaincode"
    }
}

Write-Host "Looking for chaincode directory..." -ForegroundColor Yellow
Write-Host "  Script location: $scriptPath" -ForegroundColor Gray
Write-Host "  Project root: $projectRoot" -ForegroundColor Gray
Write-Host "  Chaincode path: $chaincodeDir" -ForegroundColor Gray

if (-not (Test-Path $chaincodeDir)) {
    Write-Host "`n❌ ERROR: Chaincode directory not found!" -ForegroundColor Red
    Write-Host "`nSearched locations:" -ForegroundColor Yellow
    Write-Host "  1. $chaincodeDir" -ForegroundColor Gray
    Write-Host "  2. $(Join-Path (Get-Location) 'chaincode')" -ForegroundColor Gray
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  - Chaincode directory exists at: <project-root>/chaincode" -ForegroundColor White
    Write-Host "  - Run this script from: infrastructure\fabric directory" -ForegroundColor White
    Write-Host "`nCurrent directory: $(Get-Location)" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Found chaincode directory: $chaincodeDir" -ForegroundColor Green

# Copy chaincode to container (if not already there)
Write-Host "Preparing chaincode..." -ForegroundColor Yellow
$copyResult = docker cp "${chaincodeDir}/." peer0.org1.example.com:/opt/gopath/src/github.com/chaincode/assetcc/ 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Could not copy chaincode to container (may already exist): $copyResult" -ForegroundColor Yellow
}

# Package chaincode
Write-Host "Packaging chaincode..." -ForegroundColor Yellow
$packageResult = docker exec peer0.org1.example.com peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path $CHAINCODE_PATH --lang node --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION} 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to package chaincode" -ForegroundColor Red
    Write-Host "Output: $packageResult" -ForegroundColor Yellow
    exit 1
}

# Install on all peers
Write-Host "Installing chaincode on Org1 peer..." -ForegroundColor Yellow
$install1 = docker exec peer0.org1.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to install chaincode on Org1" -ForegroundColor Red
    Write-Host "Output: $install1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing chaincode on Org2 peer..." -ForegroundColor Yellow
$install2 = docker exec peer0.org2.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to install chaincode on Org2" -ForegroundColor Red
    Write-Host "Output: $install2" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing chaincode on Org3 peer..." -ForegroundColor Yellow
$install3 = docker exec peer0.org3.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to install chaincode on Org3" -ForegroundColor Red
    Write-Host "Output: $install3" -ForegroundColor Yellow
    exit 1
}

# Get package ID
Write-Host "Querying installed chaincode..." -ForegroundColor Yellow
$packageOutput = docker exec peer0.org1.example.com peer lifecycle chaincode queryinstalled 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to query installed chaincode" -ForegroundColor Red
    Write-Host "Output: $packageOutput" -ForegroundColor Yellow
    Write-Host "`nThe chaincode may not have been installed successfully." -ForegroundColor Yellow
    exit 1
}

# Extract package ID from output
$packageMatch = $packageOutput | Select-String -Pattern "Package ID: ([^,\s]+)"
if ($packageMatch -and $packageMatch.Matches.Count -gt 0) {
    $PACKAGE_ID = $packageMatch.Matches[0].Groups[1].Value
} else {
    Write-Host "❌ ERROR: Could not extract package ID from output" -ForegroundColor Red
    Write-Host "Output was:" -ForegroundColor Yellow
    Write-Host $packageOutput -ForegroundColor Gray
    Write-Host "`nThe chaincode installation may have failed. Check the output above." -ForegroundColor Yellow
    exit 1
}

Write-Host "Package ID: $PACKAGE_ID" -ForegroundColor Cyan

# Approve for all orgs
Write-Host "Approving chaincode for Org1..." -ForegroundColor Yellow
docker exec peer0.org1.example.com peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Write-Host "Approving chaincode for Org2..." -ForegroundColor Yellow
docker exec peer0.org2.example.com peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Write-Host "Approving chaincode for Org3..." -ForegroundColor Yellow
docker exec peer0.org3.example.com peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Commit chaincode
Write-Host "Committing chaincode to channel..." -ForegroundColor Yellow
docker exec peer0.org1.example.com peer lifecycle chaincode commit -o $ORDERER --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses $PEER_ORG1 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses $PEER_ORG2 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --peerAddresses $PEER_ORG3 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Chaincode $CHAINCODE_NAME deployed successfully!" -ForegroundColor Green
    Write-Host "Channel: $CHANNEL_NAME" -ForegroundColor Cyan
    Write-Host "Version: $CHAINCODE_VERSION" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Chaincode deployment failed!" -ForegroundColor Red
    exit 1
}

