import React from 'react';
import CrudSection from '../CrudSection.jsx';

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

export default function TeamSection() {
  return <CrudSection config={TEAM} />;
}
