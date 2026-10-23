import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Images, Star, Upload, Loader2 } from 'lucide-react';
import { api, useApi } from '../../lib/api.js';
import { formatDate, formatTimeRange } from '../../lib/dates.js';
import { Modal, SchemaForm, EmptyRow, StatusPill, confirmDelete, uploadImages } from './ui.jsx';

const EVENT_FIELDS = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'category', label: 'Category', required: true, help: 'e.g. Hands-on Workshop, Panel & Networking, Community Social' },
  { name: 'location', label: 'Location', required: true },
  { name: 'start_at', label: 'Starts', type: 'datetime', required: true, help: 'Saskatoon time' },
  { name: 'end_at', label: 'Ends', type: 'datetime' },
  { name: 'summary', label: 'One-line summary', full: true, help: 'Shown on cards and in calendar invites' },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'highlights', label: 'Highlights', type: 'lines', rows: 3, help: 'One per line, e.g. “1-on-1 portfolio critiques”' },
  { name: 'cover_image', label: 'Cover image', type: 'image' },
  { name: 'rsvp_url', label: 'RSVP link', type: 'url', help: 'Defaults to the Discord invite' },
  { name: 'partners', label: 'Partners / co-hosts' },
  { name: 'recap', label: 'Recap (after the event)', type: 'textarea' },
  { name: 'slides_url', label: 'Slides link', type: 'url' },
  { name: 'recording_url', label: 'Recording link', type: 'url' },
  { name: 'attendees', label: 'Attendees', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft (hidden)' }] },
  { name: 'featured', label: 'Featured', type: 'checkbox', checkLabel: 'Feature this event in the Events page spotlight' },
];

const NEW_EVENT = { status: 'published', category: 'Hands-on Workshop', highlights: '', featured: false };

const toForm = (e) => ({
  ...e,
  start_at: e.start_at?.slice(0, 16).replace(' ', 'T'),
  end_at: e.end_at?.slice(0, 16).replace(' ', 'T') || '',
  highlights: Array.isArray(e.highlights) ? e.highlights.join('\n') : e.highlights || '',
  attendees: e.attendees ?? '',
  recap: e.recap || '',
});

function PhotoManager({ eventId }) {
  const { data: event, reload } = useApi(`/api/admin/events/${eventId}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async (e) => {
    if (!e.target.files?.length) return;
    setBusy(true);
    setError('');
    try {
      const files = await uploadImages(e.target.files);
      await api.post(`/api/admin/events/${eventId}/photos`, { photos: files.map((f) => ({ url: f.url })) });
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const caption = async (photo, value) => {
    if (value === photo.caption) return;
    await api.put(`/api/admin/photos/${photo.id}`, { caption: value });
  };

  const remove = async (photo) => {
    if (!confirmDelete('this photo')) return;
    await api.del(`/api/admin/photos/${photo.id}`);
    reload();
  };

  return (
    <div className="admin-photos">
      <div className="admin-photos-head">
        <h3><Images size={17} /> Photo album ({event?.photos?.length || 0})</h3>
        <label className="admin-btn">
          {busy ? <Loader2 size={15} className="spin" /> : <Upload size={15} />} Upload photos
          <input type="file" accept="image/*" multiple hidden onChange={add} disabled={busy} />
        </label>
      </div>
      {error && <div className="ux-alert error">{error}</div>}
      <p className="admin-help">Select several photos at once (up to 20, 8 MB each). Captions save when you click away.</p>
      <div className="admin-photo-grid">
        {(event?.photos || []).map((p) => (
          <figure key={p.id} className="admin-photo">
            <img src={p.url} alt="" />
            <input className="ux-input" defaultValue={p.caption} placeholder="Caption" onBlur={(e) => caption(p, e.target.value)} />
            <button type="button" className="admin-icon-btn danger" onClick={() => remove(p)} aria-label="Delete photo"><Trash2 size={15} /></button>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function EventsSection() {
  const { data: events = [], loading, reload } = useApi('/api/admin/events', { initial: [] });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  const save = async (values) => {
    const body = values;
    if (editing === 'new') {
      const res = await api.post('/api/admin/events', body);
      // Stay open on the new event so photos can be added straight away
      setEditing({ ...body, id: res.id, slug: res.slug, photos: [] });
    } else {
      await api.put(`/api/admin/events/${editing.id}`, body);
      setEditing(null);
    }
    reload();
  };

  const remove = async (event) => {
    if (!confirmDelete(`“${event.title}” and its photos`)) return;
    await api.del(`/api/admin/events/${event.id}`);
    reload();
  };

  const visible = events.filter((e) => (filter === 'all' ? true : filter === 'past' ? e.is_past : !e.is_past));

  return (
    <section className="admin-section">
      <header className="admin-section-head">
        <h1>Events</h1>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}><Plus size={16} /> New event</button>
      </header>
      <p className="admin-section-note">
        Publishing, rescheduling or cancelling an event automatically updates everyone subscribed to the club calendar.
      </p>

      <div className="admin-tabs">
        {['upcoming', 'past', 'all'].map((f) => (
          <button key={f} type="button" className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading ? (
        <EmptyRow>Loading…</EmptyRow>
      ) : visible.length === 0 ? (
        <EmptyRow>No {filter} events.</EmptyRow>
      ) : (
        <ul className="admin-list">
          {visible.map((e) => (
            <li key={e.id} className="admin-list-row">
              {e.cover_image ? <img src={e.cover_image} alt="" className="admin-thumb" /> : <div className="admin-thumb empty" />}
              <div className="admin-list-main">
                <strong>{e.featured && <Star size={14} className="admin-star" />}{e.title}</strong>
                <span className="admin-meta">
                  {formatDate(e.start_at, { short: true })} · {formatTimeRange(e.start_at, e.end_at)} · {e.location}
                </span>
                <span className="admin-pills">
                  <StatusPill tone={e.status === 'published' ? 'good' : 'muted'}>{e.status}</StatusPill>
                  {e.is_past && <StatusPill tone="muted">past</StatusPill>}
                  {e.photo_count > 0 && <StatusPill>{e.photo_count} photos</StatusPill>}
                  {e.is_past && !e.recap && <StatusPill tone="warn">needs recap</StatusPill>}
                </span>
              </div>
              <div className="admin-list-actions">
                <a href={`/events/${e.slug}`} target="_blank" rel="noreferrer" className="admin-icon-btn" aria-label="View on site"><ExternalLink size={16} /></a>
                <button type="button" className="admin-icon-btn" onClick={() => setEditing(e)} aria-label="Edit"><Pencil size={16} /></button>
                <button type="button" className="admin-icon-btn danger" onClick={() => remove(e)} aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'New event' : `Edit: ${editing.title}`} onClose={() => { setEditing(null); reload(); }} wide>
          <SchemaForm
            key={editing === 'new' ? 'new' : editing.id}
            fields={EVENT_FIELDS}
            initial={editing === 'new' ? NEW_EVENT : toForm(editing)}
            onSubmit={save}
            submitLabel={editing === 'new' ? 'Create event' : 'Save changes'}
          />
          {editing !== 'new' && <PhotoManager eventId={editing.id} />}
        </Modal>
      )}
    </section>
  );
}
