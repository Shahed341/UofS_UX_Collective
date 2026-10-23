/**
 * UX Collective — backend/lib/events.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { pool } from '../db.js';
import { parseJson, saskatoonNow } from './util.js';

export function serializeEvent(row, photos = []) {
  const now = saskatoonNow();
  const endsAt = row.end_at || row.start_at;
  return {
    ...row,
    highlights: parseJson(row.highlights, []),
    featured: !!row.featured,
    is_past: endsAt < now,
    photo_count: photos.length || row.photo_count || 0,
    photos,
  };
}

async function photosFor(eventIds) {
  if (eventIds.length === 0) return {};
  const [rows] = await pool.query(
    'SELECT id, event_id, url, caption, sort_order FROM event_photos WHERE event_id IN (?) ORDER BY sort_order, id',
    [eventIds]
  );
  const grouped = {};
  for (const photo of rows) {
    (grouped[photo.event_id] ||= []).push(photo);
  }
  return grouped;
}

// Lists events with their photos. `when` is 'upcoming', 'past' or 'all'.
export async function listEvents({ when = 'all', includeDrafts = false } = {}) {
  const where = [];
  const params = [];
  if (!includeDrafts) where.push("status = 'published'");
  if (when === 'upcoming') {
    where.push('COALESCE(end_at, start_at) >= ?');
    params.push(saskatoonNow());
  } else if (when === 'past') {
    where.push('COALESCE(end_at, start_at) < ?');
    params.push(saskatoonNow());
  }
  const order = when === 'past' ? 'DESC' : 'ASC';
  const [rows] = await pool.query(
    `SELECT * FROM events ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY start_at ${order}`,
    params
  );
  const photos = await photosFor(rows.map((r) => r.id));
  return rows.map((row) => serializeEvent(row, photos[row.id] || []));
}

export async function getEvent(slugOrId, { includeDrafts = false } = {}) {
  const column = /^\d+$/.test(String(slugOrId)) ? 'id' : 'slug';
  const [rows] = await pool.query(
    `SELECT * FROM events WHERE ${column} = ? ${includeDrafts ? '' : "AND status = 'published'"} LIMIT 1`,
    [slugOrId]
  );
  if (!rows[0]) return null;
  const photos = await photosFor([rows[0].id]);
  return serializeEvent(rows[0], photos[rows[0].id] || []);
}
