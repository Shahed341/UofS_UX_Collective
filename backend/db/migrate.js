/**
 * UX Collective — backend/db/migrate.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { readFile } from 'node:fs/promises';
import { pool } from '../db.js';
import { DEMO_EVENTS, DEMO_RESOURCES, DEMO_OPPORTUNITIES, DEMO_TEAM, DEFAULT_SETTINGS } from './seed.js';

const schemaPath = new URL('./schema.sql', import.meta.url);

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column]
  );
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function isEmpty(table) {
  const [[row]] = await pool.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
  return row.n === 0;
}

async function seed() {
  if (await isEmpty('events')) {
    for (const ev of DEMO_EVENTS) {
      const [result] = await pool.query(
        `INSERT INTO events (slug, title, category, start_at, end_at, location, summary, description, highlights,
           cover_image, recap, slides_url, partners, attendees, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ev.slug, ev.title, ev.category, ev.start_at, ev.end_at, ev.location, ev.summary, ev.description,
          JSON.stringify(ev.highlights || []), ev.cover_image, ev.recap || null, ev.slides_url || '',
          ev.partners || '', ev.attendees || null, ev.featured || 0]
      );
      for (const [i, [photoId, caption]] of (ev.photos || []).entries()) {
        await pool.query(
          'INSERT INTO event_photos (event_id, url, caption, sort_order) VALUES (?, ?, ?, ?)',
          [result.insertId, `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1400&q=80`, caption, i]
        );
      }
    }
  }

  if (await isEmpty('resources')) {
    for (const [i, [title, description, category, level, url, tags, featured]] of DEMO_RESOURCES.entries()) {
      await pool.query(
        'INSERT INTO resources (title, description, category, level, url, tags, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, category, level, url, tags, featured, i]
      );
    }
  }

  if (await isEmpty('opportunities')) {
    for (const [i, [title, type, description, commitment, perks, deadline]] of DEMO_OPPORTUNITIES.entries()) {
      await pool.query(
        'INSERT INTO opportunities (title, type, description, commitment, perks, deadline, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, type, description, commitment, perks, deadline, i]
      );
    }
  }

  if (await isEmpty('team_members')) {
    for (const [i, [name, pronouns, role, major, fact, imageUrl, isLead]] of DEMO_TEAM.entries()) {
      await pool.query(
        'INSERT INTO team_members (name, pronouns, role, major, fact, image_url, is_lead, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, pronouns, role, major, fact, imageUrl, isLead, i]
      );
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await pool.query('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
  }
}

export async function migrate({ retries = 10 } = {}) {
  const sql = await readFile(schemaPath, 'utf8');
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);

  for (let attempt = 1; ; attempt++) {
    try {
      for (const statement of statements) {
        await pool.query(statement);
      }
      break;
    } catch (error) {
      if (attempt >= retries || !['ECONNREFUSED', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(error.code)) {
        throw error;
      }
      console.log(`Database not ready (${error.code}), retrying in 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await ensureColumn('contact_submissions', 'is_read', 'TINYINT(1) NOT NULL DEFAULT 0');
  // iCalendar SEQUENCE: bumped whenever an event's time/place changes so calendars apply the update
  await ensureColumn('events', 'sequence', 'INT NOT NULL DEFAULT 0');
  // Lets the player who saved a score rename it (scores are auto-saved with a fun name)
  await ensureColumn('game_scores', 'edit_token', 'VARCHAR(32) NULL');
  await seed();
}
