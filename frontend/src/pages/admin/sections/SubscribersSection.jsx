import React, { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { api, useApi } from '../../../lib/api.js';
import { EmptyRow, StatusPill, confirmDelete, formatStamp } from '../ui.jsx';

export default function SubscribersSection() {
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
