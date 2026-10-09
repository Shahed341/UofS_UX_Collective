import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CalendarPlus, 
  Users, 
  Sparkles, 
  Briefcase, 
  Clock, 
  Laptop, 
  Flame, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import './EventsPage.css';

const EVENT_TRACKS = [
  { id: 'all', label: 'All Calendar' },
  { id: 'workshop', label: '🎨 Design & Figma Labs' },
  { id: 'panel', label: '💼 Career & Industry Panels' },
  { id: 'sprint', label: '⚡ Design Jams & Sprints' },
  { id: 'community', label: '🤝 Campus Collabs & Socials' }
];

const EVENT_POINTS = {
  1: ['1-on-1 Intern Advice & Q&A', 'Co-hosted with CSSS, Cyber & AWS', 'Snacks funded by USSU'],
  2: ['Beginner-friendly cybersecurity intro', 'Semester workshop preview', 'CTF competition roadmap'],
  3: ['1-on-1 Senior Portfolio Critiques', 'Figma Component Architecture & Variables', 'Industry feedback from agency designers'],
  4: ['Meet the 2026/27 Executive Team', 'Pitch your own workshop ideas', 'Junior Lead recruitment info'],
  5: ['Figma design tokens to React JSX', 'Responsive CSS & accessibility tips', 'Take-home code repository starter'],
  6: ['1-day collaborative design sprint', 'Local community problem statement', 'Prizes & industry guest judges']
};

