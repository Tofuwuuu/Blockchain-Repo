# System Startup Guide

## 🚀 Quick Start (Step-by-Step)

### Option 1: Automated Startup (Recommended)

**Windows (PowerShell):**
```powershell
.\start-system.ps1
```

**Linux/Mac:**
```bash
chmod +x start-system.sh
./start-system.sh
```

### Option 2: Manual Startup (Step-by-Step)

### Step 1: Initial Setup (One-time only)

```bash
# Install dependencies
make setup

# Create .env file
# Copy the content from ENV_VARIABLES.md and create .env file
# Or manually create .env with these essential variables:
```

Create `.env` file in the root directory:
```bash
# Minimum required variables
FABRIC_CHANNEL_NAME=supplychain
FABRIC_CHAINCODE_NAME=assetcc
FABRIC_ORG_NAME=Org1
FABRIC_MSP_ID=Org1MSP

EVM_RPC_URL=http://localhost:8545
EVM_CHAIN_ID=1337
# Get private key from Ganache after it starts (see Step 3)
EVM_PRIVATE_KEY=your_private_key_here

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_CORS_ORIGINS=http://localhost:3000

REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_EVM_RPC_URL=http://localhost:8545
REACT_APP_CHAIN_ID=1337
```

### Step 2: Start Hyperledger Fabric Network

**Terminal 1:**
```bash
make start-fabric
```

Wait for output: `"Fabric network is ready!"` (takes ~30-60 seconds)

**What this does:**
- Generates crypto material
- Starts Docker containers (orderer + 3 peers)
- Creates channel `supplychain`
- Deploys chaincode `assetcc`

**Verify it's running:**
```bash
docker ps
# You should see: orderer.example.com, peer0.org1.example.com, peer0.org2.example.com, peer0.org3.example.com
```

### Step 3: Start EVM Test Node (Ganache)

**Terminal 2:**
```bash
make start-evm
```

Wait a few seconds for Ganache to start.

**Get a private key:**
1. Ganache runs in Docker, so check logs:
   ```bash
   docker logs ganache
   ```
2. Or access Ganache UI if you have it installed
3. Use the first account's private key
4. Update `.env` file with: `EVM_PRIVATE_KEY=<the_private_key>`

**Verify it's running:**
```bash
docker ps | grep ganache
# Or test connection:
curl http://localhost:8545
```

### Step 4: Deploy Smart Contracts

**Terminal 3:**
```bash
cd contracts
npm install  # If not done already
npm run deploy:local
```

**Note the deployed addresses** - they'll be saved in `contracts/deployments.json`

**Verify deployment:**
```bash
cat contracts/deployments.json
```

### Step 5: Start Backend API

**Terminal 4:**
```bash
make start-backend
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:**
- Open browser: http://localhost:8000/docs
- Try the `/health` endpoint

### Step 6: Start Frontend

**Terminal 5:**
```bash
make start-frontend
```

Wait for: `"Compiled successfully!"`

**Open browser:** http://localhost:3000

## ✅ Verification Checklist

- [ ] Fabric network running (check `docker ps`)
- [ ] Ganache running (check `docker ps | grep ganache`)
- [ ] Contracts deployed (check `contracts/deployments.json` exists)
- [ ] Backend accessible (http://localhost:8000/docs)
- [ ] Frontend accessible (http://localhost:3000)

## 🧪 Test the System

### 1. Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Get all assets (should return empty array initially)
curl http://localhost:8000/api/assets
```

### 2. Test Frontend
1. Open http://localhost:3000
2. Click "Connect Wallet" (requires MetaMask)
3. Go to "Assets" page
4. Create a test asset:
   - Asset ID: `TEST001`
   - Metadata: `{"name": "Test Product", "origin": "USA"}`
5. Submit and verify success

### 3. Test Token Minting
1. Go to "Tokens" page
2. Connect wallet if not connected
3. Mint ERC20 tokens:
   - To: Your wallet address
   - Amount: `1000`
4. Check transaction in MetaMask

## 🛑 Stopping the System

```bash
# Stop all services
make stop

# Or stop individually:
cd infrastructure/fabric && docker-compose down
cd infrastructure/evm && docker-compose down
# Then Ctrl+C in backend and frontend terminals
```

## 🔄 Restarting

If you need to restart:

```bash
# Clean everything
make clean

# Then start again from Step 2
make start-fabric
make start-evm
# ... continue with steps 4-6
```

## 🐛 Troubleshooting

### Fabric network won't start
```bash
# Check if ports are in use
netstat -an | grep 7050
netstat -an | grep 7051

# Check Docker logs
cd infrastructure/fabric
docker-compose logs

# Restart Docker if needed
docker-compose down
docker-compose up -d
```

### Contracts won't deploy
```bash
# Check Ganache is running
docker ps | grep ganache

# Check EVM_RPC_URL in .env
# Should be: http://localhost:8545

# Check private key is set correctly
```

### Backend errors
```bash
# Check .env file exists and has correct values
cat .env

# Check backend logs for specific errors
# Look for Fabric connection errors or EVM connection errors
```

### Frontend won't connect
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS settings in backend
# Should allow: http://localhost:3000

# Check browser console for errors (F12)
```

## 📊 Database Information

**This system does NOT use MongoDB.** Data is stored in:

1. **Hyperledger Fabric Ledger** - For asset records
   - Immutable blockchain storage
   - Distributed across all peers
   - No external database needed

2. **EVM Blockchain (Ganache)** - For token balances
   - Smart contract state
   - ERC20/ERC721 token data
   - No external database needed

3. **Optional SQLite** - For indexing (not implemented yet)
   - Could be added for faster queries
   - Currently, all data comes directly from blockchains

## 🎯 Next Steps After Startup

1. **Explore the API**: http://localhost:8000/docs
2. **Create assets** via frontend
3. **Mint tokens** and transfer them
4. **Check transaction history** in the frontend
5. **Monitor** with Prometheus/Grafana (optional):
   ```bash
   cd monitoring
   docker-compose up -d
   # Access at http://localhost:9090 (Prometheus) and http://localhost:3001 (Grafana)
   ```

