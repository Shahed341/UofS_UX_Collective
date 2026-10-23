import React, { useEffect, useMemo, useRef, useState } from 'react';
import Countdown from './Countdown.jsx';
import HudShell from './HudShell.jsx';
import { sfx } from '../sfx.js';

const GAME_MS = 45000;
const WRONG_PENALTY_MS = 3000;

// Grid grows and the shade difference shrinks as you level up.
const gridSize = (level) => Math.min(8, 2 + Math.floor(level / 2));
const shadeDelta = (level) => Math.max(2.5, 22 - level * 1.35);

function makeRound(level) {
  const n = gridSize(level);
  const hue = Math.floor(Math.random() * 360);
  const sat = 55 + Math.random() * 25;
  const light = 42 + Math.random() * 18;
  const delta = shadeDelta(level) * (Math.random() > 0.5 ? 1 : -1);
  return {
    n,
    odd: Math.floor(Math.random() * n * n),
    base: `hsl(${hue} ${sat}% ${light}%)`,
    oddColor: `hsl(${hue} ${sat}% ${light + delta}%)`,
    key: `${level}-${hue}-${Math.random()}`,
  };
}

// Find the tile that's a slightly different shade. 45 seconds, wrong taps cost 3 seconds.
export default function ColorEye({ onFinish, onQuit }) {
  const [phase, setPhase] = useState('countdown');
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(() => makeRound(0));
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [shake, setShake] = useState(0);
  const [flash, setFlash] = useState(null);
  const stats = useRef({ wrong: 0, picks: [], roundStart: 0 });

  const start = () => {
    stats.current = { wrong: 0, picks: [], roundStart: performance.now() };
    setEndsAt(Date.now() + GAME_MS);
    setPhase('playing');
  };

  const remaining = Math.max(0, endsAt - now);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || remaining > 0) return;
    setPhase('done');
    sfx.victory();
    const { wrong, picks } = stats.current;
    const avg = picks.length ? Math.round(picks.reduce((a, b) => a + b, 0) / picks.length) : 0;
    const accuracy = level + wrong ? Math.round((level / (level + wrong)) * 100) : 0;
    const rank =
      level >= 28 ? { rank: 'S+', title: 'Pantone-level eyesight', color: '#FA7538' }
      : level >= 20 ? { rank: 'A', title: 'Colour System Specialist', color: '#C21356' }
      : level >= 12 ? { rank: 'B', title: 'Sharp-eyed Designer', color: '#D81E6B' }
      : { rank: 'C', title: 'Palette Apprentice', color: '#E81D88' };

    onFinish({
      game: 'color',
      score: level,
      accuracy,
      time_ms: avg,
      detail: { wrong, finalGrid: gridSize(level), finalDelta: shadeDelta(level) },
      rank,
      headline: `Level ${level}`,
      summary: `You spotted ${level} odd tiles, down to a ${shadeDelta(level).toFixed(1)}% lightness difference on a ${gridSize(level)}×${gridSize(level)} grid.`,
      stats: [
        { label: 'Accuracy', value: `${accuracy}%` },
        { label: 'Avg find time', value: `${(avg / 1000).toFixed(2)} s` },
        { label: 'Wrong taps', value: wrong },
        { label: 'Final grid', value: `${gridSize(level)}×${gridSize(level)}` },
      ],
      shareText: `🎨 I reached level ${level} in UXCO Colour Eye (${accuracy}% accuracy). How good is your eye?`,
    });
  }, [phase, remaining, level, onFinish]);

  const pick = (index, e) => {
    if (phase !== 'playing') return;
    if (index === round.odd) {
      stats.current.picks.push(performance.now() - stats.current.roundStart);
      stats.current.roundStart = performance.now();
      sfx.correct(level);
      setFlash({ x: e.clientX, y: e.clientY, key: Math.random() });
      const next = level + 1;
      setLevel(next);
      setRound(makeRound(next));
    } else {
      stats.current.wrong++;
      sfx.miss();
      setEndsAt((t) => t - WRONG_PENALTY_MS);
      setShake((s) => s + 1);
    }
  };

  const tiles = useMemo(() => Array.from({ length: round.n * round.n }, (_, i) => i), [round]);

  if (phase === 'countdown') {
    return <Countdown subtitle="Find the different shade" tip="Tap the tile that doesn't match. Wrong taps cost 3 seconds." onDone={start} />;
  }

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="game-arena-screen color-eye-arena">
      <HudShell
        onQuit={onQuit}
        metrics={[
          { label: 'Level', value: level, color: '#34D399' },
          { label: 'Time', value: `${seconds}s`, color: seconds <= 10 ? '#F87171' : undefined },
          { label: 'Grid', value: `${round.n}×${round.n}` },
        ]}
      />

      <div className="color-eye-timer" aria-hidden="true">
        <span style={{ transform: `scaleX(${remaining / GAME_MS})` }} />
      </div>

      <div
        key={shake}
        className={`color-eye-grid ${shake ? 'shake' : ''}`}
        style={{ gridTemplateColumns: `repeat(${round.n}, 1fr)` }}
        role="grid"
        aria-label={`Colour grid, level ${level}`}
      >
        {tiles.map((i) => (
          <button
            key={`${round.key}-${i}`}
            type="button"
            className="color-eye-tile"
            style={{ background: i === round.odd ? round.oddColor : round.base, '--d': `${(i % round.n + Math.floor(i / round.n)) * 18}ms` }}
            onPointerDown={(e) => pick(i, e)}
            aria-label={`Tile ${i + 1}`}
          />
        ))}
      </div>

      {flash && <span key={flash.key} className="color-eye-flash" style={{ left: flash.x, top: flash.y }}>+1</span>}
    </div>
  );
}
