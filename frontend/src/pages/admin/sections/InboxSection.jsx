/**
 * UX Collective — frontend/src/pages/admin/sections/InboxSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Send, Trash2, MailOpen, Mail, ExternalLink, Inbox as InboxIcon, Clock, Briefcase, GraduationCap, MessageSquare } from 'lucide-react';
import { api, useApi } from '../../../lib/api.js';
import { confirmDelete } from '../ui.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'message', label: 'Messages' },
  { id: 'application', label: 'Applications' },
];
const APP_STATUSES = ['new', 'reviewing', 'accepted', 'declined'];

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Stable avatar colour per person
const AVATAR_COLORS = ['#C21356', '#FA7538', '#D81E6B', '#8E0B3E', '#E2366F', '#B8124F'];
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];

// Timestamps from the API are UTC 'YYYY-MM-DD HH:MM:SS'
const toDate = (ts) => new Date(`${String(ts).replace(' ', 'T')}Z`);

function listTime(ts) {
  const d = toDate(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (now - d < 6 * 86400000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const bubbleTime = (ts) => toDate(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Avatar({ name, size = 44 }) {
  return (
    <span className="msg-avatar" style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.36 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

function Conversation({ convoKey, onChanged, onBack, onDeleted }) {
  const [kind, id] = convoKey.split(':');
  const { data, loading, reload } = useApi(`/api/admin/inbox/${kind}/${id}`);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (data) onChanged(); // opening a message marks it read
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.item?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [data?.replies?.length]);

  if (loading && !data) return <div className="msg-thread-empty">Loading…</div>;
  if (!data) return <div className="msg-thread-empty">Conversation not found.</div>;

  const { item, replies } = data;
  const isApp = kind === 'application';
  const title = isApp ? (item.kind === 'role' ? item.opportunity_title || 'Role application' : `Mentorship · ${item.topic}`) : item.subject;

  const send = async (e) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const res = await api.post(`/api/admin/inbox/${kind}/${id}/reply`, { body });
      setDraft('');
      setNotice(res.emailed ? '' : 'Saved to the thread. Email isn’t configured yet, so it wasn’t sent — use “Email” above to reply from your mail app.');
      reload();
      onChanged();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    await api.put(`/api/admin/applications/${id}`, { status });
    reload();
    onChanged();
  };

  const markUnread = async () => {
    await api.put(`/api/admin/messages/${id}`, { is_read: false });
    onChanged();
    onBack();
  };

  const remove = async () => {
    if (!confirmDelete('this conversation')) return;
    await api.del(`/api/admin/inbox/${kind}/${id}`);
    onDeleted();
  };

  return (
    <div className="msg-thread">
      <header className="msg-thread-head">
        <button type="button" className="admin-icon-btn msg-back" onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft size={18} />
        </button>
        <Avatar name={item.name} size={40} />
        <div className="msg-thread-who">
          <strong>{item.name}</strong>
          <span>{title}</span>
        </div>
        <div className="msg-thread-actions">
          {isApp && (
            <select className={`msg-status status-${item.status}`} value={item.status} onChange={(e) => setStatus(e.target.value)} aria-label="Application status">
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
          <a className="admin-icon-btn" href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${title}`)}`} title={`Email ${item.email}`} aria-label="Email">
            <ExternalLink size={16} />
          </a>
          {!isApp && (
            <button type="button" className="admin-icon-btn" onClick={markUnread} title="Mark as unread" aria-label="Mark as unread">
              <Mail size={16} />
            </button>
          )}
          <button type="button" className="admin-icon-btn danger" onClick={remove} title="Delete" aria-label="Delete conversation">
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="msg-thread-body">
        {/* Who they are, for context */}
        <div className="msg-contact-card">
          <span>{item.email}</span>
          {item.program && <span>{item.program}{item.year_of_study ? ` · ${item.year_of_study}` : ''}</span>}
          {item.availability && <span><Clock size={13} /> {item.availability}</span>}
          {item.portfolio_url && <a href={item.portfolio_url} target="_blank" rel="noreferrer">Portfolio ↗</a>}
        </div>

        <div className="msg-day">{toDate(item.created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>

        <div className="msg-row them">
          <Avatar name={item.name} size={30} />
          <div className="msg-bubble-wrap">
            <div className="msg-bubble">{item.message}</div>
            <span className="msg-time">{bubbleTime(item.created_at)}</span>
          </div>
        </div>

        {replies.map((r) => (
          <div key={r.id} className="msg-row me">
            <div className="msg-bubble-wrap">
              <div className="msg-bubble">{r.body}</div>
              <span className="msg-time">{bubbleTime(r.created_at)} · {r.emailed ? 'Emailed' : 'Not emailed'}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {notice && <p className="msg-notice">{notice}</p>}

      <form className="msg-composer" onSubmit={send}>
        <textarea
          rows={1}
          value={draft}
          placeholder={`Reply to ${item.name.split(' ')[0]}…`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) send(e); // Enter sends, Shift+Enter adds a line
          }}
          aria-label="Reply"
        />
        <button type="submit" className="msg-send" disabled={sending || !draft.trim()} aria-label="Send reply">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function InboxSection() {
  const { data: conversations = [], reload } = useApi('/api/admin/inbox', { initial: [] });
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState(null);

  // Check for new messages every 30 seconds
  useEffect(() => {
    const timer = setInterval(reload, 30000);
    return () => clearInterval(timer);
  }, [reload]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) =>
      (filter === 'all' || (filter === 'unread' ? c.unread : c.kind === filter)) &&
      (!q || `${c.name} ${c.email} ${c.title} ${c.preview}`.toLowerCase().includes(q))
    );
  }, [conversations, filter, query]);

  const unreadCount = conversations.filter((c) => c.unread).length;

  const kindIcon = (c) => (c.kind === 'message' ? <MessageSquare size={12} /> : c.title.startsWith('Mentorship') ? <GraduationCap size={12} /> : <Briefcase size={12} />);

  return (
    <section className="admin-section">
      <header className="admin-section-head">
        <h1>Inbox {unreadCount > 0 && <span className="msg-count">{unreadCount}</span>}</h1>
      </header>

      <div className={`messenger ${openKey ? 'is-open' : ''}`}>
        <aside className="msg-list-pane">
          <label className="msg-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search conversations" />
          </label>
          <div className="msg-filters" role="tablist">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          <ul className="msg-list">
            {visible.length === 0 && <li className="msg-list-empty">No conversations.</li>}
            {visible.map((c) => {
              const key = `${c.kind}:${c.id}`;
              return (
                <li key={key}>
                  <button type="button" className={`msg-item ${openKey === key ? 'active' : ''} ${c.unread ? 'unread' : ''}`} onClick={() => setOpenKey(key)}>
                    <Avatar name={c.name} />
                    <span className="msg-item-text">
                      <span className="msg-item-top">
                        <strong>{c.name}</strong>
                        <time>{listTime(c.last_activity)}</time>
                      </span>
                      <span className="msg-item-title">{kindIcon(c)} {c.title}</span>
                      <span className="msg-item-preview">{c.replied_at ? 'You replied · ' : ''}{c.preview}</span>
                    </span>
                    {c.unread && <span className="msg-unread-dot" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="msg-thread-pane">
          {openKey ? (
            <Conversation
              key={openKey}
              convoKey={openKey}
              onChanged={reload}
              onBack={() => setOpenKey(null)}
              onDeleted={() => {
                setOpenKey(null);
                reload();
              }}
            />
          ) : (
            <div className="msg-thread-empty">
              <InboxIcon size={40} />
              <strong>Select a conversation</strong>
              <span>Messages and applications appear here. Replies are emailed to the sender.</span>
              {unreadCount > 0 && <span className="msg-empty-unread"><MailOpen size={15} /> {unreadCount} unread</span>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
