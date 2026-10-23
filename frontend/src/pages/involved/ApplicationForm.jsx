import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';

const EMPTY = { name: '', email: '', program: '', year_of_study: '', topic: '', portfolio_url: '', availability: '', message: '', website: '' };

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year+', 'Grad student', 'Alumni'];
export const MENTORSHIP_TOPICS = ['Portfolio review', 'Resume & LinkedIn review', 'Career chat', 'Figma help', 'Research methods'];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((i) => (
        <span key={i} style={{ '--x': `${(i * 37) % 100}%`, '--d': `${(i % 6) * 0.08}s`, '--r': `${(i * 53) % 360}deg`, '--c': ['#E81D88', '#FA7538', '#FFE07A', '#C21356'][i % 4] }} />
      ))}
    </div>
  );
}

// Shared form for role applications (kind="role") and mentorship bookings (kind="mentorship").
export default function ApplicationForm({ kind, roles = [], selectedRoleId, onRoleChange }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const idPrefix = `app-${kind}`;

  useEffect(() => {
    setStatus({ state: 'idle', message: '' });
  }, [selectedRoleId]);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await api.post('/api/applications', { ...form, kind, opportunity_id: kind === 'role' ? selectedRoleId : undefined });
      setStatus({ state: 'success', message: res.message });
      setForm(EMPTY);
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  if (status.state === 'success') {
    return (
      <div className="application-success">
        <Confetti />
        <CheckCircle2 size={44} />
        <h3>{kind === 'role' ? 'Application sent!' : 'Request received!'}</h3>
        <p>{status.message}</p>
        <button type="button" className="btn-secondary" onClick={() => setStatus({ state: 'idle', message: '' })}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="ux-form" onSubmit={submit}>
      {status.state === 'error' && <div className="ux-alert error" role="alert">{status.message}</div>}

      {kind === 'role' && (
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-role`}>Role</label>
          <select
            id={`${idPrefix}-role`}
            className="ux-select"
            required
            value={selectedRoleId || ''}
            onChange={(e) => onRoleChange(Number(e.target.value) || null)}
          >
            <option value="">Choose a role…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
      )}

      {kind === 'mentorship' && (
        <div className="ux-field">
          <span className="ux-label" id={`${idPrefix}-topic-label`}>What would you like help with?</span>
          <div className="topic-chips" role="radiogroup" aria-labelledby={`${idPrefix}-topic-label`}>
            {MENTORSHIP_TOPICS.map((t) => (
              <label key={t} className={`topic-chip ${form.topic === t ? 'active' : ''}`}>
                <input type="radio" name="topic" value={t} checked={form.topic === t} onChange={update} required />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="ux-form-row">
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-name`}>Full name</label>
          <input id={`${idPrefix}-name`} name="name" className="ux-input" required maxLength={100} value={form.name} onChange={update} autoComplete="name" />
        </div>
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-email`}>Email</label>
          <input id={`${idPrefix}-email`} name="email" type="email" className="ux-input" required maxLength={150} placeholder="nsid@usask.ca" value={form.email} onChange={update} autoComplete="email" />
        </div>
      </div>

      <div className="ux-form-row">
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-program`}>Program <span className="optional">(optional)</span></label>
          <input id={`${idPrefix}-program`} name="program" className="ux-input" maxLength={120} placeholder="e.g. Interactive Systems Design" value={form.program} onChange={update} />
        </div>
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-year`}>Year <span className="optional">(optional)</span></label>
          <select id={`${idPrefix}-year`} name="year_of_study" className="ux-select" value={form.year_of_study} onChange={update}>
            <option value="">Select…</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="ux-field">
        <label className="ux-label" htmlFor={`${idPrefix}-portfolio`}>Portfolio / LinkedIn <span className="optional">(optional)</span></label>
        <input id={`${idPrefix}-portfolio`} name="portfolio_url" type="url" className="ux-input" maxLength={500} placeholder="https://" value={form.portfolio_url} onChange={update} />
      </div>

      {kind === 'mentorship' && (
        <div className="ux-field">
          <label className="ux-label" htmlFor={`${idPrefix}-availability`}>When are you free?</label>
          <input id={`${idPrefix}-availability`} name="availability" className="ux-input" required maxLength={300} placeholder="e.g. Tue/Thu afternoons, or after 5pm" value={form.availability} onChange={update} />
        </div>
      )}

      <div className="ux-field">
        <label className="ux-label" htmlFor={`${idPrefix}-message`}>
          {kind === 'role' ? 'Why are you interested?' : 'Tell us a bit more'}
        </label>
        <textarea id={`${idPrefix}-message`} name="message" className="ux-textarea" required maxLength={3000} value={form.message} onChange={update} />
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ux-honeypot" aria-hidden="true" value={form.website} onChange={update} />

      <button type="submit" className="btn-primary application-submit" disabled={status.state === 'loading'}>
        <Send size={16} />
        {status.state === 'loading' ? 'Sending…' : kind === 'role' ? 'Send application' : 'Request a session'}
      </button>
    </form>
  );
}
