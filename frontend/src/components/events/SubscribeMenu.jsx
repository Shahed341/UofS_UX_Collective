import React, { useEffect, useRef, useState } from 'react';
import { BellRing, Check, ChevronDown, Copy, Mail, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { CALENDAR_APPS, copyFeedUrl } from '../../lib/calendarFeed.js';
import './SubscribeMenu.css';

// "Subscribe to events" button with a menu: one-tap calendar app subscriptions, copy link, or email invites.
export default function SubscribeMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const rootRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copy = async () => {
    if (await copyFeedUrl()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subscribeByEmail = async (e) => {
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

  return (
    <div className="subscribe-menu" ref={rootRef}>
      <button
        type="button"
        className={`subscribe-menu-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <BellRing size={17} className="subscribe-menu-bell" />
        <span className="subscribe-menu-label">Subscribe<span className="subscribe-menu-long"> to events</span></span>
        <ChevronDown size={16} className="subscribe-menu-chevron" />
      </button>

      {open && (
        <div className="subscribe-menu-panel" role="dialog" aria-label="Subscribe to club events">
          <div className="subscribe-menu-head">
            <div>
              <strong>Never miss an event</strong>
              <span>New and updated events appear in your calendar automatically.</span>
            </div>
            <button type="button" className="subscribe-menu-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="subscribe-menu-apps">
            {CALENDAR_APPS.map((app) => (
              <a
                key={app.id}
                href={app.href()}
                target={app.newTab ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`subscribe-app ${app.id}`}
                onClick={() => setOpen(false)}
              >
                <span className="subscribe-app-dot" />
                {app.label}
              </a>
            ))}
            <button type="button" className="subscribe-app copy" onClick={copy}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Link copied' : 'Copy feed link'}
            </button>
          </div>

          <form className="subscribe-menu-email" onSubmit={subscribeByEmail}>
            <label htmlFor="subscribe-menu-email" className="subscribe-menu-or">
              <Mail size={14} /> Or get invites by email
            </label>
            <div className="subscribe-menu-row">
              <input
                id="subscribe-menu-email"
                type="email"
                required
                placeholder="you@usask.ca"
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
              <button type="submit" disabled={status.state === 'loading'}>
                {status.state === 'loading' ? '…' : 'Join'}
              </button>
            </div>
            {status.message && <p className={`subscribe-menu-status ${status.state}`} role="status">{status.message}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
