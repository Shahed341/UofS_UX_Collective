/**
 * UX Collective — frontend/src/pages/admin/sections/OverviewSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import { CalendarDays, Images, BookOpen, Briefcase, Inbox, Mail, Gamepad2, BellRing, Database } from 'lucide-react';
import { api, useApi } from '../../../lib/api.js';
import { formatDate } from '../../../lib/dates.js';
import { EmptyRow, StatusPill } from '../ui.jsx';

export default function OverviewSection({ onNavigate }) {
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
