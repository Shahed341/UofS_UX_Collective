import React from 'react';
import { Calendar, MapPin, ExternalLink, CalendarPlus, Users, Sparkles } from 'lucide-react';
import './EventsPage.css';

export default function EventsPage({ events, isLoadingEvents }) {
  const getGoogleCalendarUrl = (event) => {
    if (event.calendar_link && event.calendar_link.startsWith('http')) {
      return event.calendar_link;
    }
    const text = encodeURIComponent(`UXCO: ${event.title}`);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  return (
    <div className="events-page">
      <div className="page-header">
        <span className="page-tag">Events & Workshops</span>
        <h2 className="page-title">Campus Panels, Workshops & Sprints</h2>
        <p className="page-subtitle">
          All events below are stored and queried directly from our MySQL <code>uxco_events</code> table via the Node.js Express backend.
        </p>
      </div>

      {/* Campus Collaborators Banner */}
      <div style={{
        background: 'var(--uxco-subtle-gradient)',
        border: '1px solid #FDCEA1',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="#E81D88" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>
            Official Campus Partners & Collaborators:
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            CSSS • USask Cybersecurity Club • AWS Student Builder Group • USask Game Dev Club • USSU
          </span>
        </div>
      </div>

      {isLoadingEvents ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          Querying MySQL database for events...
        </p>
      ) : events.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No scheduled events found in the database.
        </p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div>
                <div className="event-header">
                  <span className="event-tag">{event.category}</span>
                  <span style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                    DB #{event.id}
                  </span>
                </div>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.description}</p>
              </div>

              <div>
                <div className="event-details">
                  <div className="detail-row">
                    <Calendar size={15} color="#FA9B7A" />
                    <span>{event.date}</span>
                  </div>
                  <div className="detail-row">
                    <MapPin size={15} color="#E81D88" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <a 
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cal"
                >
                  <CalendarPlus size={15} />
                  Add to Google Calendar
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
