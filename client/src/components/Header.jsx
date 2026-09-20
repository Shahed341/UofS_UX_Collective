import React from 'react';
import { Layers, Activity } from 'lucide-react';

export default function Header({ isConnected, isChecking }) {
  return (
    <header className="header">
      <div className="brand-section">
        <img 
          src="/logo.jpg" 
          alt="UX Collective Logo" 
          className="logo-img" 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div>
          <h1 className="brand-title">UX Collective</h1>
          <p className="brand-subtitle">University of Saskatchewan • UXCO</p>
        </div>
      </div>

      <div className="nav-badges">
        <span className="badge badge-docker">
          <Layers size={14} /> Dockerized Environment
        </span>
        <span className={`badge ${isConnected ? 'badge-status-online' : 'badge-status-offline'}`}>
          <Activity size={14} className={isChecking ? 'animate-spin' : ''} />
          {isChecking ? 'Checking Stack...' : isConnected ? 'All Systems Connected' : 'Connecting to Backend...'}
        </span>
      </div>
    </header>
  );
}
