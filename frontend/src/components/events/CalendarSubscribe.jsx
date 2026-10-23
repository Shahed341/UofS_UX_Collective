import React, { useState } from 'react';
import { BellRing, Check, Copy, Mail } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Reveal } from '../../lib/motion.jsx';
import { CALENDAR_APPS, copyFeedUrl } from '../../lib/calendarFeed.js';
import './CalendarSubscribe.css';

// "Never miss an event": subscribe to the live calendar feed, or get invites by email.
export default function CalendarSubscribe() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [copied, setCopied] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await api.post('/api/calendar/subscribe', { email, website });
      setStatus({ state: 'success', message: res.message });
      setEmail('');
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  const copyFeed = async () => {
    if (await copyFeedUrl()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Reveal variant="up" className="cal-subscribe" data-obstacle>
      <div className="cal-subscribe-icon" aria-hidden="true">
        <BellRing size={24} />
      </div>

      <div className="cal-subscribe-copy">
        <h2 className="cal-subscribe-title">Never miss an event</h2>
        <p className="cal-subscribe-text">
          Subscribe once and every new workshop, panel and social appears in your calendar automatically, including time changes.
        </p>
      </div>

      <div className="cal-subscribe-actions">
        <div className="cal-subscribe-apps">
          {CALENDAR_APPS.map((app) => (
            <a key={app.id} href={app.href()} target={app.newTab ? '_blank' : undefined} rel="noopener noreferrer" className={`cal-app-btn ${app.id}`}>
              {app.label}
            </a>
          ))}
          <button type="button" className="cal-app-btn copy" onClick={copyFeed}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>

        <form className="cal-subscribe-form" onSubmit={subscribe}>
          <label htmlFor="cal-sub-email" className="cal-subscribe-or">or get invites by email</label>
          <div className="cal-subscribe-row">
            <Mail size={17} className="cal-subscribe-mail" aria-hidden="true" />
            <input
              id="cal-sub-email"
              type="email"
              required
              placeholder="you@usask.ca"
              className="cal-subscribe-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="ux-honeypot"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <button type="submit" className="cal-subscribe-submit" disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'Sending…' : 'Subscribe'}
            </button>
          </div>
          {status.message && (
            <p className={`cal-subscribe-status ${status.state}`} role="status">{status.message}</p>
          )}
        </form>
      </div>
    </Reveal>
  );
}
