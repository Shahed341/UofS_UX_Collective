import React from 'react';
import HeroSection from './HeroSection.jsx';
import EventCalendarSection from './EventCalendarSection.jsx';
import HomeGallerySection from './HomeGallerySection.jsx';
import StudentComments from './StudentComments.jsx';
import ConnectionStatus from './ConnectionStatus.jsx';
import './HomePage.css';

export default function HomePage({
  statusData,
  isLoadingStatus,
  onRefreshStatus,
  onPing,
  isPinging,
  pingResult,
  setActivePage,
  events,
  isLoadingEvents
}) {
  const scrollToPipeline = () => {
    const el = document.getElementById('pipeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage-container">
      {/* 1. Hero Section (Full-Screen Thorvaldson Image + Title Overlay + Join Discord Button) */}
      <HeroSection />

      <div className="app-container">
        {/* 2. Stat Section */}
        <section className="stats-section">
          <div>
            <span className="stats-intro-tag">At A Glance</span>
            <h2 className="stats-intro-title">
              Empowering student designers & developers at UofS
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              The University of Saskatchewan's first-ever design club connecting and educating students across product design, UX research, and frontend software engineering.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number gradient-text">119+</div>
              <div className="stat-label">LinkedIn Community</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">7</div>
              <div className="stat-label">Executive Leaders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">5+</div>
              <div className="stat-label">Campus Tech Partners</div>
            </div>
          </div>
        </section>

        {/* 3. Event Calendar Section */}
        <EventCalendarSection 
          events={events}
          isLoadingEvents={isLoadingEvents}
          setActivePage={setActivePage}
        />

        {/* 4. Gallery Section */}
        <HomeGallerySection 
          setActivePage={setActivePage}
        />

        {/* 5. Student Comments / Testimonials Section */}
        <StudentComments />

        {/* 6. Connected Multi-Tier Pipeline Monitor */}
        <ConnectionStatus 
          statusData={statusData}
          isLoading={isLoadingStatus}
          onRefresh={onRefreshStatus}
          onPing={onPing}
          isPinging={isPinging}
          pingResult={pingResult}
        />
      </div>
    </div>
  );
}
