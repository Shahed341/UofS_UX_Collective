/**
 * UX Collective — frontend/src/components/events/EventCard.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Users, ArrowUpRight } from 'lucide-react';
import SmartImage from '../common/SmartImage.jsx';
import { TiltCard } from '../../lib/motion.jsx';
import { MONTHS, parseDateTime } from '../../lib/dates.js';
import './events.css';

// Photo-forward card used in the past events archive and homepage recap strip.
export default function EventCard({ event }) {
  const d = parseDateTime(event.start_at);
  return (
    <TiltCard as={Link} to={`/events/${event.slug}`} className="archive-card" maxDeg={6}>
      <div className="archive-card-media">
        <SmartImage src={event.cover_image || event.photos?.[0]?.url} alt="" className="archive-card-img" />
        <span className="archive-card-date">
          <strong>{d?.day}</strong>
          {d && MONTHS[d.month].slice(0, 3)} {d?.year}
        </span>
        {event.photo_count > 0 && (
          <span className="archive-card-photos">
            <Camera size={13} /> {event.photo_count}
          </span>
        )}
      </div>
      <div className="archive-card-body">
        <span className="archive-card-cat">{event.category}</span>
        <h3 className="archive-card-title">{event.title}</h3>
        {event.summary && <p className="archive-card-summary">{event.summary}</p>}
        <div className="archive-card-meta">
          <span><MapPin size={13} /> {event.location}</span>
          {event.attendees ? <span><Users size={13} /> {event.attendees} attended</span> : null}
        </div>
        <span className="archive-card-cta">
          View recap <ArrowUpRight size={15} />
        </span>
      </div>
    </TiltCard>
  );
}
