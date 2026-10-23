// Event times come from the API as 'YYYY-MM-DD HH:MM:SS' in Saskatoon local time (UTC-6, no DST).
// We treat them as wall-clock values and never convert them through the browser's timezone.

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SASKATOON_OFFSET_HOURS = 6;

export function parseDateTime(value) {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [year, month, day, hour = 0, minute = 0] = [+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)];
  const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
  return { year, month, day, hour, minute, weekday };
}

// Absolute timestamp (ms) for a Saskatoon wall-clock value.
export function toInstant(value) {
  const p = parseDateTime(value);
  return p ? Date.UTC(p.year, p.month, p.day, p.hour + SASKATOON_OFFSET_HOURS, p.minute) : NaN;
}

// Today's date in Saskatoon as { year, month, day }.
export function saskatoonToday() {
  const now = new Date(Date.now() - SASKATOON_OFFSET_HOURS * 3600 * 1000);
  return { year: now.getUTCFullYear(), month: now.getUTCMonth(), day: now.getUTCDate() };
}

export function formatTime({ hour, minute }) {
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function formatTimeRange(startAt, endAt) {
  const start = parseDateTime(startAt);
  if (!start) return '';
  const end = parseDateTime(endAt);
  if (!end) return formatTime(start);
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day;
  return sameDay
    ? `${formatTime(start)} – ${formatTime(end)}`
    : `${formatTime(start)} – ${MONTHS[end.month].slice(0, 3)} ${end.day}, ${formatTime(end)}`;
}

export function formatDate(value, { weekday = true, year = true, short = false } = {}) {
  const p = parseDateTime(value);
  if (!p) return '';
  const month = short ? MONTHS[p.month].slice(0, 3) : MONTHS[p.month];
  const wd = weekday ? `${short ? WEEKDAYS[p.weekday].slice(0, 3) : WEEKDAYS[p.weekday]}, ` : '';
  return `${wd}${month} ${p.day}${year ? `, ${p.year}` : ''}`;
}

export function dateKey({ year, month, day }) {
  return `${year}-${month}-${day}`;
}

const pad = (n) => String(n).padStart(2, '0');
const calStamp = (p) => `${p.year}${pad(p.month + 1)}${pad(p.day)}T${pad(p.hour)}${pad(p.minute)}00`;

export function googleCalendarUrl(event) {
  const start = parseDateTime(event.start_at);
  if (!start) return 'https://calendar.google.com/';
  const end = parseDateTime(event.end_at) || { ...start, hour: Math.min(start.hour + 2, 23) };
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `UXCO: ${event.title}`,
    dates: `${calStamp(start)}/${calStamp(end)}`,
    ctz: 'America/Regina',
    details: `${event.summary || event.description || ''}\n\n${window.location.origin}/events/${event.slug}`,
    location: event.location || 'University of Saskatchewan',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Downloadable .ics file for Apple Calendar / Outlook users.
export function icsDataUrl(event) {
  const start = parseDateTime(event.start_at);
  if (!start) return '#';
  const end = parseDateTime(event.end_at) || { ...start, hour: Math.min(start.hour + 2, 23) };
  const escape = (s) => String(s || '').replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UXCO//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.slug}@uxco`,
    `DTSTART;TZID=America/Regina:${calStamp(start)}`,
    `DTEND;TZID=America/Regina:${calStamp(end)}`,
    `SUMMARY:${escape(`UXCO: ${event.title}`)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(event.summary || event.description)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
