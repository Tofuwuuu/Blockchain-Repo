import React, { useState } from 'react';
import { tokenAPI } from '../services/api';
import { walletService } from '../services/wallet';
import './TokenMint.css';

const TokenMint: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<'ERC20' | 'ERC721'>('ERC20');
  const [erc20Data, setErc20Data] = useState({ to: '', amount: '' });
  const [erc721Data, setErc721Data] = useState({ to: '', metadataUri: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    walletService.getAccount().then(setWalletAddress);
  }, []);

  const connectWallet = async () => {
    try {
      const address = await walletService.connect();
      await walletService.switchNetwork(1337);
      setWalletAddress(address);
      if (tokenType === 'ERC20') {
        setErc20Data({ ...erc20Data, to: address });
      } else {
        setErc721Data({ ...erc721Data, to: address });
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleERC20Mint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await tokenAPI.mintERC20({
        to: erc20Data.to,
        amount: erc20Data.amount,
      });
      setMessage({ type: 'success', text: `Tokens minted! TX: ${result.data.txHash}` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleERC721Mint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await tokenAPI.mintERC721({
        to: erc721Data.to,
        metadataUri: erc721Data.metadataUri,
      });
      setMessage({ type: 'success', text: `NFT minted! Token ID: ${result.data.tokenId}, TX: ${result.data.txHash}` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-mint">
      <div className="card">
        <h2>Mint Tokens</h2>
        {!walletAddress && (
          <div className="wallet-prompt">
            <p>Connect your wallet to mint tokens</p>
            <button className="wallet-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}
        {walletAddress && (
          <div className="wallet-info">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="token-type-selector">
          <button
            className={`button ${tokenType === 'ERC20' ? 'active' : ''}`}
            onClick={() => setTokenType('ERC20')}
          >
            ERC20 Token
          </button>
          <button
            className={`button ${tokenType === 'ERC721' ? 'active' : ''}`}
            onClick={() => setTokenType('ERC721')}
          >
            ERC721 NFT
          </button>
        </div>
        {tokenType === 'ERC20' ? (
          <form onSubmit={handleERC20Mint}>
            <div className="form-group">
              <label>To Address</label>
              <input
                type="text"
                value={erc20Data.to}
                onChange={(e) => setErc20Data({ ...erc20Data, to: e.target.value })}
                required
                placeholder="0x..."
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="text"
                value={erc20Data.amount}
                onChange={(e) => setErc20Data({ ...erc20Data, amount: e.target.value })}
                required
                placeholder="1000"
              />
            </div>
            <button type="submit" className="button" disabled={loading || !walletAddress}>
              {loading ? 'Minting...' : 'Mint ERC20 Tokens'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleERC721Mint}>
            <div className="form-group">
              <label>To Address</label>
              <input
                type="text"
                value={erc721Data.to}
                onChange={(e) => setErc721Data({ ...erc721Data, to: e.target.value })}
                required
                placeholder="0x..."
              />
            </div>
            <div className="form-group">
              <label>Metadata URI</label>
              <input
                type="text"
                value={erc721Data.metadataUri}
                onChange={(e) => setErc721Data({ ...erc721Data, metadataUri: e.target.value })}
                required
                placeholder="https://example.com/metadata/1"
              />
            </div>
            <button type="submit" className="button" disabled={loading || !walletAddress}>
              {loading ? 'Minting...' : 'Mint ERC721 NFT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TokenMint;

