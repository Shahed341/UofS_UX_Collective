/**
 * UX Collective — backend/routes/admin.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { Router } from 'express';
import { pool, testConnection } from '../db.js';
import { requireAdmin } from '../lib/auth.js';
import { listEvents, getEvent } from '../lib/events.js';
import { imageUpload, publicUrlFor, removeUpload } from '../lib/uploads.js';
import { notifyInBackground } from '../lib/subscriptions.js';
import { asyncRoute, slugify, validate } from '../lib/util.js';

const router = Router();
router.use(requireAdmin);

const toBool = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
const toIntOrNull = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Math.round(Number(v)));

// Accepts 'YYYY-MM-DDTHH:MM' (datetime-local input) or 'YYYY-MM-DD HH:MM[:SS]'.
function toDateTime(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?/);
  return match ? `${match[1]} ${match[2]}${match[3] || ':00'}` : undefined;
}

function badRequest(res, error) {
  return res.status(400).json({ success: false, error });
}

// Builds list/create/update/delete routes for a simple table.
// `prepare(body)` returns { data } (columns to write) or { error }.
function crud(path, table, prepare, { orderBy = 'sort_order, id' } = {}) {
  router.get(`/${path}`, asyncRoute(async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY ${orderBy}`);
    res.json({ success: true, data: rows });
  }));

  router.post(`/${path}`, asyncRoute(async (req, res) => {
    const { data, error } = await prepare(req.body || {});
    if (error) return badRequest(res, error);
    const [result] = await pool.query(`INSERT INTO \`${table}\` SET ?`, [data]);
    res.status(201).json({ success: true, id: result.insertId });
  }));

  router.put(`/${path}/:id`, asyncRoute(async (req, res) => {
    const { data, error } = await prepare(req.body || {}, Number(req.params.id));
    if (error) return badRequest(res, error);
    const [result] = await pool.query(`UPDATE \`${table}\` SET ? WHERE id = ?`, [data, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, error: 'Not found.' });
    res.json({ success: true });
  }));

  router.delete(`/${path}/:id`, asyncRoute(async (req, res) => {
    await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
}

// ---------- Overview ----------

router.get('/overview', asyncRoute(async (req, res) => {
  const [[counts]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM event_photos) AS photos,
      (SELECT COUNT(*) FROM resources) AS resources,
      (SELECT COUNT(*) FROM opportunities WHERE is_open = 1) AS open_roles,
      (SELECT COUNT(*) FROM applications WHERE status = 'new') AS new_applications,
      (SELECT COUNT(*) FROM contact_submissions WHERE is_read = 0) AS unread_messages,
      (SELECT COUNT(*) FROM game_scores) AS game_scores,
      (SELECT COUNT(*) FROM calendar_subscribers WHERE confirmed = 1) AS subscribers`);
  const upcoming = (await listEvents({ when: 'upcoming', includeDrafts: true })).slice(0, 3);
  res.json({ success: true, data: { counts, upcoming, system: await testConnection() } });
}));

// ---------- Uploads ----------

router.post('/uploads', imageUpload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((f) => ({ url: publicUrlFor(f), name: f.originalname, size: f.size }));
  if (!files.length) return badRequest(res, 'No images were uploaded.');
  res.status(201).json({ success: true, files });
});

// ---------- Events ----------

async function prepareEvent(body, id) {
  const { data, error } = validate(body, {
    title: { required: true, max: 160, label: 'Title' },
    category: { required: true, max: 60, label: 'Category' },
    location: { required: true, max: 160, label: 'Location' },
    summary: { max: 300, label: 'Summary' },
    description: { required: true, max: 10000, label: 'Description' },
    cover_image: { max: 500, url: true, label: 'Cover image' },
    recap: { max: 10000, label: 'Recap' },
    slides_url: { max: 500, url: true, label: 'Slides link' },
    recording_url: { max: 500, url: true, label: 'Recording link' },
    rsvp_url: { max: 500, url: true, label: 'RSVP link' },
    partners: { max: 300, label: 'Partners' },
    status: { oneOf: ['draft', 'published'] },
  });
  if (error) return { error };

  const startAt = toDateTime(body.start_at);
  const endAt = toDateTime(body.end_at);
  if (!startAt) return { error: 'Start date and time are required.' };
  if (endAt === undefined) return { error: 'End time is not a valid date.' };
  if (endAt && endAt < startAt) return { error: 'End time must be after the start time.' };

  const highlights = (Array.isArray(body.highlights) ? body.highlights : String(body.highlights || '').split('\n'))
    .map((h) => String(h).trim())
    .filter(Boolean)
    .slice(0, 8);

  // Unique slug from the title and year, e.g. "winter-design-jam-2026"
  const base = `${slugify(data.title)}-${startAt.slice(0, 4)}`;
  let slug = base;
  for (let n = 2; ; n++) {
    const [rows] = await pool.query('SELECT id FROM events WHERE slug = ? AND id <> ?', [slug, id || 0]);
    if (!rows.length) break;
    slug = `${base}-${n}`;
  }

  return {
    data: {
      ...data,
      slug,
      start_at: startAt,
      end_at: endAt,
      recap: data.recap || null,
      highlights: JSON.stringify(highlights),
      attendees: toIntOrNull(body.attendees),
      featured: toBool(body.featured),
      status: data.status || 'published',
    },
  };
}

router.get('/events', asyncRoute(async (req, res) => {
  res.json({ success: true, data: (await listEvents({ includeDrafts: true })).reverse() });
}));

router.get('/events/:id', asyncRoute(async (req, res) => {
  const event = await getEvent(req.params.id, { includeDrafts: true });
  if (!event) return res.status(404).json({ success: false, error: 'Not found.' });
  res.json({ success: true, data: event });
}));

router.post('/events', asyncRoute(async (req, res) => {
  const { data, error } = await prepareEvent(req.body || {});
  if (error) return badRequest(res, error);
  if (data.featured) await pool.query('UPDATE events SET featured = 0');
  const [result] = await pool.query('INSERT INTO events SET ?', [data]);
  notifyInBackground(await getEvent(result.insertId, { includeDrafts: true }), 'REQUEST');
  res.status(201).json({ success: true, id: result.insertId, slug: data.slug });
}));

router.put('/events/:id', asyncRoute(async (req, res) => {
  const { data, error } = await prepareEvent(req.body || {}, Number(req.params.id));
  if (error) return badRequest(res, error);
  const [[before]] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!before) return res.status(404).json({ success: false, error: 'Not found.' });

  // Calendar-relevant changes bump SEQUENCE and are pushed to email subscribers
  const calendarChanged = ['title', 'start_at', 'end_at', 'location', 'status']
    .some((k) => String(before[k] ?? '') !== String(data[k] ?? ''));
  if (calendarChanged) data.sequence = (before.sequence || 0) + 1;

  if (data.featured) await pool.query('UPDATE events SET featured = 0 WHERE id <> ?', [req.params.id]);
  await pool.query('UPDATE events SET ? WHERE id = ?', [data, req.params.id]);

  if (calendarChanged) {
    const after = await getEvent(req.params.id, { includeDrafts: true });
    if (after.status === 'published') notifyInBackground(after, 'REQUEST');
    else if (before.status === 'published') notifyInBackground(after, 'CANCEL');
  }
  res.json({ success: true, slug: data.slug });
}));

router.delete('/events/:id', asyncRoute(async (req, res) => {
  const existing = await getEvent(req.params.id, { includeDrafts: true });
  if (existing?.status === 'published') notifyInBackground({ ...existing, sequence: (existing.sequence || 0) + 1 }, 'CANCEL');
  const [photos] = await pool.query('SELECT url FROM event_photos WHERE event_id = ?', [req.params.id]);
  const [[event]] = await pool.query('SELECT cover_image FROM events WHERE id = ?', [req.params.id]);
  await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  await Promise.all([...photos.map((p) => removeUpload(p.url)), removeUpload(event?.cover_image)]);
  res.json({ success: true });
}));

// Event photo albums
router.post('/events/:id/photos', asyncRoute(async (req, res) => {
  const photos = Array.isArray(req.body?.photos) ? req.body.photos : [];
  const valid = photos.filter((p) => typeof p.url === 'string' && /^(https?:\/\/|\/uploads\/)/.test(p.url));
  if (!valid.length) return badRequest(res, 'No photos to add.');
  const [[{ next }]] = await pool.query(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM event_photos WHERE event_id = ?',
    [req.params.id]
  );
  const rows = valid.map((p, i) => [req.params.id, p.url, String(p.caption || '').slice(0, 200), next + i]);
  await pool.query('INSERT INTO event_photos (event_id, url, caption, sort_order) VALUES ?', [rows]);
  res.status(201).json({ success: true, added: rows.length });
}));

router.put('/photos/:id', asyncRoute(async (req, res) => {
  await pool.query('UPDATE event_photos SET caption = ? WHERE id = ?', [String(req.body?.caption || '').slice(0, 200), req.params.id]);
  res.json({ success: true });
}));

router.delete('/photos/:id', asyncRoute(async (req, res) => {
  const [[photo]] = await pool.query('SELECT url FROM event_photos WHERE id = ?', [req.params.id]);
  await pool.query('DELETE FROM event_photos WHERE id = ?', [req.params.id]);
  await removeUpload(photo?.url);
  res.json({ success: true });
}));

// ---------- Resources, opportunities, team ----------

crud('resources', 'resources', (body) => {
  const { data, error } = validate(body, {
    title: { required: true, max: 160, label: 'Title' },
    description: { max: 400, label: 'Description' },
    category: { required: true, oneOf: ['template', 'guide', 'course', 'tool', 'slides'] },
    level: { required: true, oneOf: ['beginner', 'intermediate', 'advanced'] },
    url: { required: true, max: 500, url: true, label: 'Link' },
    thumbnail: { max: 500, url: true, label: 'Thumbnail' },
    tags: { max: 200, label: 'Tags' },
    status: { oneOf: ['draft', 'published'] },
  });
  if (error) return { error };
  return { data: { ...data, status: data.status || 'published', featured: toBool(body.featured), sort_order: toIntOrNull(body.sort_order) ?? 0 } };
});

crud('opportunities', 'opportunities', (body) => {
  const { data, error } = validate(body, {
    title: { required: true, max: 160, label: 'Title' },
    type: { required: true, oneOf: ['volunteer', 'executive', 'mentor', 'committee'] },
    description: { required: true, max: 3000, label: 'Description' },
    commitment: { max: 120, label: 'Commitment' },
    perks: { max: 300, label: 'Perks' },
  });
  if (error) return { error };
  const deadline = body.deadline ? String(body.deadline).slice(0, 10) : null;
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { error: 'Deadline must be a date.' };
  return { data: { ...data, deadline, is_open: toBool(body.is_open ?? 1), sort_order: toIntOrNull(body.sort_order) ?? 0 } };
});

crud('team', 'team_members', (body) => {
  const { data, error } = validate(body, {
    name: { required: true, max: 100, label: 'Name' },
    pronouns: { max: 30, label: 'Pronouns' },
    role: { required: true, max: 100, label: 'Role' },
    major: { max: 120, label: 'Program' },
    fact: { max: 200, label: 'Fun fact' },
    image_url: { max: 500, url: true, label: 'Photo' },
  });
  if (error) return { error };
  return {
    data: { ...data, is_lead: toBool(body.is_lead), active: toBool(body.active ?? 1), sort_order: toIntOrNull(body.sort_order) ?? 0 },
  };
});

// ---------- Settings ----------

const EDITABLE_SETTINGS = ['events_hosted', 'students_helped', 'members_fallback', 'founded_year', 'discord_invite'];

router.get('/settings', asyncRoute(async (req, res) => {
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
  res.json({ success: true, data: Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])) });
}));

router.put('/settings', asyncRoute(async (req, res) => {
  const entries = Object.entries(req.body || {}).filter(([k]) => EDITABLE_SETTINGS.includes(k));
  for (const [key, value] of entries) {
    await pool.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, String(value).slice(0, 500)]
    );
  }
  res.json({ success: true });
}));

// ---------- Inbox ----------

router.get('/messages', asyncRoute(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 500');
  res.json({ success: true, data: rows });
}));

router.put('/messages/:id', asyncRoute(async (req, res) => {
  await pool.query('UPDATE contact_submissions SET is_read = ? WHERE id = ?', [toBool(req.body?.is_read), req.params.id]);
  res.json({ success: true });
}));

router.delete('/messages/:id', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

router.get('/applications', asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, o.title AS opportunity_title FROM applications a
     LEFT JOIN opportunities o ON o.id = a.opportunity_id
     ORDER BY a.created_at DESC LIMIT 500`
  );
  res.json({ success: true, data: rows });
}));

router.put('/applications/:id', asyncRoute(async (req, res) => {
  const status = req.body?.status;
  if (!['new', 'reviewing', 'accepted', 'declined'].includes(status)) return badRequest(res, 'Invalid status.');
  await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
}));

router.delete('/applications/:id', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// ---------- Calendar subscribers ----------

router.get('/subscribers', asyncRoute(async (req, res) => {
  const [rows] = await pool.query('SELECT id, email, confirmed, created_at, confirmed_at FROM calendar_subscribers ORDER BY created_at DESC');
  res.json({ success: true, data: rows });
}));

router.delete('/subscribers/:id', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM calendar_subscribers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// ---------- Game moderation ----------

router.get('/scores', asyncRoute(async (req, res) => {
  const [rows] = await pool.query('SELECT id, game, name, score, accuracy, time_ms, created_at FROM game_scores ORDER BY created_at DESC LIMIT 300');
  res.json({ success: true, data: rows });
}));

router.delete('/scores/:id', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM game_scores WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

export default router;
