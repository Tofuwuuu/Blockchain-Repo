# PowerShell script to create Fabric channel (Windows)

$CHANNEL_NAME = if ($env:CHANNEL_NAME) { $env:CHANNEL_NAME } else { "supplychain" }
$PEER_ORG1 = "peer0.org1.example.com:7051"
$PEER_ORG2 = "peer0.org2.example.com:9051"
$PEER_ORG3 = "peer0.org3.example.com:11051"
$ORDERER = "orderer.example.com:7050"

Write-Host "Creating channel $CHANNEL_NAME..." -ForegroundColor Cyan

# Check if containers are running
$containers = @("peer0.org1.example.com", "peer0.org2.example.com", "peer0.org3.example.com", "orderer.example.com")
foreach ($container in $containers) {
    $running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$container$"
    if (-not $running) {
        Write-Host "ERROR: Container $container is not running!" -ForegroundColor Red
        Write-Host "Please start the Fabric network first: docker-compose up -d" -ForegroundColor Yellow
        exit 1
    }
}

# Check if channel artifacts exist
if (-not (Test-Path "channel-artifacts/channel.tx")) {
    Write-Host "ERROR: Channel artifacts not found!" -ForegroundColor Red
    Write-Host "Please run generateGenesis.sh first" -ForegroundColor Yellow
    exit 1
}

# Create channel
Write-Host "Creating channel..." -ForegroundColor Yellow
docker exec peer0.org1.example.com peer channel create -o $ORDERER -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create channel" -ForegroundColor Red
    exit 1
}

# Copy channel block to host (if needed)
docker cp peer0.org1.example.com:/opt/gopath/src/github.com/hyperledger/fabric/${CHANNEL_NAME}.block . 2>$null

# Join Org1 peer
Write-Host "Joining Org1 peer to channel..." -ForegroundColor Yellow
docker exec peer0.org1.example.com peer channel join -b ${CHANNEL_NAME}.block

# Join Org2 peer
Write-Host "Joining Org2 peer to channel..." -ForegroundColor Yellow
docker exec peer0.org2.example.com peer channel join -b ${CHANNEL_NAME}.block

# Join Org3 peer
Write-Host "Joining Org3 peer to channel..." -ForegroundColor Yellow
docker exec peer0.org3.example.com peer channel join -b ${CHANNEL_NAME}.block

# Update anchor peers
Write-Host "Updating anchor peers..." -ForegroundColor Yellow
docker exec peer0.org1.example.com peer channel update -o $ORDERER -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec peer0.org2.example.com peer channel update -o $ORDERER -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec peer0.org3.example.com peer channel update -o $ORDERER -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org3MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Write-Host "`n✅ Channel setup complete!" -ForegroundColor Green
Write-Host "Channel name: $CHANNEL_NAME" -ForegroundColor Cyan
Write-Host "All peers have joined the channel." -ForegroundColor Cyan

