import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import AssetRegister from './pages/AssetRegister';
import TokenMint from './pages/TokenMint';
import Transfer from './pages/Transfer';
import OrgAdmin from './pages/OrgAdmin';
import NetworkHealth from './pages/NetworkHealth';
import './App.css';

const queryClient = new QueryClient();

function NavLinks() {
  const location = useLocation();
  
  const links = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/assets', label: 'Assets', icon: '📦' },
    { path: '/tokens', label: 'Tokens', icon: '🪙' },
    { path: '/transfer', label: 'Transfer', icon: '🔄' },
    { path: '/network', label: 'Network', icon: '🔍' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <div className="nav-links">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={location.pathname === link.path ? 'active' : ''}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <span className="logo-icon">🌱</span>
                Green Supply Chain
              </Link>
              <NavLinks />
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<AssetRegister />} />
              <Route path="/tokens" element={<TokenMint />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/network" element={<NetworkHealth />} />
              <Route path="/admin" element={<OrgAdmin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

