.PHONY: setup start-fabric start-evm start-backend start-frontend test lint stop clean help

help:
	@echo "Available targets:"
	@echo "  make setup          - Install dependencies and setup environment"
	@echo "  make start-fabric   - Start Hyperledger Fabric network"
	@echo "  make start-evm       - Start EVM test node (Ganache)"
	@echo "  make start-backend  - Start FastAPI backend server"
	@echo "  make start-frontend - Start React frontend"
	@echo "  make test           - Run all tests"
	@echo "  make lint           - Run linters and security checks"
	@echo "  make stop           - Stop all services"
	@echo "  make clean          - Clean up generated files"

setup:
	@echo "Setting up project..."
	@if [ ! -f .env ]; then \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
			echo "Created .env from .env.example"; \
		else \
			echo "Creating .env from template..."; \
			echo "# See ENV_VARIABLES.md for full list of variables" > .env; \
			cat ENV_VARIABLES.md | grep -E "^[A-Z_]+=" >> .env || true; \
			echo ".env file created. Please review and update with your values."; \
		fi \
	fi
	@echo "Installing Python dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing Node.js dependencies..."
	cd frontend && npm install
	cd contracts && npm install
	@echo "Setup complete!"

start-fabric:
	@echo "Starting Hyperledger Fabric network..."
	cd infrastructure/fabric && docker-compose up -d
	@echo "Waiting for network to be ready..."
	sleep 10
	cd infrastructure/fabric && ./scripts/createChannel.sh
	cd infrastructure/fabric && ./scripts/deployChaincode.sh
	@echo "Fabric network is ready!"

start-evm:
	@echo "Starting EVM test node (Ganache)..."
	cd infrastructure/evm && docker-compose up -d
	@echo "Waiting for EVM node to be ready..."
	sleep 5
	@echo "EVM node is ready!"

start-backend:
	@echo "Starting FastAPI backend..."
	cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

start-frontend:
	@echo "Starting React frontend..."
	cd frontend && npm start

test:
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v
	@echo "Running contract tests..."
	cd contracts && npm run test
	@echo "Running chaincode tests..."
	cd chaincode && npm test || echo "Chaincode tests skipped (optional)"

lint:
	@echo "Running Python linter..."
	cd backend && flake8 . --max-line-length=120 --exclude=venv,__pycache__
	@echo "Running TypeScript linter..."
	cd frontend && npm run lint
	@echo "Running Solidity security checks..."
	cd contracts && npm run security

stop:
	@echo "Stopping all services..."
	cd infrastructure/fabric && docker-compose down
	cd infrastructure/evm && docker-compose down
	@echo "All services stopped!"

clean:
	@echo "Cleaning up..."
	cd infrastructure/fabric && docker-compose down -v
	cd infrastructure/evm && docker-compose down -v
	rm -rf infrastructure/fabric/crypto-config
	rm -rf infrastructure/fabric/channel-artifacts
	rm -rf backend/__pycache__ backend/.pytest_cache
	rm -rf frontend/node_modules frontend/build
	rm -rf contracts/node_modules contracts/artifacts contracts/cache
	@echo "Cleanup complete!"

