/**
 * UX Collective — frontend/src/pages/events/EventDetailPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin, Users, Presentation, PlayCircle, Handshake, CheckCircle2, Share2, Check
} from 'lucide-react';
import SmartImage from '../../components/common/SmartImage.jsx';
import Lightbox from '../../components/common/Lightbox.jsx';
import AddToCalendar from '../../components/events/AddToCalendar.jsx';
import { Reveal, SplitText, useScrollProgress } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { useSite } from '../../lib/site.jsx';
import { formatDate, formatTimeRange } from '../../lib/dates.js';
import './EventsArchive.css';

// Cover image that drifts slower than the page while scrolling.
function ParallaxCover({ src }) {
  const [ref, progress] = useScrollProgress();
  return (
    <div ref={ref} className="event-detail-cover-wrap">
      <div className="event-detail-cover" style={{ transform: `translateY(${(progress - 0.5) * 50}px) scale(1.12)` }}>
        <SmartImage src={src} alt="" eager />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const { data: event, loading, error } = useApi(`/api/events/${encodeURIComponent(slug)}`);
  const { data: upcoming = [] } = useApi('/api/events?when=upcoming', { initial: [] });
  const { discordInvite } = useSite();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="app-container page-padded">
        <div className="skeleton" style={{ height: 380, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="app-container page-padded">
        <div className="state-box is-error event-missing">
          <h1>Event not found</h1>
          <p>This event may have been moved or removed.</p>
          <Link to="/events" className="btn-primary">See upcoming events</Link>
        </div>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share sheet dismissed
    }
  };

  const more = upcoming.filter((e) => e.id !== event.id).slice(0, 3);
  const photos = event.photos || [];

  return (
    <article className="event-detail">
      <header className="event-detail-hero">
        <ParallaxCover src={event.cover_image || photos[0]?.url} />
        <div className="event-detail-hero-shade" />
        <div className="app-container event-detail-hero-content">
          <Link to={event.is_past ? '/events/past' : '/events'} className="event-detail-back">
            <ArrowLeft size={16} /> {event.is_past ? 'Event archive' : 'All events'}
          </Link>
          <span className="event-detail-badge">{event.is_past ? 'Past event' : event.category}</span>
          <SplitText as="h1" text={event.title} className="event-detail-title" startDelay={100} stagger={45} />
          <Reveal variant="up" delay={300} className="event-detail-meta">
            <span><CalendarDays size={16} /> {formatDate(event.start_at)}</span>
            <span><Clock size={16} /> {formatTimeRange(event.start_at, event.end_at)}</span>
            <span><MapPin size={16} /> {event.location}</span>
            {event.attendees ? <span><Users size={16} /> {event.attendees} attended</span> : null}
          </Reveal>
        </div>
      </header>

      <div className="app-container event-detail-body">
        <div className="event-detail-main">
          {event.is_past && event.recap && (
            <Reveal variant="up" as="section" className="event-detail-section">
              <h2 className="event-detail-h2">Recap</h2>
              <p className="event-detail-text">{event.recap}</p>
            </Reveal>
          )}

          <Reveal variant="up" as="section" className="event-detail-section">
            <h2 className="event-detail-h2">{event.is_past ? 'About the event' : 'What to expect'}</h2>
            <p className="event-detail-text">{event.description}</p>
            {event.highlights?.length > 0 && (
              <ul className="event-detail-highlights">
                {event.highlights.map((h) => (
                  <li key={h}><CheckCircle2 size={17} /> {h}</li>
                ))}
              </ul>
            )}
          </Reveal>

          {photos.length > 0 && (
            <section className="event-detail-section">
              <Reveal variant="up" as="h2" className="event-detail-h2">
                Photo album <span className="event-detail-count">{photos.length}</span>
              </Reveal>
              <div className="event-album">
                {photos.map((photo, i) => (
                  <Reveal key={photo.id} variant="scale" delay={(i % 4) * 80} className="event-album-item">
                    <button type="button" onClick={() => setLightboxIndex(i)} aria-label={`Open photo: ${photo.caption || event.title}`}>
                      <SmartImage src={photo.url} alt={photo.caption || ''} />
                      {photo.caption && <span className="event-album-caption">{photo.caption}</span>}
                    </button>
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="event-detail-aside">
          <Reveal variant="right" className="event-detail-card" data-obstacle>
            {event.is_past ? (
              <>
                <h3 className="event-detail-card-title">Resources from this event</h3>
                {event.slides_url || event.recording_url ? (
                  <div className="event-detail-links">
                    {event.slides_url && (
                      <a href={event.slides_url} target="_blank" rel="noopener noreferrer" className="event-detail-link">
                        <Presentation size={18} /> Slides & materials
                      </a>
                    )}
                    {event.recording_url && (
                      <a href={event.recording_url} target="_blank" rel="noopener noreferrer" className="event-detail-link">
                        <PlayCircle size={18} /> Watch the recording
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="event-detail-muted">No slides were shared for this one. Ask in Discord!</p>
                )}
              </>
            ) : (
              <>
                <h3 className="event-detail-card-title">Save your spot</h3>
                <AddToCalendar event={event} />
                <a href={event.rsvp_url || discordInvite} target="_blank" rel="noopener noreferrer" className="btn-secondary event-detail-rsvp">
                  {event.rsvp_url ? 'RSVP' : 'RSVP on Discord'} <ArrowRight size={15} />
                </a>
              </>
            )}

            {event.partners && (
              <div className="event-detail-partners">
                <Handshake size={16} />
                <span>With {event.partners}</span>
              </div>
            )}

            <button type="button" className="event-detail-share" onClick={share}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link copied' : 'Share this event'}
            </button>
          </Reveal>

          {more.length > 0 && (
            <Reveal variant="right" delay={120} className="event-detail-card">
              <h3 className="event-detail-card-title">Coming up next</h3>
              <ul className="event-detail-more">
                {more.map((e) => (
                  <li key={e.id}>
                    <Link to={`/events/${e.slug}`}>
                      <span className="more-date">{formatDate(e.start_at, { weekday: false, year: false, short: true })}</span>
                      <span className="more-title">{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </aside>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}
