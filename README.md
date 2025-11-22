# Decentralized Green Supply Chain Demo

[![CI](https://github.com/your-org/decentralized-green-supplychain-demo/workflows/CI/badge.svg)](https://github.com/your-org/decentralized-green-supplychain-demo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack, open-source demo implementing a consortium Hyperledger Fabric-based (permissioned) blockchain for supply-chain asset tracking and tokenization, plus optional EVM-compatible token contracts for public demo. Focus: security, modularity, energy efficiency, and developer-friendly documentation.

## 🎯 Features

- **Hyperledger Fabric v2.x** - Permissioned blockchain network with 3 organizations
- **EVM Compatibility** - ERC20 and ERC721 token contracts for interoperability
- **FastAPI Backend** - Python backend with REST API
- **React Frontend** - TypeScript frontend with Ethers.js integration
- **Docker & Docker Compose** - Easy local development setup
- **CI/CD** - GitHub Actions workflows for testing and security
- **Monitoring** - Prometheus and Grafana integration
- **Security** - Slither, Mythril, and Echidna configurations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│              (Ethers.js, WalletConnect)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│         (Fabric SDK, Web3.py, REST API)                      │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│ Hyperledger Fabric   │    │   EVM Network (Ganache)      │
│  (3 Orgs, Raft)      │    │   (ERC20, ERC721)             │
└──────────────────────┘    └──────────────────────────────┘
```

### Network Topology

- **Hyperledger Fabric**: 3 organizations (Org1, Org2, Org3), 1 orderer, Raft consensus
- **EVM Network**: Ganache local test network (chainId: 1337)
- **Consensus**: Raft (energy-efficient, no mining required)

### Why Green?

This implementation uses **Raft consensus** instead of Proof of Work, making it:
- **Energy Efficient**: No mining, minimal computational overhead
- **Fast**: Sub-second transaction finality
- **Scalable**: Handles high transaction throughput
- **Permissioned**: Only authorized organizations can participate

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.10+
- Make (optional, but recommended)
- Hyperledger Fabric binaries (for crypto generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/decentralized-green-supplychain-demo.git
   cd decentralized-green-supplychain-demo
   ```

2. **Setup environment**
   ```bash
   make setup
   ```
   This will:
   - Copy `.env.example` to `.env`
   - Install Python dependencies
   - Install Node.js dependencies for frontend and contracts

3. **Start Hyperledger Fabric network**
   ```bash
   make start-fabric
   ```
   This will:
   - Generate crypto material
   - Generate genesis block
   - Start Docker containers
   - Create channel `supplychain`
   - Deploy chaincode `assetcc`

4. **Start EVM test node**
   ```bash
   make start-evm
   ```

5. **Deploy contracts** (in a new terminal)
   ```bash
   cd contracts
   npm run deploy:local
   ```

6. **Start backend** (in a new terminal)
   ```bash
   make start-backend
   ```
   Backend will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

7. **Start frontend** (in a new terminal)
   ```bash
   make start-frontend
   ```
   Frontend will be available at `http://localhost:3000`

## 📋 Acceptance Criteria Checklist

- [x] `make setup` installs dependencies and creates `.env`
- [x] `make start-fabric` launches 3-org Fabric network with channel `supplychain` and chaincode `assetcc`
- [x] `make start-evm` launches local Ganache for EVM demo
- [x] `make start-backend` launches FastAPI server with Fabric and EVM integration
- [x] `make start-frontend` opens React app with asset registration, token minting, and transfer flows
- [x] `make test` runs pytest for backend and Hardhat tests for contracts
- [x] CI pipeline includes security checks (Slither/Mythril)

## 📁 Project Structure

```
.
├── infrastructure/
│   ├── fabric/          # Hyperledger Fabric setup
│   │   ├── docker-compose.yaml
│   │   ├── configtx.yaml
│   │   ├── crypto-config.yaml
│   │   └── scripts/      # Network setup scripts
│   └── evm/             # EVM test node (Ganache)
│       └── docker-compose.yaml
├── contracts/           # Solidity contracts
│   ├── contracts/
│   │   ├── erc20/      # ERC20 token
│   │   └── erc721/     # ERC721 NFT
│   ├── test/           # Hardhat tests
│   └── scripts/        # Deployment scripts
├── chaincode/          # Fabric chaincode
│   ├── index.js        # Asset registry chaincode
│   └── test/           # Chaincode tests
├── backend/             # FastAPI backend
│   ├── main.py         # API endpoints
│   ├── services/       # Fabric and EVM services
│   └── tests/          # Backend tests
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/     # Dashboard, AssetRegister, TokenMint, etc.
│   │   └── services/  # API and wallet services
│   └── public/
├── ci/                 # CI/CD workflows
│   └── .github/workflows/
├── monitoring/         # Prometheus & Grafana configs
│   ├── prometheus/
│   └── grafana/
├── security/           # Security tooling configs
│   ├── slither.config.json
│   ├── mythril.config.yml
│   └── echidna/
└── Makefile            # Build automation

```

## 🔌 API Endpoints

### Asset Management (Fabric)

- `POST /api/assets/create` - Create a new asset
  ```json
  {
    "orgId": "Org1",
    "assetId": "ASSET001",
    "metadata": {"name": "Product", "origin": "Country"}
  }
  ```

- `GET /api/assets/{assetId}` - Get asset details
- `POST /api/assets/{assetId}/transfer` - Transfer asset ownership
- `GET /api/assets` - Get all assets

### Token Management (EVM)

- `POST /api/tokens/erc20/mint` - Mint ERC20 tokens
  ```json
  {
    "to": "0x...",
    "amount": "1000"
  }
  ```

- `POST /api/tokens/erc721/mint` - Mint ERC721 NFT
  ```json
  {
    "to": "0x...",
    "metadataUri": "https://example.com/metadata/1"
  }
  ```

- `GET /api/tokens/erc20/balance/{address}` - Get ERC20 balance

### Ledger

- `GET /api/ledger/txs?assetId={assetId}` - Get transaction history

## 🧪 Testing

### Run all tests
```bash
make test
```

### Backend tests
```bash
cd backend
pytest tests/ -v
```

### Contract tests
```bash
cd contracts
npm run test
```

### Security checks
```bash
make lint
```

## 🔒 Security

### Security Tools

- **Slither**: Static analysis for Solidity
- **Mythril**: Security analysis for smart contracts
- **Echidna**: Fuzz testing for contracts

### Running Security Checks

```bash
# Slither
cd contracts
slither .

# Mythril
mythril analyze contracts/erc20/GreenSupplyToken.sol --solv 0.8.20

# Echidna (requires setup)
echidna-test contracts/erc20/GreenSupplyToken.sol --config security/echidna.config.yml
```

### Security Checklist

- [ ] All contracts use OpenZeppelin libraries
- [ ] No hardcoded private keys
- [ ] Environment variables for sensitive data
- [ ] Input validation on all endpoints
- [ ] Access control on chaincode functions
- [ ] Regular security audits recommended

## 📊 Monitoring

### Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (admin/admin)

### Metrics

- Fabric peer metrics (CPU, memory, transaction throughput)
- Block latency and chain size
- EVM node metrics (gas price, block height)
- Transaction errors and success rates

## 🛠️ Development

### Adding a New Organization

1. Update `infrastructure/fabric/crypto-config.yaml`
2. Update `infrastructure/fabric/configtx.yaml`
3. Update `infrastructure/fabric/docker-compose.yaml`
4. Regenerate crypto material: `./scripts/generateCrypto.sh`
5. Regenerate channel artifacts: `./scripts/generateGenesis.sh`
6. Restart network: `make stop && make start-fabric`

### Extending Token Rules

1. Modify contracts in `contracts/contracts/`
2. Update tests in `contracts/test/`
3. Run tests: `npm run test`
4. Deploy: `npm run deploy:local`

### Running an Audit

1. Review security checklist in README
2. Run all security tools: `make lint`
3. Review contract code for common vulnerabilities
4. Test edge cases and error handling
5. Document findings in `SECURITY.md`

## 📚 Documentation

- [Architecture Diagram](docs/architecture.md) (coming soon)
- [Developer Guide](docs/developer-guide.md) (coming soon)
- [API Documentation](http://localhost:8000/docs) (when backend is running)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hyperledger Fabric community
- OpenZeppelin for secure contract libraries
- FastAPI and React communities

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review code comments

## 🔄 Version History

- **v1.0.0** - Initial release with Fabric network, EVM contracts, FastAPI backend, and React frontend

---

**Note**: This is a demo project for educational purposes. For production use, conduct thorough security audits and follow best practices for key management and network configuration.
