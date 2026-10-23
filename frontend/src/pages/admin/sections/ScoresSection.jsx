/**
 * UX Collective — frontend/src/pages/admin/sections/ScoresSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import { Trash2 } from 'lucide-react';
import { api, useApi } from '../../../lib/api.js';
import { EmptyRow, confirmDelete, formatStamp } from '../ui.jsx';

const GAME_NAMES = { aim: 'Aim Trainer', pattern: 'Pattern', pixel: 'Pixel Perfect' };

export default function ScoresSection() {
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
