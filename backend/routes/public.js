import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { listEvents, getEvent } from '../lib/events.js';
import { GAMES, LEADERBOARD_ORDER, weekStartUtc } from '../lib/games.js';
import { asyncRoute, validate, saskatoonNow } from '../lib/util.js';

const router = Router();

// Form submissions: 5 per 10 minutes per IP is plenty for real people and stops floods.
const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions. Please try again in a few minutes.' },
});

const scoreLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Slow down! Too many scores submitted.' },
});

// Hidden "website" field: real users never fill it, bots usually do.
const isBot = (body) => typeof body?.website === 'string' && body.website.trim() !== '';

async function getSettings() {
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
  return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
}

// Discord member count, cached so visitors don't each hit Discord's API.
const DISCORD_TTL_MS = 10 * 60 * 1000;
let discordCache = { at: 0, data: null };

async function getDiscordStats(fallbackMembers) {
  if (discordCache.data && Date.now() - discordCache.at < DISCORD_TTL_MS) return discordCache.data;
  try {
    const response = await fetch('https://discord.com/api/v9/invites/Fx7BUvzdzT?with_counts=true', {
      signal: AbortSignal.timeout(4000),
    });
    const data = await response.json();
    if (data.approximate_member_count) {
      discordCache = {
        at: Date.now(),
        data: { memberCount: data.approximate_member_count, onlineCount: data.approximate_presence_count || 0, live: true },
      };
      return discordCache.data;
    }
  } catch {
    // fall through to fallback
  }
  return discordCache.data || { memberCount: Number(fallbackMembers) || 0, onlineCount: 0, live: false };
}

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.get('/site', asyncRoute(async (req, res) => {
  const settings = await getSettings();
  const discord = await getDiscordStats(settings.members_fallback);
  const [[pastCount]] = await pool.query(
    "SELECT COUNT(*) AS n FROM events WHERE status = 'published' AND COALESCE(end_at, start_at) < ?",
    [saskatoonNow()]
  );
  res.json({
    success: true,
    data: {
      stats: {
        members: discord.memberCount,
        online: discord.onlineCount,
        membersLive: discord.live,
        eventsHosted: Math.max(Number(settings.events_hosted) || 0, pastCount.n),
        studentsHelped: Number(settings.students_helped) || 0,
        foundedYear: Number(settings.founded_year) || 2022,
      },
      discordInvite: settings.discord_invite,
    },
  });
}));

router.get('/events', asyncRoute(async (req, res) => {
  const when = ['upcoming', 'past'].includes(req.query.when) ? req.query.when : 'all';
  const data = await listEvents({ when });
  res.json({ success: true, count: data.length, data });
}));

router.get('/events/:slug', asyncRoute(async (req, res) => {
  const event = await getEvent(req.params.slug);
  if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });
  res.json({ success: true, data: event });
}));

