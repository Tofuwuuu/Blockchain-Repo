#!/bin/bash

set -e

CHANNEL_NAME=${CHANNEL_NAME:-supplychain}
PEER_ORG1=peer0.org1.example.com:7051
PEER_ORG2=peer0.org2.example.com:9051
PEER_ORG3=peer0.org3.example.com:11051
ORDERER=orderer.example.com:7050

echo "Creating channel ${CHANNEL_NAME}..."

# Set environment variables for Org1
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCAS_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=${PEER_ORG1}

# Create channel
docker exec peer0.org1.example.com peer channel create -o ${ORDERER} -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "Channel ${CHANNEL_NAME} created successfully!"

# Join Org1 peer
echo "Joining Org1 peer to channel..."
docker exec peer0.org1.example.com peer channel join -b ${CHANNEL_NAME}.block

# Join Org2 peer
echo "Joining Org2 peer to channel..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=${PEER_ORG2}
export CORE_PEER_TLS_ROOTCAS_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp

docker exec peer0.org2.example.com peer channel join -b ${CHANNEL_NAME}.block

# Join Org3 peer
echo "Joining Org3 peer to channel..."
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_ADDRESS=${PEER_ORG3}
export CORE_PEER_TLS_ROOTCAS_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp

docker exec peer0.org3.example.com peer channel join -b ${CHANNEL_NAME}.block

# Update anchor peers
echo "Updating anchor peers..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_ADDRESS=${PEER_ORG1}
docker exec peer0.org1.example.com peer channel update -o ${ORDERER} -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=${PEER_ORG2}
docker exec peer0.org2.example.com peer channel update -o ${ORDERER} -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_ADDRESS=${PEER_ORG3}
docker exec peer0.org3.example.com peer channel update -o ${ORDERER} -c ${CHANNEL_NAME} -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org3MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "Channel setup complete!"

