#!/bin/bash
# Bash script to start the system (Linux/Mac)

echo "🚀 Starting Green Supply Chain Demo System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ENV_VARIABLES.md ]; then
        grep -E "^[A-Z_]+=" ENV_VARIABLES.md > .env || true
        echo "✅ .env file created. Please update EVM_PRIVATE_KEY after Ganache starts."
    else
        echo "❌ ERROR: ENV_VARIABLES.md not found. Please create .env manually."
        exit 1
    fi
fi

# Step 1: Start Fabric
echo ""
echo "[1/5] Starting Hyperledger Fabric network..."
cd infrastructure/fabric
docker-compose up -d
echo "⏳ Waiting for network to be ready..."
sleep 15
echo "✅ Fabric network started"
cd ../..

# Step 2: Start EVM
echo ""
echo "[2/5] Starting EVM test node (Ganache)..."
cd infrastructure/evm
docker-compose up -d
sleep 5
echo "✅ Ganache started. Get private key: docker logs ganache"
cd ../..

# Step 3: Deploy Contracts
echo ""
echo "[3/5] Deploying smart contracts..."
cd contracts
if [ ! -d node_modules ]; then
    npm install
fi
npm run deploy:local
cd ..

# Step 4: Start Backend
echo ""
echo "[4/5] Starting backend..."
echo "📝 Backend will run in this terminal. Press Ctrl+C to stop."
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"

# Step 5: Start Frontend
echo ""
echo "[5/5] Starting frontend..."
sleep 3
cd frontend
npm start &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ System startup complete!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000/docs"
echo "   - Ganache: http://localhost:8545"
echo ""
echo "📝 Next steps:"
echo "   1. Get Ganache private key: docker logs ganache"
echo "   2. Update .env with EVM_PRIVATE_KEY"
echo "   3. Restart backend if needed"
echo ""
echo "🛑 To stop: make stop (or Ctrl+C in this terminal)"

# Wait for user interrupt
wait