router.get('/gallery', asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.url, p.caption, e.title AS event_title, e.slug AS event_slug, e.start_at
     FROM event_photos p JOIN events e ON e.id = p.event_id
     WHERE e.status = 'published'
     ORDER BY e.start_at DESC, p.sort_order, p.id`
  );
  res.json({ success: true, count: rows.length, data: rows });
}));

router.get('/resources', asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM resources WHERE status = 'published' ORDER BY featured DESC, sort_order, id"
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, featured: !!r.featured, tags: r.tags ? r.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] })) });
}));

router.get('/opportunities', asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM opportunities WHERE is_open = 1 AND (deadline IS NULL OR deadline >= ?) ORDER BY sort_order, id',
    [saskatoonNow().slice(0, 10)]
  );
  res.json({ success: true, data: rows });
}));

router.get('/team', asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, pronouns, role, major, fact, image_url, is_lead FROM team_members WHERE active = 1 ORDER BY sort_order, id'
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, is_lead: !!r.is_lead })) });
}));

router.post('/contact', formLimiter, asyncRoute(async (req, res) => {
  if (isBot(req.body)) return res.json({ success: true });
  const { data, error } = validate(req.body, {
    name: { required: true, max: 100, label: 'Name' },
    email: { required: true, max: 100, email: true },
    subject: { max: 150, label: 'Subject' },
    message: { required: true, max: 5000, label: 'Message' },
  });
  if (error) return res.status(400).json({ success: false, error });

  await pool.query(
    'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [data.name, data.email, data.subject || 'General Inquiry', data.message]
  );
  res.json({ success: true, message: 'Thanks! The exec team will get back to you soon.' });
}));

router.post('/applications', formLimiter, asyncRoute(async (req, res) => {
  if (isBot(req.body)) return res.json({ success: true });
  const { data, error } = validate(req.body, {
    kind: { required: true, oneOf: ['role', 'mentorship'] },
    name: { required: true, max: 100, label: 'Name' },
    email: { required: true, max: 150, email: true },
    program: { max: 120, label: 'Program' },
    year_of_study: { max: 40, label: 'Year of study' },
    topic: { max: 120, label: 'Topic' },
    portfolio_url: { max: 500, url: true, label: 'Portfolio link' },
    availability: { max: 300, label: 'Availability' },
    message: { required: true, max: 3000, label: 'Message' },
  });
  if (error) return res.status(400).json({ success: false, error });

  let opportunityId = null;
  if (data.kind === 'role') {
    opportunityId = Number(req.body.opportunity_id) || null;
    const [rows] = opportunityId
      ? await pool.query('SELECT id FROM opportunities WHERE id = ? AND is_open = 1', [opportunityId])
      : [[]];
    if (!rows.length) return res.status(400).json({ success: false, error: 'Please choose an open role.' });
  }

  await pool.query(
    `INSERT INTO applications (kind, opportunity_id, name, email, program, year_of_study, topic, portfolio_url, availability, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.kind, opportunityId, data.name, data.email, data.program, data.year_of_study, data.topic,
      data.portfolio_url, data.availability, data.message]
  );
  res.json({ success: true, message: 'Application received! We will email you within a week.' });
}));

router.get('/games/:game/leaderboard', asyncRoute(async (req, res) => {
  const game = GAMES[req.params.game];
  if (!game) return res.status(404).json({ success: false, error: 'Unknown game.' });
  const weekly = req.query.period !== 'all';
  const [rows] = await pool.query(
    `SELECT id, name, score, accuracy, time_ms, created_at FROM game_scores
     WHERE game = ? ${weekly ? 'AND created_at >= ?' : ''}
     ORDER BY ${LEADERBOARD_ORDER} LIMIT 50`,
    weekly ? [req.params.game, weekStartUtc()] : [req.params.game]
  );
  res.json({ success: true, period: weekly ? 'week' : 'all', data: rows });
}));

router.post('/games/:game/scores', scoreLimiter, asyncRoute(async (req, res) => {
  const gameKey = req.params.game;
  const game = GAMES[gameKey];
  if (!game) return res.status(404).json({ success: false, error: 'Unknown game.' });

  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  const score = Math.round(Number(req.body?.score));
  const accuracy = req.body?.accuracy == null ? null : Math.round(Number(req.body.accuracy));
  const timeMs = req.body?.time_ms == null ? null : Math.round(Number(req.body.time_ms));

  if (name.length < 2) return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
  if (!Number.isFinite(score) || score < 0 || score > game.maxScore) {
    return res.status(400).json({ success: false, error: 'That score does not look right.' });
  }
  if (accuracy !== null && (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100)) {
    return res.status(400).json({ success: false, error: 'Invalid accuracy.' });
  }
  if (timeMs !== null && (!Number.isFinite(timeMs) || timeMs < 0 || timeMs > 30 * 60 * 1000)) {
    return res.status(400).json({ success: false, error: 'Invalid time.' });
  }

  const [result] = await pool.query(
    'INSERT INTO game_scores (game, name, score, accuracy, time_ms, detail) VALUES (?, ?, ?, ?, ?, ?)',
    [gameKey, name, score, accuracy, timeMs, JSON.stringify(req.body?.detail ?? null).slice(0, 2000)]
  );

  // Rank among this week's scores using the same ordering as the leaderboard
  const [weekRows] = await pool.query(
    `SELECT id FROM game_scores WHERE game = ? AND created_at >= ? ORDER BY ${LEADERBOARD_ORDER}`,
    [gameKey, weekStartUtc()]
  );
  const rank = weekRows.findIndex((r) => r.id === result.insertId) + 1;
  res.json({ success: true, id: result.insertId, rank, total: weekRows.length });
}));

export default router;
