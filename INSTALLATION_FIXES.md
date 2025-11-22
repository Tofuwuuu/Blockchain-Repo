# Installation Fixes Applied

## Issues Fixed

### 1. Frontend Dependencies
- **Problem**: TypeScript version conflict (v5.3.2 vs react-scripts requirement for v4)
- **Fix**: Updated `frontend/package.json` to use TypeScript 4.9.5
- **Status**: ✅ Fixed - Frontend dependencies installed

### 2. Backend Dependencies  
- **Problem**: pydantic-core required Rust compiler (not available)
- **Fix**: Used flexible pydantic version and installed with pre-built wheels
- **Status**: ✅ Fixed - Backend dependencies installed

## Current Status

✅ **Frontend**: Dependencies installed (with `--legacy-peer-deps`)
✅ **Backend**: Dependencies installed (uvicorn, fastapi, web3, etc.)

## Next Steps to Start the System

### 1. Install Contract Dependencies
```powershell
cd contracts
npm install
```

### 2. Create .env File
Create `.env` in the root directory with content from `ENV_VARIABLES.md`

### 3. Start Services (in order)

**Terminal 1 - Fabric:**
```powershell
cd infrastructure\fabric
docker-compose up -d
# Wait 30 seconds, then run scripts manually if needed
```

**Terminal 2 - EVM:**
```powershell
cd infrastructure\evm
docker-compose up -d
```

**Terminal 3 - Deploy Contracts:**
```powershell
cd contracts
npm run deploy:local
```

**Terminal 4 - Backend:**
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 5 - Frontend:**
```powershell
cd frontend
npm start
```

## Notes

- **fabric-sdk-py**: Not installed (we use docker exec commands instead)
- **Python PATH**: Some scripts installed to user directory, may need full path
- **uvicorn**: Use `python -m uvicorn` if `uvicorn` command not found

## Testing Installation

```powershell
# Test frontend
cd frontend
npm start
# Should open http://localhost:3000

# Test backend  
cd backend
python -m uvicorn main:app --reload
# Should see API at http://localhost:8000/docs
```

