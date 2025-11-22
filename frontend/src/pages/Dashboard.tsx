import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetAPI, ledgerAPI } from '../services/api';
import { walletService } from '../services/wallet';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetAPI.getAll(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => ledgerAPI.getTransactions(),
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
        <h2>Dashboard</h2>
        <div className="wallet-section">
          {walletAddress ? (
            <div className="wallet-info">
              <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <button
              className="wallet-button"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Assets Overview</h2>
        {assetsLoading ? (
          <p>Loading assets...</p>
        ) : (
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Total Assets:</span>
              <span className="stat-value">
                {assets?.data?.length || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Recent Transactions</h2>
        {transactions?.data?.length > 0 ? (
          <div className="transaction-list">
            {transactions.data.slice(0, 10).map((tx: any, index: number) => (
              <div key={index} className="transaction-item">
                <div className="tx-info">
                  <span>Asset: {tx.assetId || 'N/A'}</span>
                  <span>Status: {tx.status || 'Completed'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

