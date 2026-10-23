import React, { useEffect, useState } from 'react';
import { toInstant } from '../../lib/dates.js';
import './events.css';

// Live days/hours/minutes/seconds until an event starts; shows "Happening now" once it begins.
export default function EventCountdown({ startAt }) {
  const target = toInstant(startAt);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, target - now);
  if (diff === 0) return <span className="event-countdown-live">Happening now</span>;

  const units = [
    ['days', Math.floor(diff / 86400000)],
    ['hrs', Math.floor((diff / 3600000) % 24)],
    ['min', Math.floor((diff / 60000) % 60)],
    ['sec', Math.floor((diff / 1000) % 60)],
  ];

  return (
    <div className="event-countdown" aria-label="Time until the event starts">
      {units.map(([label, value]) => (
        <div key={label} className="event-countdown-unit">
          <span key={value} className="event-countdown-value">{String(value).padStart(2, '0')}</span>
          <span className="event-countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
