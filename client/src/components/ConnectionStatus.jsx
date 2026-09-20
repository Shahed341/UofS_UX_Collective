import React from 'react';
import { 
  Code2, 
  Server, 
  Database, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ConnectionStatus({ 
  statusData, 
  isLoading, 
  onRefresh, 
  onPing, 
  isPinging, 
  pingResult 
}) {
  const isFrontendActive = true;
  const isBackendConnected = !!statusData?.backend;
  const isDbConnected = !!statusData?.database?.connected;

  return (
    <section id="pipeline" className="pipeline-section">
      <div className="section-header">
        <div>
          <p className="section-tag">System Health & Architecture</p>
          <h3 className="section-title">Connected Multi-Tier Pipeline</h3>
        </div>

        <div className="pipeline-actions">
          <button 
            className="btn-ping" 
            onClick={onPing} 
            disabled={isPinging || !isBackendConnected}
            title="Execute a live write & read operation from React to MySQL via Node.js"
          >
            <Zap size={16} />
            {isPinging ? 'Writing to MySQL...' : 'Test Full Stack Ping'}
          </button>

          <button 
            className="btn-secondary" 
            onClick={onRefresh} 
            disabled={isLoading}
            title="Refresh system connection status"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Visual Pipeline Grid */}
      <div className="pipeline-grid">
        {/* Node 1: React Client */}
        <div className={`flow-node ${isFrontendActive ? 'active' : ''}`}>
          <div className="node-header">
            <div className="node-icon-box node-icon-react">
              <Code2 size={22} />
            </div>
            <div className="node-indicator">
              <span className="pulse-dot online"></span>
              <span>ONLINE</span>
            </div>
          </div>
          <h4 className="node-title">React Client</h4>
          <p className="node-tech">JavaScript • Vite • Docker</p>
          
          <div className="node-meta-list">
            <div className="node-meta-item">
              <span className="meta-key">Container Port</span>
              <span className="meta-val">3000 / 80</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Rendering</span>
              <span className="meta-val">Client Side (SPA)</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Environment</span>
              <span className="meta-val">Docker Nginx</span>
            </div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flow-arrow">
          <div className="arrow-line"></div>
          <span className="arrow-label">REST / HTTP</span>
          <ArrowRight size={20} />
        </div>

        {/* Node 2: Node.js Backend */}
        <div className={`flow-node ${isBackendConnected ? 'active' : ''}`}>
          <div className="node-header">
            <div className="node-icon-box node-icon-node">
              <Server size={22} />
            </div>
            <div className="node-indicator">
              <span className={`pulse-dot ${isBackendConnected ? 'online' : 'offline'}`}></span>
              <span>{isBackendConnected ? 'HEALTHY' : 'OFFLINE'}</span>
            </div>
          </div>
          <h4 className="node-title">Node.js API</h4>
          <p className="node-tech">Express.js • Node {statusData?.backend?.nodeVersion || '20'}</p>
          
          <div className="node-meta-list">
            <div className="node-meta-item">
              <span className="meta-key">Service Host</span>
              <span className="meta-val">http://server:5000</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Uptime</span>
              <span className="meta-val">{statusData?.backend?.uptimeSeconds ?? 0}s</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Status</span>
              <span className="meta-val">{isBackendConnected ? 'Connected' : 'Unreachable'}</span>
            </div>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flow-arrow">
          <div className="arrow-line"></div>
          <span className="arrow-label">TCP Pool</span>
          <ArrowRight size={20} />
        </div>

        {/* Node 3: MySQL Database */}
        <div className={`flow-node ${isDbConnected ? 'active' : ''}`}>
          <div className="node-header">
            <div className="node-icon-box node-icon-mysql">
              <Database size={22} />
            </div>
            <div className="node-indicator">
              <span className={`pulse-dot ${isDbConnected ? 'online' : 'offline'}`}></span>
              <span>{isDbConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </div>
          </div>
          <h4 className="node-title">MySQL 8.0</h4>
          <p className="node-tech">Containerized RDBMS</p>
          
          <div className="node-meta-list">
            <div className="node-meta-item">
              <span className="meta-key">Database</span>
              <span className="meta-val">{statusData?.database?.database || 'uxco_db'}</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Query Latency</span>
              <span className="meta-val">{statusData?.database?.latencyMs ?? '-'} ms</span>
            </div>
            <div className="node-meta-item">
              <span className="meta-key">Engine Version</span>
              <span className="meta-val">{statusData?.database?.version ? statusData.database.version.split('-')[0] : '8.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ping Result Banner */}
      {pingResult && (
        <div className="ping-result-box">
          <div className="ping-result-info">
            <CheckCircle2 size={20} color="#E81D88" />
            <div>
              <div className="ping-result-title">
                Round-trip Write & Read Successful! (Record #{pingResult.insertedId})
              </div>
              <div className="ping-result-desc">
                React ➔ Express API ➔ MySQL execution latency: <strong>{pingResult.writeLatencyMs}ms</strong>
              </div>
            </div>
          </div>
          <span className="badge badge-status-online">
            Verified {new Date(pingResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </section>
  );
}
