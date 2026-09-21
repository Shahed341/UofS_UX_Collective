import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection.jsx';
import EventCalendarSection from './EventCalendarSection.jsx';
import HomeGallerySection from './HomeGallerySection.jsx';
import StudentComments from './StudentComments.jsx';
import './HomePage.css';

export default function HomePage({
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

  return (
    <div className="homepage-container">
      {/* 1. Hero Section (Full-Screen USask Sunset Mesh & Wheat Leaf Graphic) */}
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
        />

        {/* 4. Gallery Section */}
        <HomeGallerySection />

        {/* 5. Student Comments / Testimonials Section */}
        <StudentComments />

        {/* 6. FAQ Section (3D Colorful Pill Accordion) */}
        <FAQSection />
      </div>
    </div>
  );
}

const FAQ_DATA = [
  {
    id: 1,
    question: 'Who can join the U of S UX Collective?',
    answer:
      'Everyone! Whether you are studying Computer Science, Interactive Design, Business, Psychology, Engineering, or Fine Arts, our club is 100% open to all University of Saskatchewan students interested in UI/UX, product design, and digital innovation.',
    theme: 'orange',
  },
  {
    id: 2,
    question: 'Do I need design or coding experience to participate?',
    answer:
      'No prior experience is necessary! We host beginner-friendly workshops, Figma crash courses, design jams, and hands-on sessions where you can learn industry tools, design thinking, and product strategy from scratch.',
    theme: 'coral',
  },
  {
    id: 3,
    question: 'How do I become an official member?',
    answer:
      'Membership is completely free! Simply join our Discord community, follow us on Instagram, and come out to any of our campus workshops or events. You will immediately be connected to hundreds of fellow student designers and mentors.',
    theme: 'crimson',
  },
  {
    id: 4,
    question: 'What kind of events and workshops does the club host?',
    answer:
      'We run interactive Figma design sprints, portfolio review nights with industry professionals, guest speaker panels with agencies (such as zu), collaborative hackathons with CSSS, and executive networking mixers throughout the academic year.',
    theme: 'amber',
  },
  {
    id: 5,
    question: 'How can I get involved in the executive leadership team?',
    answer:
      'We recruit new executive members, project leads, and junior directors at the end of each academic term and during early fall orientation. Keep an eye on our Discord announcements and Instagram for application links!',
    theme: 'coral',
  },
];

function FAQSection() {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-header-block">
        <span className="faq-badge">Got Questions?</span>
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">
          Everything you need to know about joining, events, and getting involved with UXCO.
        </p>
      </div>

      <div className="faq-pills-list">
        {FAQ_DATA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={`faq-item-wrapper theme-${item.theme} ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className={`faq-pill-btn theme-${item.theme} ${isOpen ? 'active' : ''}`}
                onClick={() => toggleFAQ(item.id)}
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">{item.question}</span>
                <span className={`faq-plus-icon ${isOpen ? 'rotated' : ''}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 4V20M4 12H20"
                      stroke="currentColor"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="faq-answer-card">
                  <p className="faq-answer-text">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
