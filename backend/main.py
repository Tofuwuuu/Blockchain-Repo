from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn

from services.fabric_service import FabricService
from services.evm_service import EVMService

load_dotenv()

app = FastAPI(
    title="Green Supply Chain API",
    description="API for managing supply chain assets on Hyperledger Fabric and EVM",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
fabric_service = FabricService()
evm_service = EVMService()

# Request models
class CreateAssetRequest(BaseModel):
    orgId: str
    assetId: str
    metadata: dict

class MintERC20Request(BaseModel):
    to: str
    amount: str

class MintERC721Request(BaseModel):
    to: str
    tokenId: Optional[int] = None
    metadataUri: str

class TransferAssetRequest(BaseModel):
    assetId: str
    newOwner: str

@app.get("/")
async def root():
    return {"message": "Green Supply Chain API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/network/health")
async def get_network_health():
    """Check Fabric network health and node connectivity"""
    try:
        result = await fabric_service.check_network_health()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/network/node/{org_name}")
async def get_node_info(org_name: str):
    """Get detailed information about a specific node"""
    try:
        result = await fabric_service.get_node_info(org_name)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Asset endpoints (Fabric)
@app.post("/api/assets/create")
async def create_asset(request: CreateAssetRequest):
    """Create a new asset on Fabric ledger"""
    try:
        result = await fabric_service.create_asset(
            org_id=request.orgId,
            asset_id=request.assetId,
            metadata=request.metadata
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets/{asset_id}")
async def get_asset(asset_id: str):
    """Get asset details from Fabric ledger"""
    try:
        result = await fabric_service.read_asset(asset_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/assets/{asset_id}/transfer")
async def transfer_asset(asset_id: str, request: TransferAssetRequest):
    """Transfer asset ownership on Fabric ledger"""
    try:
        result = await fabric_service.transfer_asset(
            asset_id=request.assetId,
            new_owner=request.newOwner
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets")
async def get_all_assets():
    """Get all assets from Fabric ledger"""
    try:
        result = await fabric_service.get_all_assets()
        return {"success": True, "data": result}
    except Exception as e:
        error_msg = str(e)
        # Return 503 (Service Unavailable) if Fabric network is not running
        if "Fabric network is not running" in error_msg or "Container" in error_msg:
            raise HTTPException(status_code=503, detail=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Token endpoints (EVM)
@app.post("/api/tokens/erc20/mint")
async def mint_erc20(request: MintERC20Request):
    """Mint ERC20 tokens on EVM"""
    try:
        result = await evm_service.mint_erc20(
            to_address=request.to,
            amount=request.amount
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tokens/erc721/mint")
async def mint_erc721(request: MintERC721Request):
    """Mint ERC721 NFT on EVM"""
    try:
        result = await evm_service.mint_erc721(
            to_address=request.to,
            token_id=request.tokenId,
            metadata_uri=request.metadataUri
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens/erc20/balance/{address}")
async def get_erc20_balance(address: str):
    """Get ERC20 token balance for an address"""
    try:
        result = await evm_service.get_erc20_balance(address)
        return {"success": True, "data": {"balance": result}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ledger endpoints
@app.get("/api/ledger/txs")
async def get_transactions(assetId: Optional[str] = None):
    """Get transaction history for an asset or all transactions"""
    try:
        if assetId:
            result = await fabric_service.get_asset_history(assetId)
        else:
            result = await fabric_service.get_all_assets()
        return {"success": True, "data": result}
    except Exception as e:
        error_msg = str(e)
        # Return 503 (Service Unavailable) if Fabric network is not running
        if "Fabric network is not running" in error_msg or "Container" in error_msg:
            raise HTTPException(status_code=503, detail=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Blockchain data endpoints
@app.get("/api/blockchain/evm/transactions")
async def get_evm_transactions(limit: int = 50):
    """Get recent EVM blockchain transactions"""
    try:
        result = await evm_service.get_evm_transactions(limit)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blockchain/evm/events")
async def get_smart_contract_events(limit: int = 50):
    """Get smart contract events (mints, transfers)"""
    try:
        result = await evm_service.get_smart_contract_events(limit)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blockchain/tokenized-assets")
async def get_tokenized_assets():
    """Get all tokenized assets (NFTs representing supply chain assets)"""
    try:
        result = await evm_service.get_tokenized_assets()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blockchain/fabric/transactions")
async def get_fabric_transactions():
    """Get all Fabric blockchain transactions"""
    try:
        assets = await fabric_service.get_all_assets()
        transactions = []
        for asset in assets:
            if isinstance(asset, dict):
                history = await fabric_service.get_asset_history(asset.get("assetId", ""))
                if isinstance(history, list):
                    transactions.extend(history)
        return {"success": True, "data": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=os.getenv("BACKEND_DEBUG", "true").lower() == "true"
    )

