import React, { useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { useApi } from '../../lib/api.js';

const MEDALS = ['🥇', '🥈', '🥉'];

// Live leaderboard for one game, with weekly / all-time tabs.
export default function Leaderboard({ game, columns, highlightId, refreshKey = 0 }) {
  const [period, setPeriod] = useState('week');
  const { data: rows = [], loading, error, reload } = useApi(
    `/api/games/${game.id}/leaderboard?period=${period}&r=${refreshKey}`,
    { initial: [] }
  );

  return (
    <section className="game-leaderboard" aria-label={`${game.name} leaderboard`} data-obstacle>
      <header className="game-leaderboard-head">
        <h3><Trophy size={18} /> Leaderboard</h3>
        <div className="game-leaderboard-tabs" role="tablist">
          {[['week', 'This week'], ['all', 'All time']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={period === key} className={period === key ? 'active' : ''} onClick={() => setPeriod(key)}>
              {label}
            </button>
          ))}
          <button type="button" className="game-leaderboard-refresh" onClick={reload} aria-label="Refresh leaderboard">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      {error ? (
        <p className="game-leaderboard-empty">Leaderboard is offline right now.</p>
      ) : !loading && rows.length === 0 ? (
        <p className="game-leaderboard-empty">
          {period === 'week' ? 'No scores yet this week — be the first!' : 'No scores yet. Be the first!'}
        </p>
      ) : (
        <ol className="game-leaderboard-list">
          {rows.slice(0, 10).map((row, i) => (
            <li key={row.id} className={`lb-row ${i < 3 ? `top-${i + 1}` : ''} ${row.id === highlightId ? 'is-you' : ''}`} style={{ '--i': i }}>
              <span className="lb-rank">{MEDALS[i] || `#${i + 1}`}</span>
              <span className="lb-name">{row.name}{row.id === highlightId && <em> (you)</em>}</span>
              {columns.map((col) => (
                <span key={col.key} className={`lb-col ${col.primary ? 'primary' : ''}`}>{col.format(row)}</span>
              ))}
            </li>
          ))}
        </ol>
      )}
      {period === 'week' && <p className="game-leaderboard-note">Weekly board resets every Monday (Saskatoon time).</p>}
    </section>
  );
}
