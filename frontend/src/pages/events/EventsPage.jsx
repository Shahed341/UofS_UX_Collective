import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Users,
  Sparkles,
  Briefcase,
  Clock,
  Laptop,
  Flame,
  CheckCircle2,
  ArrowRight,
  History
} from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import AddToCalendar from '../../components/events/AddToCalendar.jsx';
import CalendarSubscribe from '../../components/events/CalendarSubscribe.jsx';
import { Reveal } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { useSite } from '../../lib/site.jsx';
import { MONTHS, WEEKDAYS, formatTimeRange, parseDateTime } from '../../lib/dates.js';
import './EventsPage.css';

const EVENT_TRACKS = [
  { id: 'all', label: 'All events' },
  { id: 'workshop', label: '🎨 Design & Figma Labs', match: ['workshop', 'figma', 'lab'] },
  { id: 'panel', label: '💼 Career & Industry Panels', match: ['panel', 'career', 'talk'] },
  { id: 'sprint', label: '⚡ Design Jams & Sprints', match: ['sprint', 'jam', 'showcase'] },
  { id: 'community', label: '🤝 Campus Collabs & Socials', match: ['community', 'collab', 'social'] }
];

const SUBSCRIPTION_NOTICES = {
  confirmed: { tone: 'success', text: 'You’re subscribed! Upcoming events are on their way to your calendar.' },
  removed: { tone: 'success', text: 'You’ve been unsubscribed. You won’t receive event invites anymore.' },
  invalid: { tone: 'error', text: 'That subscription link is invalid or has already been used.' },
};

function dateParts(startAt) {
  const p = parseDateTime(startAt);
  return p
    ? { month: MONTHS[p.month].slice(0, 3).toUpperCase(), day: p.day, weekday: WEEKDAYS[p.weekday].slice(0, 3) }
    : { month: '', day: '', weekday: '' };
}

