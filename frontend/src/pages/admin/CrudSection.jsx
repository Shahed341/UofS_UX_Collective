/**
 * UX Collective — frontend/src/pages/admin/CrudSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, useApi } from '../../lib/api.js';
import { Modal, SchemaForm, EmptyRow, confirmDelete } from './ui.jsx';

/**
 * Generic list + create/edit/delete screen for a simple admin resource.
 * config: { title, endpoint, fields, defaults, renderRow(row), toForm?(row), fromForm?(values), itemName }
 */
export default function CrudSection({ config }) {
  const { title, endpoint, fields, defaults, renderRow, itemName = 'item' } = config;
  const toForm = config.toForm || ((row) => row);
  const fromForm = config.fromForm || ((values) => values);
  const { data: rows = [], loading, error, reload } = useApi(endpoint, { initial: [] });
  const [editing, setEditing] = useState(null); // null | 'new' | row

  const save = async (values) => {
    const body = fromForm(values);
    if (editing === 'new') await api.post(endpoint, body);
    else await api.put(`${endpoint}/${editing.id}`, body);
    setEditing(null);
    reload();
  };

  const remove = async (row) => {
    if (!confirmDelete(`“${row.title || row.name}”`)) return;
    await api.del(`${endpoint}/${row.id}`);
    reload();
  };

  return (
    <section className="admin-section">
      <header className="admin-section-head">
        <h1>{title}</h1>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus size={16} /> Add {itemName}
        </button>
      </header>

      {loading ? (
        <EmptyRow>Loading…</EmptyRow>
      ) : error ? (
        <EmptyRow>{error.message}</EmptyRow>
      ) : rows.length === 0 ? (
        <EmptyRow>Nothing here yet.</EmptyRow>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => (
            <li key={row.id} className="admin-list-row">
              <div className="admin-list-main">{renderRow(row)}</div>
              <div className="admin-list-actions">
                <button type="button" className="admin-icon-btn" onClick={() => setEditing(row)} aria-label="Edit"><Pencil size={16} /></button>
                <button type="button" className="admin-icon-btn danger" onClick={() => remove(row)} aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal title={editing === 'new' ? `New ${itemName}` : `Edit ${itemName}`} onClose={() => setEditing(null)}>
          <SchemaForm fields={fields} initial={editing === 'new' ? defaults : toForm(editing)} onSubmit={save} />
        </Modal>
      )}
    </section>
  );
}
