import React, { useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { api, useApi } from '../../../lib/api.js';
import { EmptyRow, StatusPill, confirmDelete, formatStamp } from '../ui.jsx';

const APP_STATUSES = ['new', 'reviewing', 'accepted', 'declined'];
const STATUS_TONE = { new: 'warn', reviewing: 'neutral', accepted: 'good', declined: 'muted' };

export default function InboxSection() {
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
