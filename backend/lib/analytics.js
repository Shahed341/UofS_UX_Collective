/**
 * UX Collective — backend/lib/analytics.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { pool } from '../db.js';
import { saskatoonNow } from './util.js';

// Anonymous, cookie-free analytics. The browser sends a random per-visit id
// (sessionStorage), never anything personal. Only these action types are accepted.
export const TRACK_TYPES = [
  'page_view',        // path = page
  'calendar_add',     // target = event slug
  'subscribe_click',  // target = google | apple | outlook | copy
  'subscribe_email',  // email subscription submitted
  'join_click',       // target = where the Discord link was clicked
  'resource_click',   // target = resource title
  'game_start',       // target = game id
  'game_finish',      // target = game id
  'form_submit',      // target = contact | role | mentorship
];

// Dates are bucketed by Saskatoon day (UTC-6, no DST); TIMESTAMP columns are stored in UTC.
const LOCAL_DAY = "DATE(CONVERT_TZ(created_at, '+00:00', '-06:00'))";

export async function recordEvent({ type, path, target, sid }) {
  await pool.query(
    'INSERT INTO analytics_events (type, path, target, session_id) VALUES (?, ?, ?, ?)',
    [type, path, target, sid]
  );
}

// Called whenever a live Discord count is fetched; keeps one value per day.
export async function snapshotMembers(members) {
  await pool.query(
    'INSERT INTO stat_snapshots (snap_date, members) VALUES (?, ?) ON DUPLICATE KEY UPDATE members = VALUES(members)',
    [saskatoonNow().slice(0, 10), members]
  );
}

const utcDaysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace('T', ' ');

async function count(sql, params) {
  const [[row]] = await pool.query(sql, params);
  return Number(row.n) || 0;
}

async function periodTotals(from, to) {
  const between = 'created_at >= ? AND created_at < ?';
  const p = [from, to];
  const byType = async (type) => count(`SELECT COUNT(*) AS n FROM analytics_events WHERE type = ? AND ${between}`, [type, ...p]);
  return {
    pageViews: await byType('page_view'),
    visitors: await count(`SELECT COUNT(DISTINCT session_id) AS n FROM analytics_events WHERE ${between}`, p),
    calendarAdds: await byType('calendar_add'),
    subscribeClicks: (await byType('subscribe_click')) + (await byType('subscribe_email')),
    joinClicks: await byType('join_click'),
    gamePlays: await byType('game_start'),
    resourceClicks: await byType('resource_click'),
    formSubmits: await byType('form_submit'),
  };
}

// Everything the admin dashboard shows for the last `days` days, with the previous period for comparison.
export async function getAnalytics(days) {
  const from = utcDaysAgo(days);
  const prevFrom = utcDaysAgo(days * 2);
  const now = utcDaysAgo(0);
  const between = 'created_at >= ?';

  const [current, previous] = await Promise.all([periodTotals(from, now), periodTotals(prevFrom, from)]);

  const [daily] = await pool.query(
    `SELECT ${LOCAL_DAY} AS day,
            SUM(type = 'page_view') AS views,
            COUNT(DISTINCT session_id) AS visitors
     FROM analytics_events WHERE ${between}
     GROUP BY day ORDER BY day`,
    [from]
  );

  const [members] = await pool.query(
    'SELECT snap_date AS day, members FROM stat_snapshots WHERE snap_date >= ? ORDER BY snap_date',
    [from.slice(0, 10)]
  );

  const [topPages] = await pool.query(
    `SELECT path AS label, COUNT(*) AS value FROM analytics_events
     WHERE type = 'page_view' AND ${between} AND path NOT LIKE '/events/%'
     GROUP BY path ORDER BY value DESC LIMIT 8`,
    [from]
  );

  // Event engagement: detail-page views and calendar adds per event
  const [eventRows] = await pool.query(
    `SELECT e.slug, e.title,
            SUM(a.type = 'page_view') AS views,
            SUM(a.type = 'calendar_add') AS calendar_adds
     FROM analytics_events a
     JOIN events e ON (a.type = 'page_view' AND a.path = CONCAT('/events/', e.slug))
                   OR (a.type = 'calendar_add' AND a.target = e.slug)
     WHERE a.${between}
     GROUP BY e.id ORDER BY views + calendar_adds DESC LIMIT 8`,
    [from]
  );

  const [gameRows] = await pool.query(
    `SELECT target AS game, SUM(type = 'game_start') AS plays, SUM(type = 'game_finish') AS finishes
     FROM analytics_events WHERE type IN ('game_start', 'game_finish') AND ${between}
     GROUP BY target`,
    [from]
  );
  const [scoreRows] = await pool.query(
    `SELECT game, COUNT(*) AS saved, COUNT(DISTINCT LOWER(name)) AS players, MAX(score) AS best
     FROM game_scores WHERE ${between} GROUP BY game`,
    [from]
  );

  const [resources] = await pool.query(
    `SELECT target AS label, COUNT(*) AS value FROM analytics_events
     WHERE type = 'resource_click' AND ${between} GROUP BY target ORDER BY value DESC LIMIT 6`,
    [from]
  );

  const [subscribeApps] = await pool.query(
    `SELECT target AS label, COUNT(*) AS value FROM analytics_events
     WHERE type = 'subscribe_click' AND ${between} GROUP BY target ORDER BY value DESC`,
    [from]
  );

  const community = {
    newSubscribers: await count('SELECT COUNT(*) AS n FROM calendar_subscribers WHERE confirmed = 1 AND confirmed_at >= ?', [from]),
    totalSubscribers: await count('SELECT COUNT(*) AS n FROM calendar_subscribers WHERE confirmed = 1', []),
    applications: await count(`SELECT COUNT(*) AS n FROM applications WHERE ${between}`, [from]),
    messages: await count(`SELECT COUNT(*) AS n FROM contact_submissions WHERE ${between}`, [from]),
  };

  const games = ['aim', 'pattern', 'pixel'].map((id) => {
    const g = gameRows.find((r) => r.game === id) || {};
    const s = scoreRows.find((r) => r.game === id) || {};
    return {
      id,
      plays: Number(g.plays) || 0,
      finishes: Number(g.finishes) || 0,
      saved: Number(s.saved) || 0,
      players: Number(s.players) || 0,
      best: s.best ?? null,
    };
  });

  const num = (rows, keys) => rows.map((r) => ({ ...r, ...Object.fromEntries(keys.map((k) => [k, Number(r[k]) || 0])) }));

  return {
    days,
    totals: { current, previous },
    daily: num(daily, ['views', 'visitors']),
    members: num(members, ['members']),
    topPages: num(topPages, ['value']),
    events: num(eventRows, ['views', 'calendar_adds']),
    games,
    resources: num(resources, ['value']),
    subscribeApps: num(subscribeApps, ['value']),
    community,
  };
}
