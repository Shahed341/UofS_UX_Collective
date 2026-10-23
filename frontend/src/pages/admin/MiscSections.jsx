import React, { useState } from 'react';
import { CalendarDays, Images, BookOpen, Briefcase, Inbox, Mail, Gamepad2, BellRing, Trash2, Copy, Check, Database } from 'lucide-react';
import { api, useApi } from '../../lib/api.js';
import { formatDate } from '../../lib/dates.js';
import { EmptyRow, SchemaForm, StatusPill, confirmDelete, formatStamp } from './ui.jsx';

// ---------- Overview ----------

export function OverviewSection({ onNavigate }) {
  const { data, loading } = useApi('/api/admin/overview');
  if (loading || !data) return <EmptyRow>Loading…</EmptyRow>;
  const c = data.counts;
  const cards = [
    { label: 'Events', value: c.events, icon: CalendarDays, to: 'events' },
    { label: 'Photos', value: c.photos, icon: Images, to: 'events' },
    { label: 'Resources', value: c.resources, icon: BookOpen, to: 'resources' },
    { label: 'Open roles', value: c.open_roles, icon: Briefcase, to: 'roles' },
    { label: 'New applications', value: c.new_applications, icon: Inbox, to: 'inbox', alert: c.new_applications > 0 },
    { label: 'Unread messages', value: c.unread_messages, icon: Mail, to: 'inbox', alert: c.unread_messages > 0 },
    { label: 'Calendar subscribers', value: c.subscribers, icon: BellRing, to: 'subscribers' },
    { label: 'Game scores', value: c.game_scores, icon: Gamepad2, to: 'scores' },
  ];

  return (
    <section className="admin-section">
      <header className="admin-section-head"><h1>Overview</h1></header>
      <div className="admin-stat-grid">
        {cards.map(({ label, value, icon: Icon, to, alert }) => (
          <button key={label} type="button" className={`admin-stat ${alert ? 'alert' : ''}`} onClick={() => onNavigate(to)}>
            <Icon size={20} />
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-label">{label}</span>
          </button>
        ))}
      </div>

      <h2 className="admin-subhead">Coming up</h2>
      {data.upcoming.length === 0 ? (
        <EmptyRow>No upcoming events — add one so the calendar stays fresh.</EmptyRow>
      ) : (
        <ul className="admin-list">
          {data.upcoming.map((e) => (
            <li key={e.id} className="admin-list-row">
              <div className="admin-list-main">
                <strong>{e.title}</strong>
                <span className="admin-meta">{formatDate(e.start_at)} · {e.location}</span>
              </div>
              <StatusPill tone={e.status === 'published' ? 'good' : 'muted'}>{e.status}</StatusPill>
            </li>
          ))}
        </ul>
      )}

      <h2 className="admin-subhead"><Database size={16} /> System</h2>
      <p className="admin-meta">
        Database {data.system.connected ? `connected (${data.system.latencyMs}ms, MySQL ${data.system.version})` : `offline: ${data.system.error}`}
      </p>
    </section>
  );
}

// ---------- Inbox: applications + messages ----------

const APP_STATUSES = ['new', 'reviewing', 'accepted', 'declined'];
const STATUS_TONE = { new: 'warn', reviewing: 'neutral', accepted: 'good', declined: 'muted' };

