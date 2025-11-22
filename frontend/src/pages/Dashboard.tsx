import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetAPI, ledgerAPI, blockchainAPI } from '../services/api';
import { walletService } from '../services/wallet';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetAPI.getAll(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => ledgerAPI.getTransactions(),
    refetchInterval: 5000,
  });

  const { data: evmTransactions } = useQuery({
    queryKey: ['evm-transactions'],
    queryFn: () => blockchainAPI.getEVMTransactions(20),
    refetchInterval: 5000,
  });

  const { data: smartContractEvents } = useQuery({
    queryKey: ['smart-contract-events'],
    queryFn: () => blockchainAPI.getSmartContractEvents(20),
    refetchInterval: 5000,
  });

  const { data: tokenizedAssets } = useQuery({
    queryKey: ['tokenized-assets'],
    queryFn: () => blockchainAPI.getTokenizedAssets(),
    refetchInterval: 5000,
  });

  const { data: fabricTransactions } = useQuery({
    queryKey: ['fabric-transactions'],
    queryFn: () => blockchainAPI.getFabricTransactions(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    walletService.getAccount().then(setWalletAddress);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await walletService.connect();
      await walletService.switchNetwork(1337);
      setWalletAddress(address);
    } catch (error: any) {
      alert(`Error connecting wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="card">
        <h2>📊 Dashboard</h2>
        <div className="wallet-section">
          {walletAddress ? (
            <div className="wallet-info">
              <span>🔗 Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <button
              className="wallet-button"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? '⏳ Connecting...' : '🔌 Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2>📊 On-Chain Statistics</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Fabric Assets</span>
            <span className="stat-value">{assets?.data?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tokenized Assets</span>
            <span className="stat-value">{tokenizedAssets?.data?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">EVM Transactions</span>
            <span className="stat-value">{evmTransactions?.data?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Smart Contract Events</span>
            <span className="stat-value">{smartContractEvents?.data?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🪙 Tokenized Assets (On-Chain NFTs)</h2>
        {tokenizedAssets?.data?.length > 0 ? (
          <div className="tokenized-assets-grid">
            {tokenizedAssets.data.map((asset: any, index: number) => (
              <div key={index} className="tokenized-asset-card">
                <div className="asset-header">
                  <span className="asset-type">NFT #{asset.tokenId}</span>
                  <span className="asset-status">On-Chain</span>
                </div>
                <div className="asset-details">
                  <p><strong>Owner:</strong> {asset.owner?.slice(0, 10)}...{asset.owner?.slice(-8)}</p>
                  <p><strong>Contract:</strong> {asset.contract?.slice(0, 10)}...{asset.contract?.slice(-8)}</p>
                  <p><strong>Type:</strong> {asset.type}</p>
                  {asset.tokenURI && (
                    <p><strong>Metadata:</strong> <a href={asset.tokenURI} target="_blank" rel="noopener noreferrer">View</a></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>📭 No tokenized assets found</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>⚡ Smart Contract Events</h2>
        {smartContractEvents?.data?.length > 0 ? (
          <div className="transaction-list">
            {smartContractEvents.data.map((event: any, index: number) => (
              <div key={index} className="transaction-item smart-contract-event">
                <div className="tx-header">
                  <span className="event-type">{event.type}</span>
                  <span className="tx-status">{event.status || 'Success'}</span>
                </div>
                <div className="tx-details">
                  <p><strong>To:</strong> {event.to?.slice(0, 10)}...{event.to?.slice(-8)}</p>
                  {event.amount && <p><strong>Amount:</strong> {event.amount} tokens</p>}
                  {event.tokenId && <p><strong>Token ID:</strong> {event.tokenId}</p>}
                  <p><strong>Block:</strong> {event.blockNumber}</p>
                  <p><strong>TX Hash:</strong> 
                    <a href={`#`} className="tx-link" title={event.txHash}>
                      {event.txHash?.slice(0, 16)}...
                    </a>
                  </p>
                  {event.timestamp && (
                    <p><strong>Time:</strong> {new Date(event.timestamp * 1000).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>📭 No smart contract events found</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>🔗 EVM Blockchain Transactions</h2>
        {evmTransactions?.data?.length > 0 ? (
          <div className="transaction-list">
            {evmTransactions.data.map((tx: any, index: number) => (
              <div key={index} className="transaction-item blockchain-tx">
                <div className="tx-header">
                  <span className="tx-type">{tx.type}</span>
                  <span className={`tx-status ${tx.status === 'success' ? 'success' : 'failed'}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="tx-details">
                  <p><strong>From:</strong> {tx.from?.slice(0, 10)}...{tx.from?.slice(-8)}</p>
                  <p><strong>To:</strong> {tx.to?.slice(0, 10)}...{tx.to?.slice(-8)}</p>
                  <p><strong>Block:</strong> {tx.blockNumber}</p>
                  <p><strong>Gas Used:</strong> {tx.gasUsed?.toLocaleString()}</p>
                  <p><strong>TX Hash:</strong> 
                    <a href={`#`} className="tx-link" title={tx.hash}>
                      {tx.hash?.slice(0, 16)}...
                    </a>
                  </p>
                  {tx.timestamp && (
                    <p><strong>Time:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>📭 No EVM transactions found</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>📜 Fabric Blockchain Transactions</h2>
        {fabricTransactions?.data?.length > 0 ? (
          <div className="transaction-list">
            {fabricTransactions.data.slice(0, 10).map((tx: any, index: number) => (
              <div key={index} className="transaction-item fabric-tx">
                <div className="tx-header">
                  <span className="tx-id">TX: {tx.txId?.slice(0, 16)}...</span>
                  <span className="tx-status">On-Chain</span>
                </div>
                <div className="tx-details">
                  {tx.value && (
                    <div className="tx-value">
                      <pre>{typeof tx.value === 'string' ? tx.value.substring(0, 200) : JSON.stringify(tx.value).substring(0, 200)}...</pre>
                    </div>
                  )}
                  {tx.timestamp && (
                    <p><strong>Time:</strong> {new Date(tx.timestamp.seconds * 1000).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>📭 No Fabric transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

