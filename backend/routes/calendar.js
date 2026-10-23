import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { listEvents } from '../lib/events.js';
import { buildCalendar } from '../lib/ical.js';
import { mailConfigured } from '../lib/mailer.js';
import { newToken, notifySubscribers, sendConfirmation } from '../lib/subscriptions.js';
import { asyncRoute, saskatoonNow, validate } from '../lib/util.js';

const router = Router();
const SITE_URL = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

// Subscribable iCalendar feed. Calendar apps poll this URL, so new events appear automatically.
router.get('/calendar.ics', asyncRoute(async (req, res) => {
  const now = saskatoonNow();
  const oneYearAgo = `${Number(now.slice(0, 4)) - 1}${now.slice(4)}`;
  const events = (await listEvents()).filter((e) => (e.end_at || e.start_at) >= oneYearAgo);
  res.set({
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'inline; filename="uxco-events.ics"',
    'Cache-Control': 'public, max-age=900',
  });
  res.send(buildCalendar(events));
}));

router.post('/calendar/subscribe', subscribeLimiter, asyncRoute(async (req, res) => {
  if (typeof req.body?.website === 'string' && req.body.website.trim()) return res.json({ success: true });
  const { data, error } = validate(req.body, { email: { required: true, max: 150, email: true } });
  if (error) return res.status(400).json({ success: false, error });
  const email = data.email.toLowerCase();

  const [[existing]] = await pool.query('SELECT token, confirmed FROM calendar_subscribers WHERE email = ?', [email]);
  if (existing?.confirmed) {
    return res.json({ success: true, status: 'already', message: 'You are already subscribed. New events will land in your calendar.' });
  }
  const token = existing?.token || newToken();
  if (!existing) await pool.query('INSERT INTO calendar_subscribers (email, token) VALUES (?, ?)', [email, token]);

  await sendConfirmation(email, token);
  res.json({
    success: true,
    status: 'pending',
    message: mailConfigured
      ? 'Check your inbox and confirm. After that, every new event is sent straight to your calendar.'
      : 'You are on the list! Email delivery is not switched on yet, so use the calendar buttons to subscribe right away.',
  });
}));

router.get('/calendar/confirm', asyncRoute(async (req, res) => {
  const token = String(req.query.token || '');
  const [[sub]] = await pool.query('SELECT id, email, token, confirmed FROM calendar_subscribers WHERE token = ?', [token]);
  if (!sub) return res.redirect(`${SITE_URL()}/events?subscription=invalid`);

  if (!sub.confirmed) {
    await pool.query('UPDATE calendar_subscribers SET confirmed = 1, confirmed_at = NOW() WHERE id = ?', [sub.id]);
    // Send invites for everything already scheduled so their calendar is complete from day one
    const upcoming = await listEvents({ when: 'upcoming' });
    (async () => {
      for (const event of upcoming) await notifySubscribers(event, 'REQUEST', [sub]);
    })().catch((error) => console.error('Welcome invites failed:', error));
  }
  res.redirect(`${SITE_URL()}/events?subscription=confirmed`);
}));

router.get('/calendar/unsubscribe', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM calendar_subscribers WHERE token = ?', [String(req.query.token || '')]);
  res.redirect(`${SITE_URL()}/events?subscription=removed`);
}));

export default router;
