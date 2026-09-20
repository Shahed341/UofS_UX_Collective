import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import ColorPaletteBar from './components/ColorPaletteBar.jsx';
import HeroSection from './components/HeroSection.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import DbExplorer from './components/DbExplorer.jsx';
import './App.css';

export default function App() {
  const [statusData, setStatusData] = useState(null);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  // Fetch full system health & connection status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/status');
      if (!res.ok) {
        throw new Error(`Status check returned ${res.status}`);
      }
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      // Fallback object to show disconnected state
      setStatusData({
        service: 'UX Collective System Monitor',
        backend: null,
        database: { connected: false, error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch sample events from MySQL database
  const fetchEventsAndLogs = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const [eventsRes, logsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/logs')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching database records:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchEventsAndLogs();

    // Periodic heartbeat check every 15 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchEventsAndLogs]);

  // Handle interactive ping write test
  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await fetch('/api/ping-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'React Browser UI',
          message: 'Real-time test ping'
        })
      });

      if (!res.ok) {
        throw new Error(`Ping failed with code ${res.status}`);
      }

      const result = await res.json();
      setPingResult(result);
      if (result.recentLogs) {
        setLogs(result.recentLogs);
      }
      // Refresh status numbers
      fetchStatus();
    } catch (err) {
      alert(`Ping test failed: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  const scrollToPipeline = () => {
    const el = document.getElementById('pipeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isConnected = !!(statusData?.backend && statusData?.database?.connected);

  return (
    <div className="app-container">
      <Header isConnected={isConnected} isChecking={isLoading} />
      
      <main>
        <ColorPaletteBar />
        
        <HeroSection onScrollToPipeline={scrollToPipeline} />
        
        <ConnectionStatus 
          statusData={statusData}
          isLoading={isLoading}
          onRefresh={fetchStatus}
          onPing={handlePing}
          isPinging={isPinging}
          pingResult={pingResult}
        />

        <DbExplorer 
          events={events}
          logs={logs}
          isLoadingEvents={isLoadingEvents}
        />
      </main>

      <footer className="footer">
        <div>
          <span className="footer-credits">UX Collective (UXCO)</span> • University of Saskatchewan
        </div>
        <div>
          Built with React 18, Node.js Express, and MySQL 8.0 in Docker
        </div>
      </footer>
    </div>
  );
}
