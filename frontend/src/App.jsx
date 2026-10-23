/**
 * UX Collective — frontend/src/App.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BinaryBackground from './components/common/BinaryBackground.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import Navbar from './components/nav/Navbar.jsx';
import Footer from './components/footer/Footer.jsx';
import { track } from './lib/track.js';

import HomePage from './pages/homepage/HomePage.jsx';
import AboutPage from './pages/about/AboutPage.jsx';
import EventsPage from './pages/events/EventsPage.jsx';
import PastEventsPage from './pages/events/PastEventsPage.jsx';
import EventDetailPage from './pages/events/EventDetailPage.jsx';
import ResourcesPage from './pages/resources/ResourcesPage.jsx';
import GetInvolvedPage from './pages/involved/GetInvolvedPage.jsx';
import GalleryPage from './pages/gallery/GalleryPage.jsx';
import ContactPage from './pages/contact/ContactPage.jsx';
import FunPage from './pages/fun/FunPage.jsx';

import './App.css';

// The admin panel is only needed by execs, so it is split into its own bundle.
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    track('page_view');
  }, [location.pathname]);

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="admin-loading">Loading admin…</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <BinaryBackground />
      <a href="#main-content" className="skip-link">Skip to content</a>

      <Navbar />

      <main id="main-content" className="main-viewport">
        {/* Keyed on the path so each page plays its enter animation */}
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/past" element={<PastEventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/fun" element={<FunPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  );
}