export default function EventsPage() {
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchParams] = useSearchParams();
  const notice = SUBSCRIPTION_NOTICES[searchParams.get('subscription')];
  const { discordInvite } = useSite();
  const { data: events = [], loading, error } = useApi('/api/events?when=upcoming', { initial: [] });

  const filteredEvents = useMemo(() => {
    const track = EVENT_TRACKS.find((t) => t.id === selectedTrack);
    if (!track?.match) return events;
    return events.filter((e) => track.match.some((m) => (e.category || '').toLowerCase().includes(m)));
  }, [events, selectedTrack]);

  // Spotlight: the event marked as featured in the admin, otherwise the next one
  const spotlightEvent = events.find((e) => e.featured) || events[0];
  const spotlightDate = spotlightEvent && dateParts(spotlightEvent.start_at);

  return (
    <div className="events-page-wrapper">
      <div className="app-container page-padded">
        {notice && (
          <div className={`ux-alert ${notice.tone} events-notice`} role="status">{notice.text}</div>
        )}

        <PageHero
          eyebrow="USask UX Collective Events"
          icon={<Flame size={14} />}
          title="Hands-on design. Real portfolio growth."
          lead="From Figma component architecture to multi-club tech jams with CSSS and industry panels with local agencies — every event is built to give you concrete skills."
        >
          <Link to="/events/past" className="btn-secondary">
            <History size={16} /> Past events & recaps
          </Link>
        </PageHero>

        {/* Spotlight ticket */}
        {spotlightEvent && (
          <Reveal variant="scale" className="spotlight-ticket-container">
            <div className="spotlight-ticket-inner">
              <div className="spotlight-badge-row">
                <span className="spotlight-flame-tag">
                  <Flame size={13} />
                  {spotlightEvent.featured ? 'FEATURED EVENT' : 'UP NEXT'}
                </span>
                <span className="spotlight-cat-tag">{spotlightEvent.category}</span>
              </div>

              <div className="spotlight-content-grid">
                <div className="spotlight-date-box">
                  <span className="spotlight-month">{spotlightDate.month}</span>
                  <span className="spotlight-day">{spotlightDate.day}</span>
                  <span className="spotlight-time">{formatTimeRange(spotlightEvent.start_at, spotlightEvent.end_at)}</span>
                </div>

                <div className="spotlight-center-info">
                  <h2 className="spotlight-title">
                    <Link to={`/events/${spotlightEvent.slug}`}>{spotlightEvent.title}</Link>
                  </h2>
                  <div className="spotlight-loc-row">
                    <MapPin size={16} color="#FA7538" />
                    <span>{spotlightEvent.location}</span>
                  </div>

                  <p className="spotlight-desc">{spotlightEvent.description}</p>

                  {spotlightEvent.highlights?.length > 0 && (
                    <div className="spotlight-points-grid">
                      {spotlightEvent.highlights.map((pt) => (
                        <div key={pt} className="spotlight-point-chip">
                          <CheckCircle2 size={14} color="#10B981" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="spotlight-action-box">
                  <AddToCalendar event={spotlightEvent} />
                  <a
                    href={spotlightEvent.rsvp_url || discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotlight-discord-link"
                  >
                    <span>{spotlightEvent.rsvp_url ? 'RSVP' : 'RSVP on Discord'}</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* What to expect */}
        <div className="events-principles-grid">
          {[
            { icon: <Sparkles size={20} color="#C21356" />, tone: 'pink', title: 'Zero Experience Required', text: "All workshops start from the fundamentals. Whether you're in Computer Science, Art, Business, or Engineering, everyone is welcome." },
            { icon: <Laptop size={20} color="#FA7538" />, tone: 'orange', title: 'Bring Your Laptop & Build', text: 'Hands-on sessions with live Figma templates, starter kits, and component systems you can keep and add to your portfolio.' },
            { icon: <Briefcase size={20} color="#D81E6B" />, tone: 'crimson', title: 'Industry Mentorship & Jams', text: 'Co-hosted panels with CSSS, USask Cyber, and guest design feedback from Saskatoon tech agencies like zu.' },
          ].map((card, i) => (
            <Reveal key={card.title} variant="up" delay={i * 110} className="event-principle-card">
              <div className={`principle-icon-box ${card.tone}`}>{card.icon}</div>
              <h3 className="principle-title">{card.title}</h3>
              <p className="principle-text">{card.text}</p>
            </Reveal>
          ))}
        </div>

        {/* Filter tracks */}
        <div className="events-tracks-bar">
          <div className="tracks-list" role="tablist" aria-label="Filter events">
            {EVENT_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={selectedTrack === track.id}
                className={`track-pill-btn ${selectedTrack === track.id ? 'active' : ''}`}
                onClick={() => setSelectedTrack(track.id)}
              >
                {track.label}
              </button>
            ))}
          </div>
          <span className="tracks-counter">
            {filteredEvents.length} upcoming {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Event tickets */}
        {loading ? (
          <div className="events-tickets-stack">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 150 }} />)}
          </div>
        ) : error ? (
          <div className="state-box is-error">Couldn’t load events right now. Please refresh in a moment.</div>
        ) : filteredEvents.length === 0 ? (
          <div className="state-box">
            No upcoming events in this track yet. Subscribe below and you’ll be the first to know — or{' '}
            <Link to="/events/past" className="inline-link">browse past recaps</Link>.
          </div>
        ) : (
          <div className="events-tickets-stack">
            {filteredEvents.map((event, i) => {
              const dt = dateParts(event.start_at);
              return (
                <Reveal key={event.id} variant="left" delay={Math.min(i, 4) * 90} className="event-ticket-row">
                  <div className="ticket-date-col">
                    <span className="ticket-weekday">{dt.weekday}</span>
                    <span className="ticket-day-num">{dt.day}</span>
                    <span className="ticket-month-name">{dt.month}</span>
                  </div>

                  <div className="ticket-main-col">
                    <div className="ticket-header-row">
                      <span className="ticket-tag">{event.category}</span>
                      <div className="ticket-time-chip">
                        <Clock size={13} color="#FA7538" />
                        <span>{formatTimeRange(event.start_at, event.end_at)}</span>
                      </div>
                      <div className="ticket-loc-chip">
                        <MapPin size={13} color="#C21356" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <h3 className="ticket-title">
                      <Link to={`/events/${event.slug}`}>{event.title}</Link>
                    </h3>
                    <p className="ticket-description">{event.summary || event.description}</p>

                    {event.highlights?.length > 0 && (
                      <div className="ticket-points-row">
                        {event.highlights.map((pt) => (
                          <span key={pt} className="ticket-bullet-pill">
                            <span className="bullet-dot" />
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ticket-action-col">
                    <AddToCalendar event={event} compact />
                    <Link to={`/events/${event.slug}`} className="ticket-details-link">
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="events-subscribe-wrap">
          <CalendarSubscribe />
        </div>

        {/* Campus partners */}
        <Reveal variant="up" className="events-campus-collab-footer">
          <div className="collab-footer-header">
            <Users size={18} color="#C21356" />
            <span>Official Campus Collaborations & Co-Hosts</span>
          </div>
          <div className="collab-footer-chips">
            {['CSSS (Computer Science)', 'zu (Product Design Agency)', "USSU (Students' Union)", 'USask Cybersecurity Club', 'AWS Student Builders', 'USask Game Dev Club'].map((p) => (
              <span key={p} className="collab-badge">{p}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
