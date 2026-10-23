/**
 * UX Collective — frontend/src/pages/fun/games/PatternGame.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Countdown from './Countdown.jsx';
import HudShell from './HudShell.jsx';
import { sfx } from '../sfx.js';

// Level i uses an n×n grid (3×3 … 9×9) with n numbers to remember.
export const PATTERN_SIZES = [3, 4, 5, 6, 7, 8, 9];
const LIVES = 3;
const TAP_POINTS = 10;
const LEVEL_BONUS = 20;

// Numbers stay visible a little longer as the pattern grows.
const showTimeMs = (count) => 900 + count * 150;

function makePattern(n) {
  const cells = Array.from({ length: n * n }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, n); // pattern[k] = cell that holds number k + 1
}

// Memorise where the numbers flash, then tap the cells back in order.
export default function PatternGame({ onFinish, onQuit, onRestart }) {
  const [phase, setPhase] = useState('countdown'); // countdown | show | input | wrong | clear
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [pattern, setPattern] = useState([]);
  const [progress, setProgress] = useState(0);
  const [wrongCell, setWrongCell] = useState(null);
  const [round, setRound] = useState(0);
  const run = useRef({ score: 0, taps: 0, mistakes: 0, startedAt: 0 });
  const alive = useRef(true);
  const timer = useRef(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const later = (fn, ms) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => alive.current && fn(), ms);
  };

  const size = PATTERN_SIZES[level];

  // Flash the numbers, then hide them and wait for taps
  const startRound = useCallback((lvl) => {
    const n = PATTERN_SIZES[lvl];
    setPattern(makePattern(n));
    setProgress(0);
    setWrongCell(null);
    setRound((r) => r + 1);
    setPhase('show');
    later(() => setPhase('input'), showTimeMs(n));
  }, []);

  const finish = useCallback((cleared) => {
    const r = run.current;
    const timeMs = Math.round(performance.now() - r.startedAt);
    const reached = PATTERN_SIZES[Math.min(cleared, PATTERN_SIZES.length - 1)];
    const accuracy = r.taps ? Math.round(((r.taps - r.mistakes) / r.taps) * 100) : 0;
    sfx.victory();
    const rank =
      cleared === PATTERN_SIZES.length && r.mistakes === 0 ? { rank: 'S+', title: 'Photographic Memory', color: '#FA7538' }
      : cleared === PATTERN_SIZES.length ? { rank: 'A', title: 'Pattern Master', color: '#C21356' }
      : cleared >= 4 ? { rank: 'B', title: 'Sharp Recall', color: '#D81E6B' }
      : { rank: 'C', title: 'Warming Up', color: '#E81D88' };

    onFinish({
      game: 'pattern',
      score: r.score,
      accuracy,
      time_ms: timeMs,
      detail: { cleared, mistakes: r.mistakes },
      rank,
      headline: `${r.score} points`,
      summary: cleared === PATTERN_SIZES.length ? 'All 7 grids cleared.' : `Reached the ${reached}×${reached} grid.`,
      stats: [
        { label: 'Grids cleared', value: `${cleared}/${PATTERN_SIZES.length}` },
        { label: 'Accuracy', value: `${accuracy}%` },
        { label: 'Time', value: `${(timeMs / 1000).toFixed(1)} s` },
      ],
      shareText: `🧠 I scored ${r.score} in UXCO Pattern (${cleared}/7 grids). Can you remember more?`,
    });
  }, [onFinish]);

  const start = () => {
    run.current = { score: 0, taps: 0, mistakes: 0, startedAt: performance.now() };
    startRound(0);
  };

  const tap = (cell) => {
    if (phase !== 'input') return;
    const r = run.current;
    r.taps++;

    if (cell === pattern[progress]) {
      r.score += TAP_POINTS;
      sfx.correct(progress);
      const next = progress + 1;
      setProgress(next);
      if (next === pattern.length) {
        r.score += LEVEL_BONUS;
        setPhase('clear');
        const nextLevel = level + 1;
        if (nextLevel === PATTERN_SIZES.length) {
          later(() => finish(nextLevel), 700);
        } else {
          later(() => {
            setLevel(nextLevel);
            startRound(nextLevel);
          }, 800);
        }
      }
      return;
    }

    // Wrong cell: show the full pattern, lose a life, then retry this grid with a new pattern
    r.mistakes++;
    sfx.miss();
    setWrongCell(cell);
    setPhase('wrong');
    const left = lives - 1;
    setLives(left);
    later(() => (left <= 0 ? finish(level) : startRound(level)), 1400);
  };

  if (phase === 'countdown') {
    return <Countdown subtitle="Remember the order" tip="Numbers flash, then disappear. Tap them in order." onDone={start} />;
  }

  const numberAt = new Map(pattern.map((cell, i) => [cell, i + 1]));
  const status = {
    show: 'Memorise',
    input: 'Your turn',
    wrong: 'Oops',
    clear: 'Nice!',
  }[phase];

  return (
    <div className="game-arena-screen pattern-arena">
      <HudShell
        onQuit={onQuit}
        onRestart={onRestart}
        metrics={[
          { label: 'Score', value: run.current.score, color: '#34D399' },
          { label: 'Grid', value: `${size}×${size}` },
          { label: 'Lives', value: '♥'.repeat(lives) + '♡'.repeat(LIVES - lives), color: '#F87171' },
        ]}
      />

      <p key={`${round}-${phase}`} className={`pattern-status ${phase}`}>{status}</p>

      <div
        key={round}
        className={`pattern-grid ${phase === 'wrong' ? 'shake' : ''}`}
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`, '--n': size }}
      >
        {Array.from({ length: size * size }, (_, cell) => {
          const num = numberAt.get(cell);
          const order = num ? num - 1 : -1;
          const done = order >= 0 && order < progress;
          const visible = num && (phase === 'show' || phase === 'wrong' || done);
          const cls = [
            'pattern-cell',
            visible && 'has-number',
            done && 'is-done',
            phase === 'wrong' && num && !done && 'is-missed',
            wrongCell === cell && 'is-wrong',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={cell}
              type="button"
              className={cls}
              style={{ '--d': `${order >= 0 ? order * 60 : 0}ms` }}
              onPointerDown={() => tap(cell)}
              aria-label={visible ? `Number ${num}` : `Cell ${cell + 1}`}
            >
              {visible ? num : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
