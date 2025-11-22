import React, { useState } from 'react';
import { assetAPI } from '../services/api';
import './Transfer.css';

const Transfer: React.FC = () => {
  const [formData, setFormData] = useState({
    assetId: '',
    newOwner: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await assetAPI.transfer(formData.assetId, formData.newOwner);
      setMessage({ type: 'success', text: `Asset ${formData.assetId} transferred to ${formData.newOwner}` });
      setFormData({ assetId: '', newOwner: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer">
      <div className="card">
        <h2>Transfer Asset</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset ID</label>
            <input
              type="text"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              required
              placeholder="ASSET001"
            />
          </div>
          <div className="form-group">
            <label>New Owner (Organization)</label>
            <select
              value={formData.newOwner}
              onChange={(e) => setFormData({ ...formData, newOwner: e.target.value })}
              required
            >
              <option value="">Select organization</option>
              <option value="Org1">Org1</option>
              <option value="Org2">Org2</option>
              <option value="Org3">Org3</option>
            </select>
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Transferring...' : 'Transfer Asset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;

