# Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables (see `.env.example` for reference):

### Hyperledger Fabric Configuration
```
FABRIC_NETWORK_NAME=supplychain-network
FABRIC_CHANNEL_NAME=supplychain
FABRIC_CHAINCODE_NAME=assetcc
FABRIC_CHAINCODE_VERSION=1.0
FABRIC_PEER_ADDRESS=localhost:7051
FABRIC_ORDERER_ADDRESS=localhost:7050
FABRIC_ORG_NAME=Org1
FABRIC_USER_NAME=Admin
FABRIC_MSP_ID=Org1MSP
```

### EVM Configuration
```
EVM_RPC_URL=http://localhost:8545
EVM_CHAIN_ID=1337
EVM_PRIVATE_KEY=your_private_key_here
EVM_ACCOUNT_ADDRESS=your_account_address_here
```

**Note**: For local development with Ganache, you can use one of the default accounts. Get the private key from Ganache UI or use the first account's private key.

### Backend Configuration
```
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_DEBUG=true
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration
```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_EVM_RPC_URL=http://localhost:8545
REACT_APP_CHAIN_ID=1337
```

## Step-by-Step Setup

### 1. Prerequisites Installation

**On Linux/Mac:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Install Python 3.10+
sudo apt-get install python3.10 python3-pip
```

**On Windows:**
- Install Docker Desktop
- Install Node.js from nodejs.org
- Install Python 3.10+ from python.org

### 2. Hyperledger Fabric Binaries

Download Fabric binaries for your platform:
```bash
# Linux/Mac
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.0

# Add to PATH
export PATH=$PATH:$(pwd)/fabric-samples/bin
```

### 3. Project Setup

```bash
# Clone and setup
git clone <repo-url>
cd decentralized-green-supplychain-demo
make setup
```

### 4. Start Services

**Terminal 1 - Fabric:**
```bash
make start-fabric
# Wait for "Fabric network is ready!"
```

**Terminal 2 - EVM:**
```bash
make start-evm
# Wait for "EVM node is ready!"
```

**Terminal 3 - Deploy Contracts:**
```bash
cd contracts
npm run deploy:local
# Note the deployed addresses
```

**Terminal 4 - Backend:**
```bash
make start-backend
# Backend running on http://localhost:8000
```

**Terminal 5 - Frontend:**
```bash
make start-frontend
# Frontend running on http://localhost:3000
```

### 5. Verify Setup

1. Open http://localhost:3000 - Frontend should load
2. Open http://localhost:8000/docs - API docs should load
3. Connect MetaMask to localhost:8545 (chainId: 1337)
4. Try creating an asset in the frontend
5. Try minting tokens

## Troubleshooting

### Fabric network not starting
- Check Docker is running: `docker ps`
- Check ports 7050, 7051, 9051, 11051 are not in use
- Review logs: `docker-compose -f infrastructure/fabric/docker-compose.yaml logs`

### Contracts not deploying
- Ensure Ganache is running
- Check EVM_RPC_URL in .env
- Verify private key has sufficient balance

### Backend errors
- Check .env file exists and has correct values
- Verify Fabric network is running
- Check backend logs for specific errors

### Frontend not connecting
- Verify backend is running on port 8000
- Check CORS settings in backend
- Open browser console for errors

## Next Steps

- Read the main README.md for architecture details
- Review API documentation at http://localhost:8000/docs
- Explore the frontend pages
- Check monitoring at http://localhost:9090 (Prometheus)

