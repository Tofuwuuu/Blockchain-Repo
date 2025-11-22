import React, { useState } from 'react';
import { assetAPI } from '../services/api';
import './AssetRegister.css';

const AssetRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    orgId: 'Org1',
    assetId: '',
    metadata: JSON.stringify({
      name: '',
      origin: '',
      carbonFootprint: '',
      certification: '',
    }, null, 2),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let metadata;
      try {
        metadata = JSON.parse(formData.metadata);
      } catch {
        throw new Error('Invalid JSON in metadata field');
      }

      const result = await assetAPI.create({
        orgId: formData.orgId,
        assetId: formData.assetId,
        metadata,
      });

      setMessage({ type: 'success', text: `Asset ${formData.assetId} created successfully!` });
      setFormData({
        orgId: formData.orgId,
        assetId: '',
        metadata: JSON.stringify({
          name: '',
          origin: '',
          carbonFootprint: '',
          certification: '',
        }, null, 2),
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asset-register">
      <div className="card">
        <h2>Register New Asset</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization ID</label>
            <select
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              required
            >
              <option value="Org1">Org1</option>
              <option value="Org2">Org2</option>
              <option value="Org3">Org3</option>
            </select>
          </div>
          <div className="form-group">
            <label>Asset ID</label>
            <input
              type="text"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              required
              placeholder="e.g., ASSET001"
            />
          </div>
          <div className="form-group">
            <label>Metadata (JSON)</label>
            <textarea
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              required
              rows={10}
              placeholder='{"name": "Product Name", "origin": "Country", ...}'
            />
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Asset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssetRegister;

