import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { networkAPI } from '../services/api';
import './NetworkHealth.css';

const NetworkHealth: React.FC = () => {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['network-health'],
    queryFn: () => networkAPI.getNetworkHealth(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="network-health">
        <div className="card">
          <h2>🔍 Network Health Check</h2>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: '#666' }}>Checking network status...</p>
          </div>
        </div>
      </div>
    );
  }

  const healthData = health?.data;

  return (
    <div className="network-health">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>🔍 Network Health Check</h2>
          <button className="button" onClick={() => refetch()}>
            🔄 Refresh
          </button>
        </div>

        {/* Overall Status */}
        <div className={`status-banner ${healthData?.network_available ? 'success' : 'error'}`}>
          <h3>
            {healthData?.network_available ? '✅ Network Available' : '❌ Network Unavailable'}
          </h3>
          <p>
            {healthData?.network_available
              ? 'All nodes are running and can join the network'
              : 'Some nodes are not running or cannot join the network'}
          </p>
        </div>

        {/* Orderer Status */}
        <div className="node-section">
          <h3>📡 Orderer Status</h3>
          <div className={`node-card ${healthData?.orderer?.container_running ? 'running' : 'stopped'}`}>
            <div className="node-header">
              <span className="node-name">orderer.example.com</span>
              <span className={`node-status ${healthData?.orderer?.container_running ? 'running' : 'stopped'}`}>
                {healthData?.orderer?.container_running ? '🟢 Running' : '🔴 Stopped'}
              </span>
            </div>
            {healthData?.orderer?.accessible && (
              <p className="node-detail">✅ Orderer is accessible</p>
            )}
          </div>
        </div>

        {/* Peer Nodes Status */}
        <div className="node-section">
          <h3>🖥️ Peer Nodes Status</h3>
          <div className="nodes-grid">
            {Object.entries(healthData?.nodes || {}).map(([org, nodeInfo]: [string, any]) => (
              <div
                key={org}
                className={`node-card ${nodeInfo.container_running ? 'running' : 'stopped'}`}
              >
                <div className="node-header">
                  <span className="node-name">peer0.{org}.example.com</span>
                  <span className={`node-status ${nodeInfo.container_running ? 'running' : 'stopped'}`}>
                    {nodeInfo.container_running ? '🟢 Running' : '🔴 Stopped'}
                  </span>
                </div>
                <div className="node-details">
                  <div className="detail-item">
                    <span className="detail-label">Peer Accessible:</span>
                    <span className={nodeInfo.peer_accessible ? 'success' : 'error'}>
                      {nodeInfo.peer_accessible ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Channel Joined:</span>
                    <span className={nodeInfo.channel_joined ? 'success' : 'error'}>
                      {nodeInfo.channel_joined ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Chaincode Installed:</span>
                    <span className={nodeInfo.chaincode_installed ? 'success' : 'error'}>
                      {nodeInfo.chaincode_installed ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  {nodeInfo.errors && nodeInfo.errors.length > 0 && (
                    <div className="node-errors">
                      <strong>Errors:</strong>
                      <ul>
                        {nodeInfo.errors.map((error: string, idx: number) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Status */}
        <div className="node-section">
          <h3>📋 Channel Status</h3>
          <div className={`status-card ${healthData?.channel_exists ? 'success' : 'error'}`}>
            <span className="status-label">Channel: supplychain</span>
            <span className={healthData?.channel_exists ? 'success' : 'error'}>
              {healthData?.channel_exists ? '✅ Exists' : '❌ Not Found'}
            </span>
          </div>
        </div>

        {/* Chaincode Status */}
        <div className="node-section">
          <h3>📦 Chaincode Status</h3>
          <div className={`status-card ${healthData?.chaincode_installed ? 'success' : 'error'}`}>
            <span className="status-label">Chaincode: assetcc</span>
            <span className={healthData?.chaincode_installed ? 'success' : 'error'}>
              {healthData?.chaincode_installed ? '✅ Installed' : '❌ Not Installed'}
            </span>
          </div>
        </div>

        {/* Errors Summary */}
        {healthData?.errors && healthData.errors.length > 0 && (
          <div className="errors-section">
            <h3>⚠️ Network Errors</h3>
            <ul className="errors-list">
              {healthData.errors.map((error: string, idx: number) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHealth;