export function InboxSection() {
  const [tab, setTab] = useState('applications');
  const apps = useApi('/api/admin/applications', { initial: [] });
  const msgs = useApi('/api/admin/messages', { initial: [] });
  const [open, setOpen] = useState(null);

  const setStatus = async (app, status) => {
    await api.put(`/api/admin/applications/${app.id}`, { status });
    apps.reload();
  };

  const toggleRead = async (msg) => {
    await api.put(`/api/admin/messages/${msg.id}`, { is_read: !msg.is_read });
    msgs.reload();
  };

  const remove = async (kind, row) => {
    if (!confirmDelete(`this ${kind === 'applications' ? 'application' : 'message'}`)) return;
    await api.del(`/api/admin/${kind}/${row.id}`);
    (kind === 'applications' ? apps : msgs).reload();
  };

  const expand = (key, row, markRead) => {
    setOpen(open === key ? null : key);
    if (markRead && !row.is_read) toggleRead(row);
  };

  return (
    <section className="admin-section">
      <header className="admin-section-head"><h1>Inbox</h1></header>
      <div className="admin-tabs">
        <button type="button" className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
          Applications & mentorship ({apps.data.filter((a) => a.status === 'new').length} new)
        </button>
        <button type="button" className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>
          Contact messages ({msgs.data.filter((m) => !m.is_read).length} unread)
        </button>
      </div>

      {tab === 'applications' && (
        apps.data.length === 0 ? <EmptyRow>No applications yet.</EmptyRow> : (
          <ul className="admin-list">
            {apps.data.map((a) => (
              <li key={a.id} className={`admin-list-row column ${open === `a${a.id}` ? 'open' : ''}`}>
                <button type="button" className="admin-row-toggle" onClick={() => expand(`a${a.id}`, a)}>
                  <div className="admin-list-main">
                    <strong>{a.name} <span className="admin-meta">· {a.kind === 'role' ? a.opportunity_title || 'Role (closed)' : `Mentorship: ${a.topic}`}</span></strong>
                    <span className="admin-meta">{a.email} · {formatStamp(a.created_at)}</span>
                  </div>
                  <StatusPill tone={STATUS_TONE[a.status]}>{a.status}</StatusPill>
                </button>
                {open === `a${a.id}` && (
                  <div className="admin-row-detail">
                    <dl>
                      {a.program && <><dt>Program</dt><dd>{a.program} {a.year_of_study && `(${a.year_of_study})`}</dd></>}
                      {a.portfolio_url && <><dt>Portfolio</dt><dd><a href={a.portfolio_url} target="_blank" rel="noreferrer">{a.portfolio_url}</a></dd></>}
                      {a.availability && <><dt>Availability</dt><dd>{a.availability}</dd></>}
                    </dl>
                    <p className="admin-message">{a.message}</p>
                    <div className="admin-row">
                      <select className="ux-select admin-inline-select" value={a.status} onChange={(e) => setStatus(a, e.target.value)} aria-label="Status">
                        {APP_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <a className="admin-btn" href={`mailto:${a.email}?subject=${encodeURIComponent('Your UX Collective application')}`}><Mail size={15} /> Reply</a>
                      <button type="button" className="admin-btn ghost danger" onClick={() => remove('applications', a)}><Trash2 size={15} /> Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'messages' && (
        msgs.data.length === 0 ? <EmptyRow>No messages yet.</EmptyRow> : (
          <ul className="admin-list">
            {msgs.data.map((m) => (
              <li key={m.id} className={`admin-list-row column ${m.is_read ? '' : 'unread'} ${open === `m${m.id}` ? 'open' : ''}`}>
                <button type="button" className="admin-row-toggle" onClick={() => expand(`m${m.id}`, m, true)}>
                  <div className="admin-list-main">
                    <strong>{m.subject}</strong>
                    <span className="admin-meta">{m.name} · {m.email} · {formatStamp(m.created_at)}</span>
                  </div>
                  {!m.is_read && <StatusPill tone="warn">unread</StatusPill>}
                </button>
                {open === `m${m.id}` && (
                  <div className="admin-row-detail">
                    <p className="admin-message">{m.message}</p>
                    <div className="admin-row">
                      <a className="admin-btn" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}><Mail size={15} /> Reply</a>
                      <button type="button" className="admin-btn ghost" onClick={() => toggleRead(m)}>Mark {m.is_read ? 'unread' : 'read'}</button>
                      <button type="button" className="admin-btn ghost danger" onClick={() => remove('messages', m)}><Trash2 size={15} /> Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}

// ---------- Calendar subscribers ----------

export function SubscribersSection() {
  const { data: rows = [], reload } = useApi('/api/admin/subscribers', { initial: [] });
  const [copied, setCopied] = useState(false);
  const feed = `${window.location.origin}/api/calendar.ics`;

  const copy = async () => {
    await navigator.clipboard.writeText(feed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remove = async (row) => {
    if (!confirmDelete(row.email)) return;
    await api.del(`/api/admin/subscribers/${row.id}`);
    reload();
  };

  return (
    <section className="admin-section">
      <header className="admin-section-head"><h1>Calendar subscribers</h1></header>
      <div className="admin-callout">
        <strong>Public calendar feed</strong>
        <span>Anyone can subscribe to this link in Google, Apple or Outlook Calendar. It updates automatically when you edit events.</span>
        <div className="admin-row">
          <code className="admin-code">{feed}</code>
          <button type="button" className="admin-btn" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}</button>
        </div>
        <span className="admin-help">
          Email subscribers below get calendar invites by email. Sending requires SMTP settings (see <code>.env.example</code>); until then invites are only logged.
        </span>
      </div>

      {rows.length === 0 ? <EmptyRow>No email subscribers yet.</EmptyRow> : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-list-row">
              <div className="admin-list-main">
                <strong>{r.email}</strong>
                <span className="admin-meta">Joined {formatStamp(r.created_at)}</span>
              </div>
              <StatusPill tone={r.confirmed ? 'good' : 'warn'}>{r.confirmed ? 'confirmed' : 'pending'}</StatusPill>
              <div className="admin-list-actions">
                <button type="button" className="admin-icon-btn danger" onClick={() => remove(r)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Game score moderation ----------

const GAME_NAMES = { aim: 'Aim Trainer', pattern: 'Pattern', pixel: 'Pixel Perfect' };

export function ScoresSection() {
  const { data: rows = [], reload } = useApi('/api/admin/scores', { initial: [] });

  const remove = async (row) => {
    if (!confirmDelete(`${row.name}'s score`)) return;
    await api.del(`/api/admin/scores/${row.id}`);
    reload();
  };

  return (
    <section className="admin-section">
      <header className="admin-section-head"><h1>Game scores</h1></header>
      <p className="admin-section-note">Remove inappropriate names or suspicious scores. The latest 300 are shown.</p>
      {rows.length === 0 ? <EmptyRow>No scores yet.</EmptyRow> : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-list-row">
              <div className="admin-list-main">
                <strong>{r.name}</strong>
                <span className="admin-meta">{GAME_NAMES[r.game] || r.game} · {r.score} pts · {formatStamp(r.created_at)}</span>
              </div>
              <div className="admin-list-actions">
                <button type="button" className="admin-icon-btn danger" onClick={() => remove(r)} aria-label="Delete score"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Settings ----------

const SETTINGS_FIELDS = [
  { name: 'events_hosted', label: 'Events hosted (homepage stat)', type: 'number', required: true, help: 'The site shows whichever is higher: this or the number of past events.' },
  { name: 'students_helped', label: 'Students helped (homepage stat)', type: 'number', required: true },
  { name: 'members_fallback', label: 'Member count fallback', type: 'number', required: true, help: 'Used when Discord’s live count is unavailable.' },
  { name: 'founded_year', label: 'Founded year', type: 'number', required: true },
  { name: 'discord_invite', label: 'Discord invite link', type: 'url', required: true },
];

export function SettingsSection() {
  const { data, loading } = useApi('/api/admin/settings');
  const [saved, setSaved] = useState(false);

  if (loading || !data) return <EmptyRow>Loading…</EmptyRow>;

  return (
    <section className="admin-section">
      <header className="admin-section-head"><h1>Site settings</h1></header>
      {saved && <div className="ux-alert success">Saved. Changes appear on the site after a refresh.</div>}
      <SchemaForm
        fields={SETTINGS_FIELDS}
        initial={data}
        onSubmit={async (values) => {
          await api.put('/api/admin/settings', values);
          setSaved(true);
        }}
      />
    </section>
  );
}
