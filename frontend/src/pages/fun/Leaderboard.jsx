import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { useApi } from '../../lib/api.js';

const MEDALS = ['🥇', '🥈', '🥉'];

// All-time leaderboard for one game: each player's best score.
export default function Leaderboard({ game, columns, highlightId, refreshKey = 0 }) {
  const { data: rows = [], loading, error, reload } = useApi(`/api/games/${game.id}/leaderboard?r=${refreshKey}`, { initial: [] });

  return (
    <section className="game-leaderboard" aria-label={`${game.name} leaderboard`} data-obstacle>
      <header className="game-leaderboard-head">
        <h3><Trophy size={18} /> All-time best</h3>
        <button type="button" className="game-leaderboard-refresh" onClick={reload} aria-label="Refresh leaderboard">
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
        </button>
      </header>

      {error ? (
        <p className="game-leaderboard-empty">Leaderboard is offline right now.</p>
      ) : !loading && rows.length === 0 ? (
        <p className="game-leaderboard-empty">No scores yet. Be the first!</p>
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
    </section>
  );
}
