/**
 * UX Collective — frontend/src/pages/admin/sections/RolesSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import CrudSection from '../CrudSection.jsx';
import { StatusPill } from '../ui.jsx';

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

export default function RolesSection() {
  return <CrudSection config={ROLES} />;
}