export default function EventsPage({ events = [], isLoadingEvents = false }) {
  const [selectedTrack, setSelectedTrack] = useState('all');

  const parseDateParts = (dateStr) => {
    if (!dateStr) return { month: '2026', day: 'UX', time: '' };
    const parts = dateStr.split('•');
    const datePart = parts[0] ? parts[0].trim() : '';
    const timePart = parts[1] ? parts[1].trim() : '';
    
    const match = datePart.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i);
    if (match) {
      return {
        month: match[1].toUpperCase(),
        day: match[2],
        time: timePart || datePart,
        weekday: datePart.split(',')[0] || ''
      };
    }
    return { month: 'FALL', day: '26', time: timePart || dateStr, weekday: 'USask' };
  };

  const getGoogleCalendarUrl = (event) => {
    if (event.calendar_link && event.calendar_link.startsWith('http')) {
      return event.calendar_link;
    }
    const text = encodeURIComponent(`UXCO: ${event.title}`);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || 'University of Saskatchewan');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  const filteredEvents = selectedTrack === 'all'
    ? events
    : events.filter(e => {
        const cat = (e.category || '').toLowerCase();
        if (selectedTrack === 'workshop') return cat.includes('workshop') || cat.includes('figma');
        if (selectedTrack === 'panel') return cat.includes('panel') || cat.includes('career');
        if (selectedTrack === 'sprint') return cat.includes('sprint') || cat.includes('jam');
        if (selectedTrack === 'community') return cat.includes('community') || cat.includes('collab') || cat.includes('social');
        return true;
      });

  // Headline Spotlight Event (Fallback to event 3 or first event)
  const spotlightEvent = events.find(e => e.id === 3) || events[0];
  const spotlightDate = spotlightEvent ? parseDateParts(spotlightEvent.date) : null;

  return (
    <div className="events-page-wrapper">
      <div className="app-container page-padded">
        
        {/* 1. Header Block */}
        <div className="events-hero-header">
          <span className="events-badge-pill">
            <Flame size={14} color="#C21356" />
            <span>USask UX Collective Events</span>
          </span>
          <h1 className="events-main-title">Hands-On Design. Real Portfolio Growth.</h1>
          <p className="events-main-subtitle">
            From Figma component architecture to multi-club tech jams with CSSS and industry panels with local agencies — every event is built to give you concrete skills.
          </p>
        </div>

        {/* 2. Spotlight Headline Event Ticket */}
        {spotlightEvent && (
          <div className="spotlight-ticket-container">
            <div className="spotlight-ticket-inner">
              <div className="spotlight-badge-row">
                <span className="spotlight-flame-tag">
                  <Flame size={13} />
                  FEATURED SPOTLIGHT EVENT
                </span>
                <span className="spotlight-cat-tag">{spotlightEvent.category}</span>
              </div>

              <div className="spotlight-content-grid">
                {/* Left Date Box */}
                <div className="spotlight-date-box">
                  <span className="spotlight-month">{spotlightDate.month}</span>
                  <span className="spotlight-day">{spotlightDate.day}</span>
                  <span className="spotlight-time">{spotlightDate.time}</span>
                </div>

                {/* Center Content */}
                <div className="spotlight-center-info">
                  <h2 className="spotlight-title">{spotlightEvent.title}</h2>
                  <div className="spotlight-loc-row">
                    <MapPin size={16} color="#FA7538" />
                    <span>{spotlightEvent.location}</span>
                  </div>

                  <p className="spotlight-desc">{spotlightEvent.description}</p>

                  {/* 3 Clear Value Points */}
                  <div className="spotlight-points-grid">
                    {(EVENT_POINTS[spotlightEvent.id] || [
                      'Hands-on Figma Prototyping',
                      '1-on-1 Feedback from Senior Designers',
                      'Networking with Campus Creators'
                    ]).map((pt, i) => (
                      <div key={i} className="spotlight-point-chip">
                        <CheckCircle2 size={14} color="#10B981" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Action */}
                <div className="spotlight-action-box">
                  <a
                    href={getGoogleCalendarUrl(spotlightEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotlight-cal-btn"
                  >
                    <CalendarPlus size={16} />
                    <span>Add to Calendar</span>
                  </a>
                  <a
                    href="https://discord.gg/Fx7BUvzdzT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotlight-discord-link"
                  >
                    <span>RSVP on Discord</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. "What to Expect at UXCO Events" 3-Pillar Cards */}
        <div className="events-principles-grid">
          <div className="event-principle-card">
            <div className="principle-icon-box pink">
              <Sparkles size={20} color="#C21356" />
            </div>
            <h3 className="principle-title">Zero Experience Required</h3>
            <p className="principle-text">
              All workshops start from the fundamentals. Whether you're in Computer Science, Art, Business, or Engineering, everyone is welcome.
            </p>
          </div>

          <div className="event-principle-card">
            <div className="principle-icon-box orange">
              <Laptop size={20} color="#FA7538" />
            </div>
            <h3 className="principle-title">Bring Your Laptop & Build</h3>
            <p className="principle-text">
              Hands-on sessions with live Figma templates, starter kits, and component systems you can keep and add to your portfolio.
            </p>
          </div>

          <div className="event-principle-card">
            <div className="principle-icon-box crimson">
              <Briefcase size={20} color="#D81E6B" />
            </div>
            <h3 className="principle-title">Industry Mentorship & Jams</h3>
            <p className="principle-text">
              Co-hosted panels with CSSS, USask Cyber, and guest design feedback from Saskatoon tech agencies like zu.
            </p>
          </div>
        </div>

        {/* 4. Filter Tracks */}
        <div className="events-tracks-bar">
          <div className="tracks-list">
            {EVENT_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`track-pill-btn ${selectedTrack === track.id ? 'active' : ''}`}
                onClick={() => setSelectedTrack(track.id)}
              >
                {track.label}
              </button>
            ))}
          </div>
          <span className="tracks-counter">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Scheduled Event' : 'Scheduled Events'}
          </span>
        </div>

        {/* 5. Event Tickets List */}
        {isLoadingEvents ? (
          <div className="events-loading-state">
            <p>Loading scheduled campus events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="events-empty-state">
            <p>No events scheduled under this track right now. Check back soon or request a workshop on Discord!</p>
          </div>
        ) : (
          <div className="events-tickets-stack">
            {filteredEvents.map((event) => {
              const dt = parseDateParts(event.date);
              const points = EVENT_POINTS[event.id] || ['Interactive session', 'All USask students welcome'];

              return (
                <div key={event.id} className="event-ticket-row">
                  {/* Left Date Block */}
                  <div className="ticket-date-col">
                    <span className="ticket-weekday">{dt.weekday}</span>
                    <span className="ticket-day-num">{dt.day}</span>
                    <span className="ticket-month-name">{dt.month}</span>
                  </div>

                  {/* Center Details */}
                  <div className="ticket-main-col">
                    <div className="ticket-header-row">
                      <span className="ticket-tag">{event.category}</span>
                      <div className="ticket-time-chip">
                        <Clock size={13} color="#FA7538" />
                        <span>{dt.time}</span>
                      </div>
                      <div className="ticket-loc-chip">
                        <MapPin size={13} color="#C21356" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <h3 className="ticket-title">{event.title}</h3>
                    <p className="ticket-description">{event.description}</p>

                    {/* Key Takeaways */}
                    <div className="ticket-points-row">
                      {points.map((pt, pIdx) => (
                        <span key={pIdx} className="ticket-bullet-pill">
                          <span className="bullet-dot" />
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="ticket-action-col">
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-cal-button"
                      title={`Add "${event.title}" to Google Calendar`}
                    >
                      <CalendarPlus size={15} />
                      <span>Add to Calendar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Campus Partners Footer Ribbon */}
        <div className="events-campus-collab-footer">
          <div className="collab-footer-header">
            <Users size={18} color="#C21356" />
            <span>Official Campus Collaborations & Co-Hosts</span>
          </div>
          <div className="collab-footer-chips">
            <span className="collab-badge">CSSS (Computer Science)</span>
            <span className="collab-badge">zu (Product Design Agency)</span>
            <span className="collab-badge">USSU (Students' Union)</span>
            <span className="collab-badge">USask Cybersecurity Club</span>
            <span className="collab-badge">AWS Student Builders</span>
            <span className="collab-badge">USask Game Dev Club</span>
          </div>
        </div>

      </div>
    </div>
  );
}
