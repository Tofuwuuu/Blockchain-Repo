#!/bin/bash

set -e

echo "Starting Hyperledger Fabric network..."

# Generate crypto material if it doesn't exist
if [ ! -d "crypto-config" ]; then
    echo "Generating crypto material..."
    ./scripts/generateCrypto.sh
fi

# Generate genesis block if it doesn't exist
if [ ! -f "channel-artifacts/genesis.block" ]; then
    echo "Generating genesis block..."
    ./scripts/generateGenesis.sh
fi

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for network to be ready..."
sleep 15

echo "Fabric network started successfully!"
echo "You can now run ./scripts/createChannel.sh to create the channel"

