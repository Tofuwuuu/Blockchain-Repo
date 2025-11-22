# Environment Variables Reference

Copy this content to create your `.env` file:

```bash
# Hyperledger Fabric Configuration
FABRIC_NETWORK_NAME=supplychain-network
FABRIC_CHANNEL_NAME=supplychain
FABRIC_CHAINCODE_NAME=assetcc
FABRIC_CHAINCODE_VERSION=1.0
FABRIC_PEER_ADDRESS=localhost:7051
FABRIC_ORDERER_ADDRESS=localhost:7050
FABRIC_ORG_NAME=Org1
FABRIC_USER_NAME=Admin
FABRIC_MSP_ID=Org1MSP

# EVM Configuration
EVM_RPC_URL=http://localhost:8545
EVM_CHAIN_ID=1337
EVM_PRIVATE_KEY=your_private_key_here
EVM_ACCOUNT_ADDRESS=your_account_address_here

# ERC20 Token Configuration
ERC20_TOKEN_NAME=GreenSupplyToken
ERC20_TOKEN_SYMBOL=GST
ERC20_TOKEN_DECIMALS=18

# ERC721 Token Configuration
ERC721_TOKEN_NAME=GreenSupplyNFT
ERC721_TOKEN_SYMBOL=GSNFT

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_DEBUG=true
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Frontend Configuration
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_EVM_RPC_URL=http://localhost:8545
REACT_APP_CHAIN_ID=1337

# Database (optional, for indexing)
DATABASE_URL=sqlite:///./supplychain.db

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
```

## Getting EVM Private Key from Ganache

When Ganache starts, it displays a list of accounts with their private keys. Use the first account's private key for `EVM_PRIVATE_KEY` and its address for `EVM_ACCOUNT_ADDRESS`.

Alternatively, you can view accounts in Ganache UI at http://localhost:8545 (if Ganache UI is enabled).

## Security Note

**Never commit your `.env` file to version control!** It should be in `.gitignore` (which it is).

