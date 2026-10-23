import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, RotateCcw, Share2, ArrowLeft, Trophy } from 'lucide-react';
import { api } from '../../lib/api.js';

const NAME_KEY = 'uxco_player_name';

function readSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

// End-of-game screen shared by every game. Saves the score to the shared weekly leaderboard.
export default function GameResults({ result, onPlayAgain, onBack, onSaved }) {
  const [name, setName] = useState(readSavedName);
  const [saveState, setSaveState] = useState({ state: 'idle' });
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaveState({ state: 'saving' });
    try {
      const res = await api.post(`/api/games/${result.game}/scores`, {
        name: name.trim(),
        score: result.score,
        accuracy: result.accuracy,
        time_ms: result.time_ms,
        detail: result.detail,
      });
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {
        // private mode: name just isn't remembered
      }
      setSaveState({ state: 'saved', rank: res.rank, total: res.total });
      onSaved?.(res.id);
    } catch (error) {
      setSaveState({ state: 'error', message: error.message });
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
            <span>{result.rank.rank} Rank · {result.rank.title}</span>
          </div>

          <h2 id="results-title" className="results-score-title">{result.headline}</h2>
          <p className="results-congrats-text">{result.summary}</p>

          <div className="results-name-section-clean">
            {saveState.state === 'saved' ? (
              <div className="results-name-saved-clean">
                <CheckCircle2 size={18} color="#10B981" />
                <span>
                  Saved as <strong>{name.trim()}</strong> — <strong>#{saveState.rank}</strong> of {saveState.total} this week!
                </span>
              </div>
            ) : (
              <form onSubmit={save} className="results-name-form-clean">
                <label htmlFor="player-name" className="sr-only">Your name for the leaderboard</label>
                <input
                  id="player-name"
                  ref={inputRef}
                  type="text"
                  minLength={2}
                  maxLength={24}
                  required
                  placeholder="Your name for the leaderboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="player-name-input-clean"
                  autoComplete="nickname"
                />
                <button type="submit" className="btn-submit-score-clean" disabled={saveState.state === 'saving'}>
                  <Trophy size={16} /> {saveState.state === 'saving' ? 'Saving…' : 'Save score'}
                </button>
              </form>
            )}
            {saveState.state === 'error' && <p className="results-save-error" role="alert">{saveState.message}</p>}
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
              <Share2 size={16} /> <span>{copied ? 'Copied!' : 'Share score'}</span>
            </button>
            <button type="button" className="btn-results-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> <span>Game Corner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
