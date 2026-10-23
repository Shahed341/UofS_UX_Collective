/**
 * UX Collective — frontend/src/pages/admin/AdminPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, BookOpen, Briefcase, Users, Inbox, BellRing, Gamepad2, Settings, LogOut, ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api.js';
import AdminLogin from './AdminLogin.jsx';
import OverviewSection from './sections/OverviewSection.jsx';
import EventsSection from './sections/EventsSection.jsx';
import ResourcesSection from './sections/ResourcesSection.jsx';
import RolesSection from './sections/RolesSection.jsx';
import TeamSection from './sections/TeamSection.jsx';
import InboxSection from './sections/InboxSection.jsx';
import SubscribersSection from './sections/SubscribersSection.jsx';
import ScoresSection from './sections/ScoresSection.jsx';
import SettingsSection from './sections/SettingsSection.jsx';
import './AdminPage.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: (nav) => <OverviewSection onNavigate={nav} /> },
  { id: 'events', label: 'Events & photos', icon: CalendarDays, render: () => <EventsSection /> },
  { id: 'resources', label: 'Resources', icon: BookOpen, render: () => <ResourcesSection /> },
  { id: 'roles', label: 'Open roles', icon: Briefcase, render: () => <RolesSection /> },
  { id: 'team', label: 'Team', icon: Users, render: () => <TeamSection /> },
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
