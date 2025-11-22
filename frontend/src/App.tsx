import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import AssetRegister from './pages/AssetRegister';
import TokenMint from './pages/TokenMint';
import Transfer from './pages/Transfer';
import OrgAdmin from './pages/OrgAdmin';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                🌱 Green Supply Chain
              </Link>
              <div className="nav-links">
                <Link to="/">Dashboard</Link>
                <Link to="/assets">Assets</Link>
                <Link to="/tokens">Tokens</Link>
                <Link to="/transfer">Transfer</Link>
                <Link to="/admin">Admin</Link>
              </div>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<AssetRegister />} />
              <Route path="/tokens" element={<TokenMint />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/admin" element={<OrgAdmin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

