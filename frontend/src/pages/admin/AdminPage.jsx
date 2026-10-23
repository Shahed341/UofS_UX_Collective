import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, BookOpen, Briefcase, Users, Inbox, BellRing, Gamepad2, Settings, LogOut, ExternalLink, Star
} from 'lucide-react';
import { api } from '../../lib/api.js';
import AdminLogin from './AdminLogin.jsx';
import CrudSection from './CrudSection.jsx';
import EventsSection from './EventsSection.jsx';
import { OverviewSection, InboxSection, SubscribersSection, ScoresSection, SettingsSection } from './MiscSections.jsx';
import { StatusPill } from './ui.jsx';
import './AdminPage.css';

const RESOURCES = {
  title: 'Resources',
  itemName: 'resource',
  endpoint: '/api/admin/resources',
  defaults: { category: 'guide', level: 'beginner', status: 'published', featured: false, sort_order: 0 },
  fields: [
    { name: 'title', label: 'Title', required: true, full: true },
    { name: 'url', label: 'Link', type: 'url', required: true, full: true },
    { name: 'description', label: 'Short description', type: 'textarea', rows: 2 },
    { name: 'category', label: 'Category', type: 'select', options: ['template', 'guide', 'course', 'tool', 'slides'] },
    { name: 'level', label: 'Level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { name: 'tags', label: 'Tags', help: 'Comma separated, e.g. figma, portfolio' },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'] },
    { name: 'featured', label: 'Exec pick', type: 'checkbox', checkLabel: 'Show in “Exec picks”' },
  ],
  renderRow: (r) => (
    <>
      <strong>{r.featured ? <Star size={14} className="admin-star" /> : null}{r.title}</strong>
      <span className="admin-meta">{r.category} · {r.level} · {r.url}</span>
      {r.status === 'draft' && <span className="admin-pills"><StatusPill tone="muted">draft</StatusPill></span>}
    </>
  ),
};

const ROLES = {
  title: 'Open roles',
  itemName: 'role',
  endpoint: '/api/admin/opportunities',
  defaults: { type: 'volunteer', is_open: true, sort_order: 0 },
  toForm: (r) => ({ ...r, deadline: r.deadline || '' }),
  fields: [
    { name: 'title', label: 'Role title', required: true, full: true },
    { name: 'type', label: 'Type', type: 'select', options: ['volunteer', 'mentor', 'committee', 'executive'] },
    { name: 'deadline', label: 'Application deadline', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'commitment', label: 'Time commitment', help: 'e.g. 2–4 hours per event' },
    { name: 'perks', label: 'What they get' },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'is_open', label: 'Open', type: 'checkbox', checkLabel: 'Accepting applications' },
  ],
  renderRow: (r) => (
    <>
      <strong>{r.title}</strong>
      <span className="admin-meta">{r.type}{r.deadline ? ` · closes ${r.deadline}` : ''}</span>
      <span className="admin-pills"><StatusPill tone={r.is_open ? 'good' : 'muted'}>{r.is_open ? 'open' : 'closed'}</StatusPill></span>
    </>
  ),
};

const TEAM = {
  title: 'Executive team',
  itemName: 'member',
  endpoint: '/api/admin/team',
  defaults: { active: true, is_lead: false, sort_order: 0 },
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'pronouns', label: 'Pronouns' },
    { name: 'role', label: 'Role', required: true },
    { name: 'major', label: 'Program & year' },
    { name: 'fact', label: 'Fun fact', full: true },
    { name: 'image_url', label: 'Photo', type: 'image' },
    { name: 'sort_order', label: 'Sort order', type: 'number', help: 'Lower numbers appear first' },
    { name: 'is_lead', label: 'Lead', type: 'checkbox', checkLabel: 'Club lead (carousel starts on this person)' },
    { name: 'active', label: 'Active', type: 'checkbox', checkLabel: 'Show on the About page' },
  ],
  renderRow: (m) => (
    <div className="admin-person">
      {m.image_url ? <img src={m.image_url} alt="" className="admin-avatar" /> : <span className="admin-avatar empty" />}
      <div>
        <strong>{m.name}</strong>
        <span className="admin-meta">{m.role}{m.active ? '' : ' · hidden'}</span>
      </div>
    </div>
  ),
};

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: (nav) => <OverviewSection onNavigate={nav} /> },
  { id: 'events', label: 'Events & photos', icon: CalendarDays, render: () => <EventsSection /> },
  { id: 'resources', label: 'Resources', icon: BookOpen, render: () => <CrudSection config={RESOURCES} /> },
  { id: 'roles', label: 'Open roles', icon: Briefcase, render: () => <CrudSection config={ROLES} /> },
  { id: 'team', label: 'Team', icon: Users, render: () => <CrudSection config={TEAM} /> },
  { id: 'inbox', label: 'Inbox', icon: Inbox, render: () => <InboxSection /> },
  { id: 'subscribers', label: 'Subscribers', icon: BellRing, render: () => <SubscribersSection /> },
  { id: 'scores', label: 'Game scores', icon: Gamepad2, render: () => <ScoresSection /> },
  { id: 'settings', label: 'Settings', icon: Settings, render: () => <SettingsSection /> },
];

export default function AdminPage() {
  const [admin, setAdmin] = useState(undefined); // undefined = checking, null = signed out
  const params = useParams();
  const navigate = useNavigate();
  const sectionId = params['*']?.split('/')[0] || 'overview';
  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];

  useEffect(() => {
    document.title = 'Admin · UX Collective';
    api.get('/api/auth/me').then((res) => setAdmin(res.admin)).catch(() => setAdmin(null));
  }, []);

  const go = useCallback((id) => navigate(`/admin/${id === 'overview' ? '' : id}`), [navigate]);

  const logout = async () => {
    await api.post('/api/auth/logout');
    setAdmin(null);
  };

  if (admin === undefined) return <div className="admin-loading">Checking session…</div>;
  if (!admin) return <AdminLogin onSignedIn={setAdmin} />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-badge">UX<br />CO</span>
          <span>Admin</span>
        </Link>
        <nav className="admin-nav" aria-label="Admin sections">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={section.id === id ? 'active' : ''} onClick={() => go(id)} aria-current={section.id === id ? 'page' : undefined}>
              <Icon size={18} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-account">
          {admin.picture ? <img src={admin.picture} alt="" className="admin-avatar" /> : <span className="admin-avatar empty" />}
          <div className="admin-account-text">
            <strong>{admin.name}</strong>
            <span>{admin.method === 'dev' ? 'Local dev session' : admin.email}</span>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="admin-icon-btn" aria-label="Open site"><ExternalLink size={16} /></a>
          <button type="button" className="admin-icon-btn" onClick={logout} aria-label="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="admin-main" key={section.id}>{section.render(go)}</main>
    </div>
  );
}
