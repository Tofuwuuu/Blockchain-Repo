import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private account: string | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0];
    
    if (!this.account) {
      throw new Error('No account found');
    }
    
    return this.account;
  }

  async getAccount(): Promise<string | null> {
    if (!this.account && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await this.provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner();
          this.account = accounts[0];
        }
      } catch (error) {
        console.error('Error getting account:', error);
      }
    }
    return this.account;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  async getBalance(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    const balance = await this.provider!.getBalance(this.account!);
    return ethers.formatEther(balance);
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain doesn't exist, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'Local Ganache',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [process.env.REACT_APP_EVM_RPC_URL || 'http://localhost:8545'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }
}

export const walletService = new WalletService();

