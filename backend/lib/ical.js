/**
 * UX Collective — backend/lib/ical.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// iCalendar (RFC 5545) output for the subscribable feed and emailed invites.

const SITE_URL = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const CALENDAR_NAME = 'U of S UX Collective Events';

// Saskatoon has no DST, so a single fixed-offset VTIMEZONE is exact.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:America/Regina',
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:-0600',
  'TZOFFSETTO:-0600',
  'TZNAME:CST',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const escapeText = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// 'YYYY-MM-DD HH:MM:SS' -> 'YYYYMMDDTHHMMSS'
const localStamp = (dt) => String(dt).replace(/[-:]/g, '').replace(' ', 'T').slice(0, 15);

const utcStamp = (date = new Date()) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function addHours(dt, hours) {
  const d = new Date(`${String(dt).replace(' ', 'T')}Z`);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Lines longer than 75 octets must be folded (RFC 5545 §3.1).
function fold(line) {
  const out = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join('\r\n');
}

export const eventUid = (event) => `event-${event.id}@uxco.usask`;

function vevent(event, { method, organizerEmail } = {}) {
  const url = `${SITE_URL()}/events/${event.slug}`;
  const description = `${event.summary || event.description || ''}\n\nDetails: ${url}`;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${eventUid(event)}`,
    `DTSTAMP:${utcStamp()}`,
    `SEQUENCE:${event.sequence || 0}`,
    `DTSTART;TZID=America/Regina:${localStamp(event.start_at)}`,
    `DTEND;TZID=America/Regina:${localStamp(event.end_at || addHours(event.start_at, 2))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    `CATEGORIES:${escapeText(event.category)}`,
    `STATUS:${method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'TRANSP:OPAQUE',
  ];
  if (organizerEmail) lines.push(`ORGANIZER;CN=${escapeText('UX Collective')}:mailto:${organizerEmail}`);
  if (method === 'REQUEST' && event.attendeeEmail) {
    lines.push(`ATTENDEE;RSVP=FALSE;PARTSTAT=NEEDS-ACTION;ROLE=REQ-PARTICIPANT:mailto:${event.attendeeEmail}`);
  }
  lines.push('END:VEVENT');
  return lines;
}

// Builds a VCALENDAR. method: undefined for the subscription feed, 'REQUEST' / 'CANCEL' for emailed invites.
export function buildCalendar(events, { method, organizerEmail } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//U of S UX Collective//Events//EN',
    'CALSCALE:GREGORIAN',
    ...(method ? [`METHOD:${method}`] : ['METHOD:PUBLISH']),
    `X-WR-CALNAME:${CALENDAR_NAME}`,
    'X-WR-TIMEZONE:America/Regina',
    `X-WR-CALDESC:${escapeText('Workshops, panels and socials from the University of Saskatchewan UX Collective.')}`,
    // Ask calendar apps to re-check the feed regularly (Google ignores this and refreshes on its own schedule)
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...VTIMEZONE,
    ...events.flatMap((e) => vevent(e, { method, organizerEmail })),
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
