import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';

// ---------- Modal ----------

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="admin-modal-overlay" onMouseDown={onClose}>
      <div className={`admin-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <header className="admin-modal-head">
          <h2>{title}</h2>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ---------- Uploads ----------

export async function uploadImages(fileList) {
  const form = new FormData();
  [...fileList].forEach((f) => form.append('files', f));
  const res = await api.post('/api/admin/uploads', form);
  return res.files;
}

export function ImageField({ id, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const pick = async (e) => {
    if (!e.target.files?.length) return;
    setBusy(true);
    setError('');
    try {
      const [file] = await uploadImages([e.target.files[0]]);
      onChange(file.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-image-field">
      {value ? <img src={value} alt="" className="admin-image-preview" /> : <div className="admin-image-preview empty">No image</div>}
      <div className="admin-image-controls">
        <input id={id} className="ux-input" value={value || ''} placeholder="Paste an image URL or upload" onChange={(e) => onChange(e.target.value)} />
        <div className="admin-row">
          <button type="button" className="admin-btn" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={15} className="spin" /> : <Upload size={15} />} Upload
          </button>
          {value && <button type="button" className="admin-btn ghost" onClick={() => onChange('')}>Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
        {error && <span className="admin-field-error">{error}</span>}
      </div>
    </div>
  );
}

// ---------- Schema-driven form ----------
// field: { name, label, type: text|textarea|select|checkbox|date|datetime|number|url|email|image|lines, options, required, help, full }

export function SchemaForm({ fields, initial, onSubmit, submitLabel = 'Save', children }) {
  const [values, setValues] = useState(initial);
  const [state, setState] = useState({ saving: false, error: '' });

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '' });
    try {
      await onSubmit(values);
      setState({ saving: false, error: '' });
    } catch (err) {
      setState({ saving: false, error: err.message });
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {state.error && <div className="ux-alert error" role="alert">{state.error}</div>}
      <div className="admin-form-grid">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const value = values[f.name] ?? '';
          let control;
          if (f.type === 'textarea' || f.type === 'lines') {
            control = <textarea id={id} className="ux-textarea" rows={f.rows || 4} required={f.required} value={value} onChange={(e) => set(f.name, e.target.value)} />;
          } else if (f.type === 'select') {
            control = (
              <select id={id} className="ux-select" required={f.required} value={value} onChange={(e) => set(f.name, e.target.value)}>
                {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
              </select>
            );
          } else if (f.type === 'checkbox') {
            control = (
              <label className="admin-check">
                <input id={id} type="checkbox" checked={!!value} onChange={(e) => set(f.name, e.target.checked)} />
                <span>{f.checkLabel || f.label}</span>
              </label>
            );
          } else if (f.type === 'image') {
            control = <ImageField id={id} value={value} onChange={(v) => set(f.name, v)} />;
          } else {
            const type = { datetime: 'datetime-local' }[f.type] || f.type || 'text';
            control = <input id={id} className="ux-input" type={type} required={f.required} value={value} onChange={(e) => set(f.name, e.target.value)} />;
          }
          return (
            <div key={f.name} className={`ux-field ${f.full || ['textarea', 'lines', 'image'].includes(f.type) ? 'full' : ''}`}>
              {f.type !== 'checkbox' && (
                <label className="ux-label" htmlFor={id}>
                  {f.label} {!f.required && f.type !== 'checkbox' && <span className="optional">(optional)</span>}
                </label>
              )}
              {control}
              {f.help && <span className="admin-help">{f.help}</span>}
            </div>
          );
        })}
      </div>
      {children}
      <div className="admin-form-actions">
        <button type="submit" className="btn-primary" disabled={state.saving}>
          {state.saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ---------- Small helpers ----------

export function StatusPill({ tone = 'neutral', children }) {
  return <span className={`admin-pill tone-${tone}`}>{children}</span>;
}

export function EmptyRow({ children }) {
  return <div className="admin-empty">{children}</div>;
}

export const confirmDelete = (what) => window.confirm(`Delete ${what}? This can’t be undone.`);

export const formatStamp = (value) => (value ? String(value).slice(0, 16).replace('T', ' ') : '');
