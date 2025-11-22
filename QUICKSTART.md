# 5-Minute Quick Start

Get the demo running in 5 minutes!

## Prerequisites Check

```bash
# Check Docker
docker --version

# Check Node.js
node --version  # Should be 18+

# Check Python
python3 --version  # Should be 3.10+
```

## Quick Setup

```bash
# 1. Setup (installs dependencies)
make setup

# 2. Create .env file (if not created automatically)
# Copy content from ENV_VARIABLES.md to .env
# Update EVM_PRIVATE_KEY with a Ganache account private key

# 3. Start Fabric network (Terminal 1)
make start-fabric
# Wait ~30 seconds for network to be ready

# 4. Start EVM node (Terminal 2)
make start-evm

# 5. Deploy contracts (Terminal 3)
cd contracts
npm install
npm run deploy:local
cd ..

# 6. Start backend (Terminal 4)
make start-backend

# 7. Start frontend (Terminal 5)
make start-frontend
```

## Verify It Works

1. **Frontend**: Open http://localhost:3000
   - Should see dashboard
   - Click "Connect Wallet" to connect MetaMask

2. **Backend API**: Open http://localhost:8000/docs
   - Should see Swagger UI
   - Try the `/health` endpoint

3. **Create an Asset**:
   - Go to "Assets" page
   - Fill in form (e.g., Asset ID: TEST001)
   - Submit

4. **Mint Tokens**:
   - Go to "Tokens" page
   - Connect wallet first
   - Mint ERC20 or ERC721 tokens

## Troubleshooting

**Fabric not starting?**
```bash
cd infrastructure/fabric
docker-compose logs
```

**Contracts not deploying?**
- Check Ganache is running: `docker ps | grep ganache`
- Verify EVM_RPC_URL in .env

**Backend errors?**
- Check .env file exists
- Verify all services are running
- Check backend logs

## Next Steps

- Read full README.md for architecture details
- Explore API at http://localhost:8000/docs
- Check monitoring at http://localhost:9090

