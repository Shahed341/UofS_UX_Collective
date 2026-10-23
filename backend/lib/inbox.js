/**
 * UX Collective — backend/lib/inbox.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { pool } from '../db.js';
import { mailConfigured, sendMail } from './mailer.js';

// The admin inbox treats contact messages and applications as conversation threads:
// the original submission is the first message, admin replies follow (and are emailed).

const KINDS = {
  message: { table: 'contact_submissions' },
  application: { table: 'applications' },
};

export const isInboxKind = (kind) => Object.hasOwn(KINDS, kind);

// One list of conversations, newest activity first.
export async function listConversations() {
  const [messages] = await pool.query(
    `SELECT 'message' AS kind, m.id, m.name, m.email, m.subject AS title, m.message AS preview,
            m.created_at, m.is_read, NULL AS status,
            (SELECT MAX(r.created_at) FROM inbox_replies r WHERE r.kind = 'message' AND r.item_id = m.id) AS replied_at
     FROM contact_submissions m`
  );
  const [applications] = await pool.query(
    `SELECT 'application' AS kind, a.id, a.name, a.email,
            IF(a.kind = 'role', COALESCE(o.title, 'Role application'), CONCAT('Mentorship: ', a.topic)) AS title,
            a.message AS preview, a.created_at, a.status = 'new' AS is_unread_app, a.status,
            (SELECT MAX(r.created_at) FROM inbox_replies r WHERE r.kind = 'application' AND r.item_id = a.id) AS replied_at
     FROM applications a LEFT JOIN opportunities o ON o.id = a.opportunity_id`
  );

  return [
    ...messages.map(({ is_read, ...m }) => ({ ...m, unread: !is_read })),
    ...applications.map(({ is_unread_app, ...a }) => ({ ...a, unread: !!is_unread_app })),
  ]
    .map((c) => ({ ...c, last_activity: c.replied_at && c.replied_at > c.created_at ? c.replied_at : c.created_at, preview: String(c.preview).slice(0, 140) }))
    .sort((a, b) => (a.last_activity < b.last_activity ? 1 : -1));
}

export async function getConversation(kind, id) {
  let item;
  if (kind === 'message') {
    [[item]] = await pool.query('SELECT * FROM contact_submissions WHERE id = ?', [id]);
    if (item && !item.is_read) await pool.query('UPDATE contact_submissions SET is_read = 1 WHERE id = ?', [id]);
  } else {
    [[item]] = await pool.query(
      `SELECT a.*, o.title AS opportunity_title FROM applications a
       LEFT JOIN opportunities o ON o.id = a.opportunity_id WHERE a.id = ?`,
      [id]
    );
  }
  if (!item) return null;
  const [replies] = await pool.query(
    'SELECT id, body, emailed, created_at FROM inbox_replies WHERE kind = ? AND item_id = ? ORDER BY created_at, id',
    [kind, id]
  );
  return { kind, item, replies };
}

// Stores the reply and emails it to the person. Returns whether the email went out.
export async function reply(kind, id, body, adminName) {
  const convo = await getConversation(kind, id);
  if (!convo) return null;
  const { item } = convo;
  const subject = kind === 'message'
    ? `Re: ${item.subject}`
    : `Re: your ${item.kind === 'role' ? item.opportunity_title || 'application' : 'mentorship request'}`;

  let emailed = false;
  if (mailConfigured) {
    try {
      await sendMail({
        to: item.email,
        subject: `${subject} · UX Collective`,
        text: `${body}\n\n— ${adminName}, UX Collective`,
        html: `<p>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p><p style="color:#666">— ${adminName}, UX Collective</p>`,
      });
      emailed = true;
    } catch (error) {
      console.error('Inbox reply email failed:', error.message);
    }
  }

  await pool.query('INSERT INTO inbox_replies (kind, item_id, body, emailed) VALUES (?, ?, ?, ?)', [kind, id, body, emailed]);
  // Replying to a new application moves it into review
  if (kind === 'application' && item.status === 'new') {
    await pool.query("UPDATE applications SET status = 'reviewing' WHERE id = ?", [id]);
  }
  return { emailed, mailConfigured };
}

export async function deleteConversation(kind, id) {
  await pool.query(`DELETE FROM \`${KINDS[kind].table}\` WHERE id = ?`, [id]);
  await pool.query('DELETE FROM inbox_replies WHERE kind = ? AND item_id = ?', [kind, id]);
}
