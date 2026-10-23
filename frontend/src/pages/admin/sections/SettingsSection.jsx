/**
 * UX Collective — frontend/src/pages/admin/sections/SettingsSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useState } from 'react';
import { api, useApi } from '../../../lib/api.js';
import { EmptyRow, SchemaForm } from '../ui.jsx';

const SETTINGS_FIELDS = [
  { name: 'events_hosted', label: 'Events hosted (homepage stat)', type: 'number', required: true, help: 'The site shows whichever is higher: this or the number of past events.' },
  { name: 'students_helped', label: 'Students helped (homepage stat)', type: 'number', required: true },
  { name: 'members_fallback', label: 'Member count fallback', type: 'number', required: true, help: 'Used when Discord’s live count is unavailable.' },
  { name: 'founded_year', label: 'Founded year', type: 'number', required: true },
  { name: 'discord_invite', label: 'Discord invite link', type: 'url', required: true },
];

export default function SettingsSection() {
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
