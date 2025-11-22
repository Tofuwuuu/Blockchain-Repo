import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateAssetRequest {
  orgId: string;
  assetId: string;
  metadata: Record<string, any>;
}

export interface MintERC20Request {
  to: string;
  amount: string;
}

export interface MintERC721Request {
  to: string;
  tokenId?: number;
  metadataUri: string;
}

export const assetAPI = {
  create: async (data: CreateAssetRequest) => {
    const response = await api.post('/api/assets/create', data);
    return response.data;
  },
  get: async (assetId: string) => {
    const response = await api.get(`/api/assets/${assetId}`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/assets');
    return response.data;
  },
  transfer: async (assetId: string, newOwner: string) => {
    const response = await api.post(`/api/assets/${assetId}/transfer`, {
      assetId,
      newOwner,
    });
    return response.data;
  },
};

export const tokenAPI = {
  mintERC20: async (data: MintERC20Request) => {
    const response = await api.post('/api/tokens/erc20/mint', data);
    return response.data;
  },
  mintERC721: async (data: MintERC721Request) => {
    const response = await api.post('/api/tokens/erc721/mint', data);
    return response.data;
  },
  getERC20Balance: async (address: string) => {
    const response = await api.get(`/api/tokens/erc20/balance/${address}`);
    return response.data;
  },
};

export const ledgerAPI = {
  getTransactions: async (assetId?: string) => {
    const params = assetId ? { assetId } : {};
    const response = await api.get('/api/ledger/txs', { params });
    return response.data;
  },
};

export default api;

