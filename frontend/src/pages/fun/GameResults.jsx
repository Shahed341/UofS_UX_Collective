import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, RotateCcw, Share2, ArrowLeft, Pencil, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { funnyName } from './funnyNames.js';

const NAME_KEY = 'uxco_player_name';

function readSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

function rememberName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // private mode: name just isn't remembered
  }
}

// End-of-game screen shared by every game. The score is saved automatically
// (with the player's last name, or a random funny one) and can be renamed afterwards.
export default function GameResults({ result, onPlayAgain, onBack, onSaved }) {
  const [saved, setSaved] = useState(null); // { id, rank, total, edit_token, name }
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState({ busy: true, error: '' });
  const [copied, setCopied] = useState(false);
  const startedSave = useRef(false);

  // Auto-save once when the results appear
  useEffect(() => {
    if (startedSave.current) return;
    startedSave.current = true;
    const initialName = readSavedName() || funnyName();
    setName(initialName);
    api
      .post(`/api/games/${result.game}/scores`, {
        name: initialName,
        score: result.score,
        accuracy: result.accuracy,
        time_ms: result.time_ms,
        detail: result.detail,
      })
      .then((res) => {
        setSaved({ ...res, name: initialName });
        setState({ busy: false, error: '' });
        onSaved?.(res.id);
      })
      .catch((error) => setState({ busy: false, error: error.message }));
  }, [result, onSaved]);

  const rename = async (e) => {
    e.preventDefault();
    const next = name.trim();
    if (!saved || next === saved.name) {
      setEditing(false);
      return;
    }
    setState({ busy: true, error: '' });
    try {
      await api.put(`/api/games/scores/${saved.id}`, { name: next, edit_token: saved.edit_token });
      rememberName(next);
      setSaved((s) => ({ ...s, name: next }));
      setEditing(false);
      setState({ busy: false, error: '' });
      onSaved?.(saved.id);
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };

  const share = async () => {
    const text = `${result.shareText} ${window.location.origin}/fun`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // dismissed
    }
  };

  return (
    <div className="game-results-screen" role="dialog" aria-modal="true" aria-labelledby="results-title">
      <div className="results-modal-card">
        <div className="results-header-mesh" />
        <div className="results-body">
          <div className="results-rank-badge" style={{ borderColor: result.rank.color }}>
            <Award size={22} color={result.rank.color} />
            <span>{result.rank.rank} · {result.rank.title}</span>
          </div>

          <h2 id="results-title" className="results-score-title">{result.headline}</h2>
          <p className="results-congrats-text">{result.summary}</p>

          <div className="results-name-section-clean">
            {!saved && state.busy ? (
              <div className="results-name-saved-clean"><Loader2 size={18} className="spinning" /> Saving score…</div>
            ) : saved && !editing ? (
              <div className="results-name-saved-clean">
                <CheckCircle2 size={18} color="#10B981" />
                <span>
                  Saved as <strong>{saved.name}</strong> · <strong>#{saved.rank}</strong> all time
                </span>
                <button type="button" className="results-rename-btn" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Change name
                </button>
              </div>
            ) : saved ? (
              <form onSubmit={rename} className="results-name-form-clean">
                <label htmlFor="player-name" className="sr-only">Your name for the leaderboard</label>
                <input
                  id="player-name"
                  type="text"
                  minLength={2}
                  maxLength={24}
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="player-name-input-clean"
                  autoComplete="nickname"
                />
                <button type="submit" className="btn-submit-score-clean" disabled={state.busy}>
                  {state.busy ? 'Saving…' : 'Save name'}
                </button>
              </form>
            ) : null}
            {state.error && <p className="results-save-error" role="alert">{state.error}</p>}
          </div>

          {result.breakdown && (
            <div className="results-breakdown-flat">
              {result.breakdown.map((b) => (
                <div key={b.label} className={`breakdown-flat-item ${b.tone}`}>
                  <span className="flat-item-title">{b.label}</span>
                  <span className="flat-item-val">{b.value}</span>
                  <span className="flat-item-pts">{b.points}</span>
                </div>
              ))}
            </div>
          )}

          <div className="results-stats-row-flat">
            {result.stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="stat-flat-divider" />}
                <div className="stat-flat-item">
                  <span className="stat-flat-val">{s.value}</span>
                  <span className="stat-flat-label">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="results-actions-row">
            <button type="button" className="btn-results-primary" onClick={onPlayAgain}>
              <RotateCcw size={18} /> <span>Play again</span>
            </button>
            <button type="button" className="btn-results-share" onClick={share}>
              <Share2 size={16} /> <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button type="button" className="btn-results-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
