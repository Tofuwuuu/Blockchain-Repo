import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetAPI, ledgerAPI } from '../services/api';
import './OrgAdmin.css';

const OrgAdmin: React.FC = () => {
  const { data: assets, isLoading: assetsLoading, refetch: refetchAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetAPI.getAll(),
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => ledgerAPI.getTransactions(),
  });

  return (
    <div className="org-admin">
      <div className="card">
        <h2>Organization Admin Panel</h2>
        <div className="admin-actions">
          <button className="button" onClick={() => refetchAssets()}>
            Refresh Assets
          </button>
          <button className="button button-secondary" onClick={() => refetchTransactions()}>
            Refresh Transactions
          </button>
        </div>
      </div>

      <div className="card">
        <h2>All Assets</h2>
        {assetsLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="assets-list">
            {assets?.data?.length > 0 ? (
              assets.data.map((asset: any, index: number) => (
                <div key={index} className="asset-item">
                  <div className="asset-header">
                    <strong>Asset ID: {asset.assetId || 'N/A'}</strong>
                    <span className="asset-status">{asset.status || 'UNKNOWN'}</span>
                  </div>
                  <div className="asset-details">
                    <p><strong>Organization:</strong> {asset.orgId || asset.owner}</p>
                    <p><strong>Metadata:</strong> {typeof asset.metadata === 'string' ? asset.metadata : JSON.stringify(asset.metadata)}</p>
                    {asset.lastUpdated && (
                      <p><strong>Last Updated:</strong> {asset.lastUpdated}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No assets found</p>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Transaction History</h2>
        <div className="transactions-list">
          {transactions?.data?.length > 0 ? (
            transactions.data.map((tx: any, index: number) => (
              <div key={index} className="transaction-item">
                <div className="tx-header">
                  <strong>TX ID: {tx.txId || 'N/A'}</strong>
                  <span>{tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</span>
                </div>
                <pre className="tx-data">{tx.value || JSON.stringify(tx)}</pre>
              </div>
            ))
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgAdmin;

