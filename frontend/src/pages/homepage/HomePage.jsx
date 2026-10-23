import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Trophy } from 'lucide-react';
import HeroSection from './HeroSection.jsx';
import EventCalendarSection from './EventCalendarSection.jsx';
import HomeGallerySection from './HomeGallerySection.jsx';
import HomeInvolveSection from './HomeInvolveSection.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { Reveal, useCountUp } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { useSite } from '../../lib/site.jsx';
import './HomePage.css';

function Stat({ value, suffix = '+', label, delay }) {
  const [ref, current] = useCountUp(value);
  return (
    <Reveal variant="up" delay={delay} className="stat-item">
      <div ref={ref} className="stat-number gradient-text">
        {current}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </Reveal>
  );
}

export default function HomePage() {
  const { stats } = useSite();
  const { data: events = [], loading } = useApi('/api/events', { initial: [] });
  const recaps = events.filter((e) => e.is_past).reverse().slice(0, 3);

  return (
    <div className="homepage-container">
      <HeroSection />

      <div className="app-container">
        {/* About UXCO */}
        <section className="home-about-showcase-section" id="about-uxco">
          <div className="about-showcase-grid">
            <Reveal variant="left" className="about-3d-red-card">
              <h2 className="about-3d-title">About UXCO</h2>

              <div className="about-3d-content-block">
                <h3 className="about-3d-subtitle">Design with Purpose</h3>
                <p className="about-3d-paragraph">
                  The University of Saskatchewan’s first-ever student design club connecting and educating students in product and digital design. We foster human-centered experiences through hands-on workshops, design sprints, and tech mentorship.
                </p>
              </div>

              <div className="about-3d-content-block">
                <h3 className="about-3d-subtitle">Community & Growth</h3>
                <p className="about-3d-paragraph">
                  Open to all USask students across Computer Science, Interactive Design, Business, Arts, and Engineering. No prior design or coding experience required — just curiosity and a passion for creating meaningful digital products.
                </p>
              </div>

              <Link to="/about" className="about-3d-readmore-btn">
                <span>Explore Full Story & Team</span>
                <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Stats count up when scrolled into view */}
        <section className="stats-section" aria-label="Club in numbers">
          <div className="stats-grid">
            <Stat value={stats.members} label="Discord Members" delay={0} />
            <Stat value={stats.eventsHosted} label="Events Hosted" delay={100} />
            <Stat value={stats.studentsHelped} label="Students Helped" delay={200} />
            <Stat value={new Date().getFullYear() - stats.foundedYear} suffix=" yrs" label="Designing at USask" delay={300} />
          </div>
        </section>

        <EventCalendarSection events={events} isLoadingEvents={loading} />

        {/* Recent recaps from the archive */}
        {recaps.length > 0 && (
          <section className="home-recaps-section">
            <Reveal variant="up" className="home-section-head with-action">
              <div>
                <span className="section-eyebrow">Recently</span>
                <h2 className="section-heading">Event recaps</h2>
              </div>
              <Link to="/events/past" className="btn-secondary">
                Full archive <ArrowRight size={15} />
              </Link>
            </Reveal>
            <div className="home-recaps-grid">
              {recaps.map((event, i) => (
                <Reveal key={event.id} variant="up" delay={i * 110}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <HomeGallerySection />

      <div className="app-container">
        {/* Game corner teaser */}
        <Reveal variant="scale" className="home-game-teaser" data-obstacle>
          <div className="game-teaser-floaters" aria-hidden="true">
            <span className="floater f1" />
            <span className="floater f2" />
            <span className="floater f3" />
          </div>
          <div className="game-teaser-copy">
            <span className="section-eyebrow light"><Gamepad2 size={15} /> Fun</span>
            <h2 className="game-teaser-title">Think you have a designer’s eye?</h2>
            <p className="game-teaser-text">
              Aim, memory and pixel precision. Beat the all-time best.
            </p>
          </div>
          <Link to="/fun" className="game-teaser-btn">
            <Trophy size={18} /> Play now
          </Link>
        </Reveal>

        <HomeInvolveSection />

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
    question: 'How do I keep up with new events?',
    answer:
      'Subscribe to our calendar above — every new event lands in your Google, Apple or Outlook calendar automatically. You can also get email invites, or follow announcements on Discord and Instagram.',
    theme: 'amber',
  },
  {
    id: 5,
    question: 'How can I get involved in the executive leadership team?',
    answer:
      'We recruit volunteers, mentors and junior directors throughout the year. Open roles are listed on the Get Involved page — apply there, or come chat with us at any event!',
    theme: 'coral',
  },
];

function FAQSection() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="faq-section" id="faq">
      <Reveal variant="up" className="faq-header-block">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">
          Everything you need to know about joining, events, and getting involved with UXCO.
        </p>
      </Reveal>

      <div className="faq-pills-list">
        {FAQ_DATA.map((item, i) => {
          const isOpen = openId === item.id;
          return (
            <Reveal key={item.id} variant="up" delay={i * 70} className={`faq-item-wrapper theme-${item.theme} ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                id={`faq-q-${item.id}`}
                className={`faq-pill-btn theme-${item.theme} ${isOpen ? 'active' : ''}`}
                onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${item.id}`}
              >
                <span className="faq-question-text">{item.question}</span>
                <span className={`faq-plus-icon ${isOpen ? 'rotated' : ''}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              {/* Always rendered so the height can animate open and closed */}
              <div
                id={`faq-a-${item.id}`}
                role="region"
                aria-labelledby={`faq-q-${item.id}`}
                className="faq-answer-collapse"
              >
                <div className="faq-answer-inner">
                  <div className="faq-answer-card">
                    <p className="faq-answer-text">{item.answer}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
