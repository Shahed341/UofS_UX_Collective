import React, { useState, useEffect } from 'react';
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
  const [discordStats, setDiscordStats] = useState({
    memberCount: 308,
    onlineCount: 25,
    isLoading: false
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDiscordStats = async () => {
      try {
        const res = await fetch('/api/discord-stats');
        const data = await res.json();
        if (isMounted && data && data.memberCount) {
          setDiscordStats({
            memberCount: data.memberCount,
            onlineCount: data.onlineCount || 0,
            isLoading: false
          });
        }
      } catch (err) {
        // Fallback directly to Discord API if proxy unavailable
        try {
          const directRes = await fetch('https://discord.com/api/v9/invites/Fx7BUvzdzT?with_counts=true');
          const directData = await directRes.json();
          if (isMounted && directData && directData.approximate_member_count) {
            setDiscordStats({
              memberCount: directData.approximate_member_count,
              onlineCount: directData.approximate_presence_count || 0,
              isLoading: false
            });
          }
        } catch (e) {
          // Keep default fallback
        }
      }
    };

    fetchDiscordStats();
    const interval = setInterval(fetchDiscordStats, 30000); // 30s real-time poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
        {/* 2. Stat Section (Unboxed numbers: Total Members, Events Hosted, Helped Students, Leaders) */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number gradient-text">{discordStats.memberCount}+</div>
              <div className="stat-label">Total Members</div>
            </div>

            <div className="stat-item">
              <div className="stat-number gradient-text">12+</div>
              <div className="stat-label">Events Hosted</div>
            </div>

            <div className="stat-item">
              <div className="stat-number gradient-text">250+</div>
              <div className="stat-label">Helped Students</div>
            </div>

            <div className="stat-item">
              <div className="stat-number gradient-text">7</div>
              <div className="stat-label">Executive Leaders</div>
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
