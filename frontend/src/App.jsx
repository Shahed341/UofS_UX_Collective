import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BinaryBackground from './components/common/BinaryBackground.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import Navbar from './components/nav/Navbar.jsx';
import Footer from './components/footer/Footer.jsx';

import HomePage from './pages/homepage/HomePage.jsx';
import AboutPage from './pages/about/AboutPage.jsx';
import EventsPage from './pages/events/EventsPage.jsx';
import GalleryPage from './pages/gallery/GalleryPage.jsx';
import ContactPage from './pages/contact/ContactPage.jsx';

import './App.css';

export default function App() {
  const [statusData, setStatusData] = useState(null);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  // Fetch full system health & connection status across React, Node, MySQL
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/status');
      if (!res.ok) {
        throw new Error(`Status check returned ${res.status}`);
      }
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setStatusData({
        service: 'UX Collective System Monitor',
        backend: null,
        database: { connected: false, error: err.message }
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Fetch seeded events & connection logs from MySQL
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

  useEffect(() => {
    fetchStatus();
    fetchEventsAndLogs();

    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchEventsAndLogs]);

  // Handle interactive live ping to MySQL
  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await fetch('/api/ping-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'React Browser UI',
          message: 'Interactive ping test'
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
      fetchStatus();
    } catch (err) {
      alert(`Ping test failed: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  const isConnected = !!(statusData?.backend && statusData?.database?.connected);

  return (
    <>
      <ScrollToTop />
      {/* High-quality dropping 0 and 1 interactive background */}
      <BinaryBackground />

      <Navbar isConnected={isConnected} />

      <main className="main-viewport">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                statusData={statusData}
                isLoadingStatus={isLoadingStatus}
                onRefreshStatus={fetchStatus}
                onPing={handlePing}
                isPinging={isPinging}
                pingResult={pingResult}
                events={events}
                isLoadingEvents={isLoadingEvents}
              />
            } 
          />
          <Route 
            path="/home" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/about" 
            element={
              <div className="app-container page-padded">
                <AboutPage />
              </div>
            } 
          />
          <Route 
            path="/events" 
            element={
              <div className="app-container page-padded">
                <EventsPage 
                  events={events}
                  isLoadingEvents={isLoadingEvents}
                />
              </div>
            } 
          />
          <Route 
            path="/gallery" 
            element={
              <div className="app-container page-padded">
                <GalleryPage />
              </div>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <div className="app-container page-padded">
                <ContactPage />
              </div>
            } 
          />
          {/* Fallback for unknown routes */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
