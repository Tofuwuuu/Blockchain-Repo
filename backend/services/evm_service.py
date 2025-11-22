import os
import json
from web3 import Web3
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load .env file, but don't fail if it doesn't exist or has encoding issues
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Continuing with environment variables or defaults...")

class EVMService:
    """Service for interacting with EVM-compatible blockchain"""
    
    def __init__(self):
        self.rpc_url = os.getenv("EVM_RPC_URL", "http://localhost:8545")
        self.chain_id = int(os.getenv("EVM_CHAIN_ID", "1337"))
        self.private_key = os.getenv("EVM_PRIVATE_KEY", "")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Load contract addresses from deployments
        self.token_address = None
        self.nft_address = None
        self._load_deployments()
    
    def _load_deployments(self):
        """Load contract addresses from deployments.json"""
        try:
            deployments_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "..",
                "contracts",
                "deployments.json"
            )
            if os.path.exists(deployments_path):
                with open(deployments_path, "r") as f:
                    deployments = json.load(f)
                    self.token_address = deployments.get("token")
                    self.nft_address = deployments.get("nft")
        except Exception as e:
            print(f"Warning: Could not load deployments: {e}")
    
    def _get_account(self):
        """Get account from private key"""
        if not self.private_key:
            raise Exception("EVM_PRIVATE_KEY not set in environment")
        return self.w3.eth.account.from_key(self.private_key)
    
    def _get_contract_abi(self, contract_type: str) -> list:
        """Load contract ABI from artifacts"""
        try:
            artifacts_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "..",
                "contracts",
                "artifacts",
                "contracts",
                contract_type,
                "*.sol",
                "*.json"
            )
            import glob
            files = glob.glob(artifacts_path)
            if files:
                with open(files[0], "r") as f:
                    artifact = json.load(f)
                    return artifact.get("abi", [])
        except Exception as e:
            print(f"Warning: Could not load ABI: {e}")
        return []
    
    async def mint_erc20(self, to_address: str, amount: str) -> Dict[str, Any]:
        """Mint ERC20 tokens"""
        if not self.token_address:
            raise Exception("ERC20 token not deployed. Run contract deployment first.")
        
        account = self._get_account()
        abi = self._get_contract_abi("erc20/GreenSupplyToken.sol")
        
        if not abi:
            raise Exception("Could not load ERC20 ABI")
        
        contract = self.w3.eth.contract(address=self.token_address, abi=abi)
        
        # Build transaction
        amount_wei = self.w3.to_wei(amount, "ether")
        tx = contract.functions.mint(to_address, amount_wei).build_transaction({
            "from": account.address,
            "nonce": self.w3.eth.get_transaction_count(account.address),
            "gas": 100000,
            "gasPrice": self.w3.eth.gas_price,
            "chainId": self.chain_id
        })
        
        # Sign and send
        signed_tx = account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            "txHash": receipt.transactionHash.hex(),
            "blockNumber": receipt.blockNumber,
            "to": to_address,
            "amount": amount
        }
    
    async def mint_erc721(self, to_address: str, token_id: Optional[int], metadata_uri: str) -> Dict[str, Any]:
        """Mint ERC721 NFT"""
        if not self.nft_address:
            raise Exception("ERC721 NFT not deployed. Run contract deployment first.")
        
        account = self._get_account()
        abi = self._get_contract_abi("erc721/GreenSupplyNFT.sol")
        
        if not abi:
            raise Exception("Could not load ERC721 ABI")
        
        contract = self.w3.eth.contract(address=self.nft_address, abi=abi)
        
        # Build transaction
        tx = contract.functions.mint(to_address, metadata_uri).build_transaction({
            "from": account.address,
            "nonce": self.w3.eth.get_transaction_count(account.address),
            "gas": 200000,
            "gasPrice": self.w3.eth.gas_price,
            "chainId": self.chain_id
        })
        
        # Sign and send
        signed_tx = account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get minted token ID from events
        token_id_minted = None
        if receipt.logs:
            for log in receipt.logs:
                try:
                    event = contract.events.NFTMinted().process_log(log)
                    token_id_minted = event.args.tokenId
                    break
                except:
                    pass
        
        return {
            "txHash": receipt.transactionHash.hex(),
            "blockNumber": receipt.blockNumber,
            "to": to_address,
            "tokenId": token_id_minted or token_id,
            "metadataUri": metadata_uri
        }
    
    async def get_erc20_balance(self, address: str) -> str:
        """Get ERC20 token balance"""
        if not self.token_address:
            raise Exception("ERC20 token not deployed")
        
        abi = self._get_contract_abi("erc20/GreenSupplyToken.sol")
        if not abi:
            raise Exception("Could not load ERC20 ABI")
        
        contract = self.w3.eth.contract(address=self.token_address, abi=abi)
        balance = contract.functions.balanceOf(address).call()
        return self.w3.from_wei(balance, "ether")
    
    async def get_evm_transactions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent EVM blockchain transactions"""
        try:
            transactions = []
            latest_block = self.w3.eth.block_number
            
            # Get transactions from recent blocks
            for block_num in range(max(0, latest_block - limit), latest_block + 1):
                try:
                    block = self.w3.eth.get_block(block_num, full_transactions=True)
                    for tx in block.transactions:
                        if tx.to and (tx.to.lower() == self.token_address.lower() or 
                                     tx.to.lower() == self.nft_address.lower()):
                            receipt = self.w3.eth.get_transaction_receipt(tx.hash)
                            transactions.append({
                                "hash": tx.hash.hex(),
                                "blockNumber": block_num,
                                "from": tx["from"],
                                "to": tx.to,
                                "value": str(self.w3.from_wei(tx.value, "ether")),
                                "gasUsed": receipt.gasUsed,
                                "status": "success" if receipt.status == 1 else "failed",
                                "timestamp": block.timestamp,
                                "type": "ERC20" if tx.to.lower() == self.token_address.lower() else "ERC721"
                            })
                except Exception as e:
                    continue
            
            return sorted(transactions, key=lambda x: x["blockNumber"], reverse=True)[:limit]
        except Exception as e:
            print(f"Error getting EVM transactions: {e}")
            return []
    
    async def get_smart_contract_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get smart contract events (mints, transfers, etc.)"""
        try:
            events = []
            
            if self.token_address:
                abi = self._get_contract_abi("erc20/GreenSupplyToken.sol")
                if abi:
                    contract = self.w3.eth.contract(address=self.token_address, abi=abi)
                    latest_block = self.w3.eth.block_number
                    from_block = max(0, latest_block - 1000)
                    
                    # Get TokensMinted events
                    try:
                        mint_events = contract.events.TokensMinted.get_logs(fromBlock=from_block)
                        for event in mint_events[-limit:]:
                            events.append({
                                "type": "ERC20_MINT",
                                "contract": self.token_address,
                                "to": event.args.to,
                                "amount": str(self.w3.from_wei(event.args.amount, "ether")),
                                "blockNumber": event.blockNumber,
                                "txHash": event.transactionHash.hex(),
                                "timestamp": self.w3.eth.get_block(event.blockNumber).timestamp
                            })
                    except:
                        pass
            
            if self.nft_address:
                abi = self._get_contract_abi("erc721/GreenSupplyNFT.sol")
                if abi:
                    contract = self.w3.eth.contract(address=self.nft_address, abi=abi)
                    latest_block = self.w3.eth.block_number
                    from_block = max(0, latest_block - 1000)
                    
                    # Get NFTMinted events
                    try:
                        mint_events = contract.events.NFTMinted.get_logs(fromBlock=from_block)
                        for event in mint_events[-limit:]:
                            events.append({
                                "type": "ERC721_MINT",
                                "contract": self.nft_address,
                                "to": event.args.to,
                                "tokenId": str(event.args.tokenId),
                                "tokenURI": event.args.tokenURI,
                                "blockNumber": event.blockNumber,
                                "txHash": event.transactionHash.hex(),
                                "timestamp": self.w3.eth.get_block(event.blockNumber).timestamp
                            })
                    except:
                        pass
            
            return sorted(events, key=lambda x: x["blockNumber"], reverse=True)[:limit]
        except Exception as e:
            print(f"Error getting smart contract events: {e}")
            return []
    
    async def get_tokenized_assets(self) -> List[Dict[str, Any]]:
        """Get all tokenized assets (NFTs representing supply chain assets)"""
        try:
            tokenized = []
            
            if self.nft_address:
                abi = self._get_contract_abi("erc721/GreenSupplyNFT.sol")
                if abi:
                    contract = self.w3.eth.contract(address=self.nft_address, abi=abi)
                    total_supply = contract.functions.totalSupply().call()
                    
                    # Get all NFTs
                    for token_id in range(1, min(total_supply + 1, 100)):  # Limit to 100
                        try:
                            owner = contract.functions.ownerOf(token_id).call()
                            token_uri = contract.functions.tokenURI(token_id).call()
                            tokenized.append({
                                "tokenId": str(token_id),
                                "owner": owner,
                                "tokenURI": token_uri,
                                "contract": self.nft_address,
                                "type": "ERC721"
                            })
                        except:
                            continue
            
            return tokenized
        except Exception as e:
            print(f"Error getting tokenized assets: {e}")
            return []

