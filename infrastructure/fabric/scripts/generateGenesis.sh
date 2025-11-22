#!/bin/bash

set -e

echo "Generating genesis block and channel artifacts..."

# Check if configtxgen exists
if ! command -v configtxgen &> /dev/null; then
    echo "configtxgen not found. Please install Hyperledger Fabric binaries."
    echo "Download from: https://github.com/hyperledger/fabric/releases"
    exit 1
fi

# Create channel-artifacts directory
mkdir -p channel-artifacts

# Set FABRIC_CFG_PATH
export FABRIC_CFG_PATH=$PWD

# Generate genesis block
configtxgen -profile SupplyChainGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Generate channel creation transaction
configtxgen -profile SupplyChainChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID supplychain

# Generate anchor peer updates
configtxgen -profile SupplyChainChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID supplychain -asOrg Org1MSP
configtxgen -profile SupplyChainChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID supplychain -asOrg Org2MSP
configtxgen -profile SupplyChainChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID supplychain -asOrg Org3MSP

echo "Genesis block and channel artifacts generated successfully!"

