# Windows-Specific Fixes

## Common Windows Issues and Solutions

### 1. `uvicorn` command not found

**Problem**: On Windows, when Python packages are installed to user directory, scripts might not be in PATH.

**Solution**: Use `python -m uvicorn` instead of just `uvicorn`

```powershell
# ❌ This won't work:
uvicorn main:app --reload

# ✅ Use this instead:
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. `pytest` command not found

**Solution**: Use `python -m pytest` instead

```powershell
# ❌ This might not work:
pytest tests/ -v

# ✅ Use this instead:
python -m pytest tests/ -v
```

### 3. PowerShell doesn't support `&&`

**Problem**: PowerShell doesn't support `&&` for chaining commands.

**Solution**: Use `;` instead or separate commands

```powershell
# ❌ This won't work in PowerShell:
cd backend && python -m uvicorn main:app

# ✅ Use this instead:
cd backend; python -m uvicorn main:app
```

### 4. Make commands might not work

**Problem**: `make` might not be installed on Windows.

**Solution**: Use PowerShell scripts or run commands manually

```powershell
# Option 1: Use the PowerShell script
.\start-system.ps1

# Option 2: Run commands manually (see START_GUIDE.md)
```

### 5. Docker commands need backslashes

**Problem**: Windows uses backslashes for paths.

**Solution**: Use forward slashes in Docker commands (they work on Windows too)

```powershell
# Both work:
docker-compose -f infrastructure/fabric/docker-compose.yaml up
docker-compose -f infrastructure\fabric\docker-compose.yaml up
```

## Quick Reference: Starting Services on Windows

### Backend
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
cd frontend
npm start
```

### Contracts
```powershell
cd contracts
npm run deploy:local
```

### Fabric Network
```powershell
cd infrastructure\fabric
docker-compose up -d
```

### EVM/Ganache
```powershell
cd infrastructure\evm
docker-compose up -d
```

## Adding Python Scripts to PATH (Optional)

If you want to use `uvicorn` directly without `python -m`:

1. Find where Python scripts are installed:
   ```powershell
   python -c "import site; print(site.USER_BASE)"
   ```

2. Add the Scripts folder to PATH:
   - Open System Properties → Environment Variables
   - Add to PATH: `C:\Users\YourName\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_*\LocalCache\local-packages\Python313\Scripts`

3. Restart PowerShell

**Note**: Using `python -m uvicorn` is recommended as it works without PATH changes.

