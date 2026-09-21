import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, CalendarPlus, Users, Sparkles, Filter } from 'lucide-react';
import './EventsPage.css';

const EVENT_CATEGORIES = ['All', 'Workshop', 'Design Jam', 'Industry Panel', 'Hackathon', 'Community'];

export default function EventsPage({ events = [], isLoadingEvents = false }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getGoogleCalendarUrl = (event) => {
    if (event.calendar_link && event.calendar_link.startsWith('http')) {
      return event.calendar_link;
    }
    const text = encodeURIComponent(`UXCO: ${event.title}`);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || 'University of Saskatchewan');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  return (
    <div className="events-page-wrapper">
      <div className="app-container page-padded">
        {/* Page Header */}
        <div className="page-header">
          <span className="page-tag">Events & Workshops</span>
          <h1 className="page-title">Learn, Build & Connect</h1>
          <p className="page-subtitle">
            Hands-on Figma sprints, portfolio critiques, industry guest panels, and collaborative campus hackathons.
          </p>
        </div>

        {/* Campus Partners Ribbon */}
        <div className="events-partners-ribbon">
          <div className="partners-ribbon-left">
            <Users size={18} color="#C21356" />
            <span className="partners-label">Campus Partners:</span>
          </div>
          <div className="partners-chips-row">
            <span className="partner-chip">CSSS</span>
            <span className="partner-chip">zu</span>
            <span className="partner-chip">USSU</span>
            <span className="partner-chip">USask Cybersecurity</span>
            <span className="partner-chip">AWS Student Builders</span>
            <span className="partner-chip">Game Dev Club</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="events-filter-bar">
          <div className="filter-pills-list">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`events-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="events-count-badge">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        {/* Events Grid */}
        {isLoadingEvents ? (
          <div className="events-loading-box">
            <p>Loading upcoming events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="events-empty-box">
            <p>No events found under "{selectedCategory}". Check back soon!</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-top">
                  <div className="event-header-row">
                    <span className="event-tag">{event.category || 'Event'}</span>
                  </div>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc">{event.description}</p>
                </div>

                <div className="event-card-bottom">
                  <div className="event-meta-list">
                    <div className="meta-row">
                      <Calendar size={15} color="#FA7538" />
                      <span>{event.date}</span>
                    </div>
                    <div className="meta-row">
                      <MapPin size={15} color="#C21356" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <a 
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cal"
                    title={`Add "${event.title}" to Google Calendar`}
                  >
                    <CalendarPlus size={15} />
                    <span>Add to Calendar</span>
                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
