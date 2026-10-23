import crypto from 'node:crypto';
import { pool } from '../db.js';
import { buildCalendar } from './ical.js';
import { mailConfigured, organizerAddress, sendMail } from './mailer.js';
import { saskatoonNow } from './util.js';

const SITE_URL = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_URL = () => (process.env.PUBLIC_API_URL || SITE_URL()).replace(/\/$/, '');

export const newToken = () => crypto.randomBytes(24).toString('base64url');

const unsubscribeLink = (token) => `${API_URL()}/api/calendar/unsubscribe?token=${token}`;

export async function sendConfirmation(email, token) {
  const confirm = `${API_URL()}/api/calendar/confirm?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Confirm your UX Collective calendar subscription',
    text: `Hi!\n\nConfirm your subscription to get UX Collective events added to your calendar automatically:\n${confirm}\n\nIf you didn't ask for this, just ignore this email.`,
    html: `<p>Hi!</p><p>Confirm your subscription to get UX Collective events added to your calendar automatically.</p>
      <p><a href="${confirm}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#C21356;color:#fff;font-weight:700;text-decoration:none">Confirm subscription</a></p>
      <p style="color:#666;font-size:13px">If you didn't ask for this, just ignore this email.</p>`,
  });
}

// Emails a calendar invite (REQUEST) or cancellation (CANCEL) for one event to every confirmed subscriber.
// Gmail, Outlook and Apple Mail add/update/remove the event in the recipient's calendar from this.
// `only` limits delivery to specific subscribers (e.g. someone who just confirmed).
export async function notifySubscribers(event, method = 'REQUEST', only = null) {
  if (!event || (event.status !== 'published' && method === 'REQUEST')) return { sent: 0 };
  // Don't invite people to (or cancel) events that are already over
  if ((event.end_at || event.start_at) < saskatoonNow()) return { sent: 0 };

  const subscribers = only || (await pool.query('SELECT email, token FROM calendar_subscribers WHERE confirmed = 1'))[0];
  if (!subscribers.length) return { sent: 0 };
  if (!mailConfigured) {
    console.log(`[mail disabled] ${method} for "${event.title}" would go to ${subscribers.length} subscriber(s)`);
    return { sent: 0, skipped: subscribers.length };
  }

  const url = `${SITE_URL()}/events/${event.slug}`;
  const verb = method === 'CANCEL' ? 'Cancelled' : event.sequence > 0 ? 'Updated' : 'New event';
  let sent = 0;

  for (const sub of subscribers) {
    const ics = buildCalendar([{ ...event, attendeeEmail: sub.email }], { method, organizerEmail: organizerAddress() });
    try {
      await sendMail({
        to: sub.email,
        subject: `${verb}: ${event.title}`,
        text: `${event.title}\n${event.location}\n\n${event.summary || event.description}\n\nDetails: ${url}\n\nUnsubscribe: ${unsubscribeLink(sub.token)}`,
        html: `<h2 style="margin:0 0 8px">${event.title}</h2>
          <p style="margin:0 0 12px;color:#555">${event.location}</p>
          <p>${event.summary || event.description}</p>
          <p><a href="${url}">Event details</a></p>
          <p style="color:#888;font-size:12px">You're receiving this because you subscribed to UX Collective events.
          <a href="${unsubscribeLink(sub.token)}">Unsubscribe</a></p>`,
        icalEvent: { method, filename: 'invite.ics', content: ics },
      });
      sent++;
    } catch (error) {
      console.error(`Failed to send invite to ${sub.email}:`, error.message);
    }
  }
  return { sent };
}

// Fire-and-forget wrapper so admin requests don't wait for email delivery.
export function notifyInBackground(event, method, only) {
  notifySubscribers(event, method, only).catch((error) => console.error('Subscriber notification failed:', error));
}
