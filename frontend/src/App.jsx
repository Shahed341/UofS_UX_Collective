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

export const INITIAL_REAL_EVENTS = [
  {
    id: 1,
    title: 'Tech Internship Panel: Landing Your First Role',
    category: 'Panel & Networking',
    date: 'Friday, Sep 25, 2026 • 5:00 PM - 7:00 PM',
    location: 'Arts 146, UofS Campus',
    description: 'Teaming up with the Computer Science Student Society (CSSS), USask Cybersecurity Club, AWS Student Builder Group, and USask Game Dev Club for a panel with past interns, open Q&A, and networking with snacks funded by USSU.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tech+Internship+Panel+How+to+Land+Your+First+Role&location=Arts+146'
  },
  {
    id: 2,
    title: 'USask Cybersecurity Fall Semester Meeting',
    category: 'Club Collab & Talk',
    date: 'Wednesday, Sep 16, 2026 • 6:00 PM',
    location: 'Thorvaldson S311 (Spinks 3rd Floor)',
    description: 'Beginner-friendly first talk covering cybersecurity fundamentals, semester workshops, and upcoming CTF competitions.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=USask+Cybersecurity+Club+Meeting&location=Thorvaldson+S311'
  },
  {
    id: 3,
    title: 'Fall UX Design Sprint & Portfolio Night',
    category: 'Workshop & Critique',
    date: 'Wednesday, Oct 14, 2026 • 5:30 PM - 7:30 PM',
    location: 'Thorvaldson Hall 105',
    description: 'Interactive workshop exploring design systems, Figma variable logic, component architecture, and 1-on-1 portfolio feedback from senior designers.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Fall+UX+Design+Sprint&location=Thorvaldson+Hall+105'
  },
  {
    id: 4,
    title: 'Executive Team Meet & Greet',
    category: 'Community Social',
    date: 'Thursday, Oct 29, 2026 • 4:30 PM - 6:30 PM',
    location: 'Collaborative Science Hub',
    description: 'Meet the 2026/27 UXCO Executive Team, learn how to get involved in club projects, and pitch your ideas for campus design workshops and initiatives.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=UXCO+Executive+Meet+and+Greet&location=Collaborative+Science+Hub'
  },
  {
    id: 5,
    title: 'Figma to Code: Building Responsive UI with React',
    category: 'Hands-on Workshop',
    date: 'Wednesday, Nov 11, 2026 • 5:00 PM - 7:00 PM',
    location: 'Spinks Computer Lab 202',
    description: 'Learn how to translate design tokens and Figma prototypes into modular, accessible React components and CSS styling in this interactive lab.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Figma+to+Code+Workshop&location=Spinks+202'
  },
  {
    id: 6,
    title: 'Winter Design Jam & Community Showcase',
    category: 'Design Sprint & Showcase',
    date: 'Saturday, Nov 28, 2026 • 10:00 AM - 5:00 PM',
    location: 'Arts & Science Student Lounge',
    description: 'Annual 1-day collaborative design sprint addressing local community challenges, with feedback from industry guest mentors and prizes for top projects.',
    calendar_link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Winter+Design+Jam&location=Arts+Student+Lounge'
  }
];

export default function App() {
  const [statusData, setStatusData] = useState(null);
  const [events, setEvents] = useState(INITIAL_REAL_EVENTS);
  const [logs, setLogs] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  // Fetch full system health & connection status when backend is running
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      // Backend not running (e.g. Vercel static demo)
    }
  }, []);

  // Fetch live events from database if backend is connected
  const fetchEventsAndLogs = useCallback(async () => {
    try {
      const [eventsRes, logsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/logs')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData.data) && eventsData.data.length > 0) {
          setEvents(eventsData.data);
        }
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.data || []);
      }
    } catch (err) {
      // Seamlessly keep real pre-bundled events on Vercel deployment
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
            element={<AboutPage />} 
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
