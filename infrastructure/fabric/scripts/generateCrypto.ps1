# PowerShell script to generate crypto material for Fabric (Windows)
# Note: This requires Fabric binaries (cryptogen tool)

Write-Host "🔐 Generating Crypto Material for Fabric Network" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$scriptDir = Split-Path $PSScriptRoot
$fabricDir = Split-Path $scriptDir
$cryptoConfigPath = Join-Path $fabricDir "crypto-config.yaml"
$outputPath = Join-Path (Split-Path $fabricDir) "crypto-config"

Write-Host "`nChecking for crypto-config.yaml..." -ForegroundColor Yellow
if (-not (Test-Path $cryptoConfigPath)) {
    Write-Host "❌ ERROR: crypto-config.yaml not found at: $cryptoConfigPath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Found: $cryptoConfigPath" -ForegroundColor Green

Write-Host "`nChecking for cryptogen tool..." -ForegroundColor Yellow

# Check if cryptogen is available
$cryptogen = Get-Command cryptogen -ErrorAction SilentlyContinue
if (-not $cryptogen) {
    Write-Host "❌ ERROR: cryptogen tool not found!" -ForegroundColor Red
    Write-Host "`nYou need to install Hyperledger Fabric binaries." -ForegroundColor Yellow
    Write-Host "`nOption 1: Download Fabric binaries from:" -ForegroundColor Cyan
    Write-Host "  https://github.com/hyperledger/fabric/releases" -ForegroundColor White
    Write-Host "`nOption 2: Use Docker to generate crypto (see below)" -ForegroundColor Cyan
    Write-Host "`nOption 3: Use the pre-generated crypto-config if available" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Found cryptogen tool" -ForegroundColor Green

# Generate crypto material
Write-Host "`nGenerating crypto material..." -ForegroundColor Yellow
Write-Host "  Config: $cryptoConfigPath" -ForegroundColor Gray
Write-Host "  Output: $outputPath" -ForegroundColor Gray

cryptogen generate --config=$cryptoConfigPath --output=$outputPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Crypto material generated successfully!" -ForegroundColor Green
    Write-Host "Output directory: $outputPath" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Failed to generate crypto material" -ForegroundColor Red
    exit 1
}

