import os
import json
import subprocess
from typing import Dict, Any, Optional, List

class FabricService:
    """Service for interacting with Hyperledger Fabric network"""
    
    def __init__(self):
        self.peer_address = os.getenv("FABRIC_PEER_ADDRESS", "localhost:7051")
        self.orderer_address = os.getenv("FABRIC_ORDERER_ADDRESS", "localhost:7050")
        self.channel_name = os.getenv("FABRIC_CHANNEL_NAME", "supplychain")
        self.chaincode_name = os.getenv("FABRIC_CHAINCODE_NAME", "assetcc")
        self.org_name = os.getenv("FABRIC_ORG_NAME", "Org1")
        self.msp_id = os.getenv("FABRIC_MSP_ID", "Org1MSP")
    
    async def _invoke_chaincode(self, function_name: str, *args) -> Dict[str, Any]:
        """Invoke chaincode function using peer CLI"""
        try:
            # Construct peer command
            cmd = [
                "docker", "exec", f"peer0.{self.org_name.lower()}.example.com",
                "peer", "chaincode", "invoke",
                "-o", self.orderer_address,
                "--tls", "--cafile", "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem",
                "-C", self.channel_name,
                "-n", self.chaincode_name,
                "-c", json.dumps({
                    "function": function_name,
                    "Args": list(args)
                })
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"Chaincode invocation failed: {result.stderr}")
            
            return {"status": "success", "output": result.stdout}
        except Exception as e:
            raise Exception(f"Error invoking chaincode: {str(e)}")
    
    async def _query_chaincode(self, function_name: str, *args) -> Dict[str, Any]:
        """Query chaincode function using peer CLI"""
        try:
            cmd = [
                "docker", "exec", f"peer0.{self.org_name.lower()}.example.com",
                "peer", "chaincode", "query",
                "-C", self.channel_name,
                "-n", self.chaincode_name,
                "-c", json.dumps({
                    "function": function_name,
                    "Args": list(args)
                })
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"Chaincode query failed: {result.stderr}")
            
            output = result.stdout.strip()
            try:
                return json.loads(output)
            except json.JSONDecodeError:
                return {"raw": output}
        except Exception as e:
            raise Exception(f"Error querying chaincode: {str(e)}")
    
    async def create_asset(self, org_id: str, asset_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new asset on the ledger"""
        metadata_str = json.dumps(metadata)
        result = await self._invoke_chaincode("CreateAsset", asset_id, org_id, metadata_str)
        return result
    
    async def read_asset(self, asset_id: str) -> Dict[str, Any]:
        """Read an asset from the ledger"""
        result = await self._query_chaincode("ReadAsset", asset_id)
        return result
    
    async def transfer_asset(self, asset_id: str, new_owner: str) -> Dict[str, Any]:
        """Transfer asset ownership"""
        result = await self._invoke_chaincode("TransferAsset", asset_id, new_owner)
        return result
    
    async def get_all_assets(self) -> List[Dict[str, Any]]:
        """Get all assets from the ledger"""
        result = await self._query_chaincode("GetAllAssets")
        if isinstance(result, dict) and "raw" in result:
            try:
                return json.loads(result["raw"])
            except:
                return []
        return result if isinstance(result, list) else [result]
    
    async def get_asset_history(self, asset_id: str) -> List[Dict[str, Any]]:
        """Get transaction history for an asset"""
        result = await self._query_chaincode("GetAssetHistory", asset_id)
        if isinstance(result, dict) and "raw" in result:
            try:
                return json.loads(result["raw"])
            except:
                return []
        return result if isinstance(result, list) else [result]

