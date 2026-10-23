import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays } from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { Reveal, useCountUp } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import './EventsArchive.css';

function ArchiveStat({ value, label }) {
  const [ref, current] = useCountUp(value);
  return (
    <div className="archive-stat">
      <span ref={ref} className="archive-stat-value">{current}</span>
      <span className="archive-stat-label">{label}</span>
    </div>
  );
}

export default function PastEventsPage() {
  const { data: events = [], loading, error } = useApi('/api/events?when=past', { initial: [] });
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');

  const years = useMemo(() => [...new Set(events.map((e) => e.start_at.slice(0, 4)))], [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) =>
      (year === 'all' || e.start_at.startsWith(year)) &&
      (!q || `${e.title} ${e.category} ${e.summary} ${e.partners}`.toLowerCase().includes(q))
    );
  }, [events, year, query]);

  // Group by year for section headings
  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const y = e.start_at.slice(0, 4);
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(e);
    });
    return [...map.entries()];
  }, [filtered]);

  const totals = useMemo(() => ({
    events: events.length,
    photos: events.reduce((n, e) => n + (e.photo_count || 0), 0),
    attendees: events.reduce((n, e) => n + (e.attendees || 0), 0),
  }), [events]);

  return (
    <div className="app-container page-padded archive-page">
      <PageHero
        title="Every workshop, panel and jam we’ve hosted"
        lead="Recaps, photo albums, slides and recordings from past UX Collective events. Missed one? Catch up here."
      >
        <Link to="/events" className="btn-primary">
          <CalendarDays size={16} /> Upcoming events
        </Link>
      </PageHero>

      {events.length > 0 && (
        <Reveal variant="up" className="archive-stats" data-obstacle>
          <ArchiveStat value={totals.events} label="Events archived" />
          <ArchiveStat value={totals.attendees} label="Total attendees" />
          <ArchiveStat value={totals.photos} label="Photos" />
        </Reveal>
      )}

      <div className="archive-toolbar">
        <div className="pill-row archive-years" role="tablist" aria-label="Filter by year">
          {['all', ...years].map((y) => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={year === y}
              className={`pill-filter ${year === y ? 'active' : ''}`}
              onClick={() => setYear(y)}
            >
              {y === 'all' ? 'All years' : y}
            </button>
          ))}
        </div>
        <label className="archive-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search past events</span>
          <input
            type="search"
            placeholder="Search events, topics, partners…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="archive-grid">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
        </div>
      ) : error ? (
        <div className="state-box is-error">Couldn’t load the archive. Please refresh in a moment.</div>
      ) : groups.length === 0 ? (
        <div className="state-box">No past events match your search.</div>
      ) : (
        groups.map(([y, list]) => (
          <section key={y} className="archive-year-group">
            <Reveal variant="left" as="h2" className="archive-year-heading">
              <span>{y}</span>
              <span className="archive-year-count">{list.length} {list.length === 1 ? 'event' : 'events'}</span>
            </Reveal>
            <div className="archive-grid">
              {list.map((event, i) => (
                <Reveal key={event.id} variant="up" delay={(i % 3) * 100}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
