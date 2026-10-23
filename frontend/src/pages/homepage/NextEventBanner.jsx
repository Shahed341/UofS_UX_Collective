import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal } from '../../lib/motion.jsx';
import { formatDate, formatTimeRange, toInstant } from '../../lib/dates.js';
import AddToCalendar from '../../components/events/AddToCalendar.jsx';

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    live: diff === 0,
  };
}

// Countdown card for the next upcoming event.
export default function NextEventBanner({ event }) {
  const countdown = useCountdown(toInstant(event.start_at));
  const units = [
    ['days', countdown.days],
    ['hrs', countdown.hours],
    ['min', countdown.minutes],
    ['sec', countdown.seconds],
  ];

  return (
    <Reveal variant="scale" className="next-event-banner">
      <div className="next-event-info">
        <span className="section-eyebrow next-event-eyebrow">
          {countdown.live ? 'Happening now' : 'Next event'}
        </span>
        <h2 className="next-event-title">{event.title}</h2>
        <p className="next-event-meta">
          {formatDate(event.start_at)} · {formatTimeRange(event.start_at, event.end_at)}
          <span><MapPin size={14} /> {event.location}</span>
        </p>
      </div>

      {!countdown.live && (
        <div className="next-event-countdown" aria-label="Time until the event starts">
          {units.map(([label, value]) => (
            <div key={label} className="countdown-unit">
              <span key={value} className="countdown-value">{String(value).padStart(2, '0')}</span>
              <span className="countdown-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="next-event-actions">
        <AddToCalendar event={event} compact />
        <Link to={`/events/${event.slug}`} className="next-event-details">
          Details <ArrowRight size={15} />
        </Link>
      </div>
    </Reveal>
  );
}
