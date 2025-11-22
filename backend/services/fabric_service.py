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
        container_name = f"peer0.{self.org_name.lower()}.example.com"
        
        # Check if container is running
        if not self._check_docker_container(container_name):
            raise Exception(
                f"Fabric network is not running. Container '{container_name}' not found. "
                f"Please start the Fabric network with: make start-fabric"
            )
        
        try:
            # Construct peer command
            cmd = [
                "docker", "exec", container_name,
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
                error_msg = result.stderr or result.stdout
                raise Exception(f"Chaincode invocation failed: {error_msg}")
            
            return {"status": "success", "output": result.stdout}
        except subprocess.TimeoutExpired:
            raise Exception("Invocation timed out. Fabric network may be slow or unresponsive.")
        except FileNotFoundError:
            raise Exception("Docker not found. Please install Docker and ensure it's running.")
        except Exception as e:
            if "Fabric network is not running" in str(e):
                raise
            raise Exception(f"Error invoking chaincode: {str(e)}")
    
    def _check_docker_container(self, container_name: str) -> bool:
        """Check if Docker container is running"""
        try:
            result = subprocess.run(
                ["docker", "ps", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return container_name in result.stdout
        except:
            return False
    
    async def _query_chaincode(self, function_name: str, *args) -> Dict[str, Any]:
        """Query chaincode function using peer CLI"""
        container_name = f"peer0.{self.org_name.lower()}.example.com"
        
        # Check if container is running
        if not self._check_docker_container(container_name):
            raise Exception(
                f"Fabric network is not running. Container '{container_name}' not found. "
                f"Please start the Fabric network with: make start-fabric"
            )
        
        try:
            cmd = [
                "docker", "exec", container_name,
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
                error_msg = result.stderr or result.stdout
                raise Exception(f"Chaincode query failed: {error_msg}")
            
            output = result.stdout.strip()
            if not output:
                return []
            
            try:
                return json.loads(output)
            except json.JSONDecodeError:
                return {"raw": output}
        except subprocess.TimeoutExpired:
            raise Exception("Query timed out. Fabric network may be slow or unresponsive.")
        except FileNotFoundError:
            raise Exception("Docker not found. Please install Docker and ensure it's running.")
        except Exception as e:
            if "Fabric network is not running" in str(e):
                raise
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
    
    async def check_network_health(self) -> Dict[str, Any]:
        """Check if Fabric network is healthy and nodes can join"""
        health_status = {
            "network_available": False,
            "nodes": {},
            "channel_exists": False,
            "chaincode_installed": False,
            "errors": []
        }
        
        # Check if Docker is available
        try:
            subprocess.run(["docker", "--version"], capture_output=True, timeout=5)
        except:
            health_status["errors"].append("Docker is not installed or not in PATH")
            return health_status
        
        # Check each organization's peer
        orgs = ["org1", "org2", "org3"]
        for org in orgs:
            container_name = f"peer0.{org}.example.com"
            is_running = self._check_docker_container(container_name)
            
            health_status["nodes"][org] = {
                "container_running": is_running,
                "peer_accessible": False,
                "channel_joined": False,
                "chaincode_installed": False,
                "errors": []
            }
            
            if is_running:
                try:
                    # Try to query peer info
                    result = subprocess.run(
                        ["docker", "exec", container_name, "peer", "node", "status"],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    health_status["nodes"][org]["peer_accessible"] = result.returncode == 0
                    
                    # Check if peer is in channel
                    result = subprocess.run(
                        ["docker", "exec", container_name, "peer", "channel", "list"],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if self.channel_name in result.stdout:
                        health_status["nodes"][org]["channel_joined"] = True
                        health_status["channel_exists"] = True
                    
                    # Check if chaincode is installed
                    result = subprocess.run(
                        ["docker", "exec", container_name, "peer", "lifecycle", "chaincode", "queryinstalled"],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if self.chaincode_name in result.stdout:
                        health_status["nodes"][org]["chaincode_installed"] = True
                        health_status["chaincode_installed"] = True
                        
                except subprocess.TimeoutExpired:
                    health_status["nodes"][org]["errors"].append("Peer query timed out")
                except Exception as e:
                    health_status["nodes"][org]["errors"].append(str(e))
            else:
                health_status["nodes"][org]["errors"].append(f"Container {container_name} is not running")
        
        # Check orderer
        orderer_name = "orderer.example.com"
        orderer_running = self._check_docker_container(orderer_name)
        health_status["orderer"] = {
            "container_running": orderer_running,
            "accessible": False
        }
        
        if orderer_running:
            try:
                result = subprocess.run(
                    ["docker", "exec", orderer_name, "orderer", "version"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                health_status["orderer"]["accessible"] = result.returncode == 0
            except:
                pass
        
        # Overall network status
        running_nodes = sum(1 for node in health_status["nodes"].values() if node["container_running"])
        health_status["network_available"] = (
            running_nodes >= 2 and  # At least 2 peers running
            health_status["orderer"]["container_running"] and
            health_status["channel_exists"]
        )
        
        return health_status
    
    async def get_node_info(self, org_name: str) -> Dict[str, Any]:
        """Get detailed information about a specific node"""
        container_name = f"peer0.{org_name.lower()}.example.com"
        
        info = {
            "container_name": container_name,
            "running": False,
            "peer_version": None,
            "channels": [],
            "installed_chaincodes": [],
            "endorser_role": None,
            "errors": []
        }
        
        if not self._check_docker_container(container_name):
            info["errors"].append(f"Container {container_name} is not running")
            return info
        
        info["running"] = True
        
        try:
            # Get peer version
            result = subprocess.run(
                ["docker", "exec", container_name, "peer", "version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                info["peer_version"] = result.stdout.strip().split('\n')[0]
            
            # Get channels
            result = subprocess.run(
                ["docker", "exec", container_name, "peer", "channel", "list"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'Channels peers has joined:' in line or line.startswith(self.channel_name):
                        info["channels"].append(self.channel_name)
            
            # Get installed chaincodes
            result = subprocess.run(
                ["docker", "exec", container_name, "peer", "lifecycle", "chaincode", "queryinstalled"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if self.chaincode_name in line:
                        info["installed_chaincodes"].append(self.chaincode_name)
            
        except Exception as e:
            info["errors"].append(str(e))
        
        return info

