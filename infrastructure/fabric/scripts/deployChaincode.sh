#!/bin/bash

set -e

CHANNEL_NAME=${CHANNEL_NAME:-supplychain}
CHAINCODE_NAME=${CHAINCODE_NAME:-assetcc}
CHAINCODE_VERSION=${CHAINCODE_VERSION:-1.0}
CHAINCODE_PATH=${CHAINCODE_PATH:-/opt/gopath/src/github.com/chaincode/assetcc}
PEER_ORG1=peer0.org1.example.com:7051
PEER_ORG2=peer0.org2.example.com:9051
PEER_ORG3=peer0.org3.example.com:11051
ORDERER=orderer.example.com:7050

echo "Packaging chaincode ${CHAINCODE_NAME}..."

# Package chaincode for Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_ADDRESS=${PEER_ORG1}
docker exec peer0.org1.example.com peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang node --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

echo "Installing chaincode on Org1 peer..."
docker exec peer0.org1.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

echo "Installing chaincode on Org2 peer..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=${PEER_ORG2}
docker exec peer0.org2.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

echo "Installing chaincode on Org3 peer..."
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_ADDRESS=${PEER_ORG3}
docker exec peer0.org3.example.com peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

echo "Querying installed chaincode..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_ADDRESS=${PEER_ORG1}
PACKAGE_ID=$(docker exec peer0.org1.example.com peer lifecycle chaincode queryinstalled | grep -oP 'Package ID: \K[^,]+')

echo "Approving chaincode for Org1..."
docker exec peer0.org1.example.com peer lifecycle chaincode approveformyorg -o ${ORDERER} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "Approving chaincode for Org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=${PEER_ORG2}
docker exec peer0.org2.example.com peer lifecycle chaincode approveformyorg -o ${ORDERER} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "Approving chaincode for Org3..."
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_ADDRESS=${PEER_ORG3}
docker exec peer0.org3.example.com peer lifecycle chaincode approveformyorg -o ${ORDERER} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "Committing chaincode to channel..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_ADDRESS=${PEER_ORG1}
docker exec peer0.org1.example.com peer lifecycle chaincode commit -o ${ORDERER} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses ${PEER_ORG1} --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses ${PEER_ORG2} --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --peerAddresses ${PEER_ORG3} --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt

echo "Chaincode ${CHAINCODE_NAME} deployed successfully!"

