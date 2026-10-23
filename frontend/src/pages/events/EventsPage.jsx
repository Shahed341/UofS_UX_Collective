/**
 * UX Collective — frontend/src/pages/events/EventsPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarPlus, Clock, MapPin } from 'lucide-react';
import SubscribeMenu from '../../components/events/SubscribeMenu.jsx';
import { Reveal, SplitText } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { MONTHS, WEEKDAYS, formatTimeRange, googleCalendarUrl, parseDateTime } from '../../lib/dates.js';
import './EventsPage.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'workshop', label: 'Workshops', match: ['workshop', 'figma', 'lab'] },
  { id: 'career', label: 'Career', match: ['panel', 'career', 'talk'] },
  { id: 'jam', label: 'Jams', match: ['sprint', 'jam', 'showcase'] },
  { id: 'social', label: 'Socials', match: ['community', 'collab', 'social'] },
];

const SUBSCRIPTION_NOTICES = {
  confirmed: { tone: 'success', text: 'You’re subscribed. Upcoming events are on their way to your calendar.' },
  removed: { tone: 'success', text: 'You’ve been unsubscribed.' },
  invalid: { tone: 'error', text: 'That subscription link is invalid or already used.' },
};

function EventRow({ event }) {
  const d = parseDateTime(event.start_at);
  return (
    <article className="ev-row">
      <Link to={`/events/${event.slug}`} className="ev-row-link" aria-label={event.title} />
      <div className="ev-date">
        <span className="ev-date-month">{d && MONTHS[d.month].slice(0, 3)}</span>
        <span className="ev-date-day">{d?.day}</span>
        <span className="ev-date-weekday">{d && WEEKDAYS[d.weekday].slice(0, 3)}</span>
      </div>
      <div className="ev-body">
        <span className="ev-category">{event.category}</span>
        <h2 className="ev-title">{event.title}</h2>
        <p className="ev-meta">
          <span><Clock size={14} /> {formatTimeRange(event.start_at, event.end_at)}</span>
          <span><MapPin size={14} /> {event.location}</span>
        </p>
      </div>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="ev-cal-btn"
        title="Add to calendar"
        aria-label={`Add ${event.title} to calendar`}
      >
        <CalendarPlus size={18} />
      </a>
      <ArrowRight size={18} className="ev-arrow" aria-hidden="true" />
    </article>
  );
}

export default function EventsPage() {
  const [filter, setFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const notice = SUBSCRIPTION_NOTICES[searchParams.get('subscription')];
  const { data: events = [], loading, error } = useApi('/api/events?when=upcoming', { initial: [] });

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    if (!f?.match) return events;
    return events.filter((e) => f.match.some((m) => (e.category || '').toLowerCase().includes(m)));
  }, [events, filter]);

  return (
    <div className="app-container page-padded events-page">
      {notice && <div className={`ux-alert ${notice.tone} events-notice`} role="status">{notice.text}</div>}

      <header className="events-head">
        <SplitText as="h1" text="Upcoming events" className="events-title" startDelay={80} />
        <SubscribeMenu />
      </header>
      <p className="events-lead">Workshops, panels and socials. Free and open to every USask student.</p>

      <div className="events-filters" role="tablist" aria-label="Filter events">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`pill-filter ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ev-list">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 104 }} />)}
        </div>
      ) : error ? (
        <div className="state-box is-error">Couldn’t load events. Please refresh.</div>
      ) : visible.length === 0 ? (
        <div className="state-box">Nothing scheduled here yet. Subscribe to hear first.</div>
      ) : (
        <div className="ev-list" key={filter}>
          {visible.map((event, i) => (
            <Reveal key={event.id} variant="up" delay={Math.min(i, 5) * 70}>
              <EventRow event={event} />
            </Reveal>
          ))}
        </div>
      )}

      <Link to="/events/past" className="events-past-link">
        Past events & recaps <ArrowRight size={16} />
      </Link>
    </div>
  );
}
