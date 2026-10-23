import React, { useEffect, useRef, useState } from 'react';
import Countdown from './Countdown.jsx';
import HudShell from './HudShell.jsx';
import { sfx } from '../sfx.js';

export const PIXEL_ROUNDS = 8;
const ZERO_POINTS_AT_PX = 30; // 0px off = 100 pts, 30px+ off = 0 pts

const SHAPES = ['rect', 'circle', 'pill', 'diamond', 'ellipse', 'square'];
const COLORS = ['#C21356', '#FA7538', '#E81D88', '#D81E6B', '#8E0B3E', '#F59E0B'];

function makeShape(board) {
  const kind = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const max = Math.min(board.w, board.h);
  let w = max * (0.22 + Math.random() * 0.3);
  let h = w;
  if (kind === 'rect') h = w * (0.45 + Math.random() * 0.4);
  if (kind === 'pill') h = w * 0.38;
  if (kind === 'ellipse') h = w * (0.5 + Math.random() * 0.3);
  if (kind === 'diamond') { w *= 0.8; h = w; }
  const pad = 14;
  const x = pad + Math.random() * (board.w - w - pad * 2);
  const y = pad + Math.random() * (board.h - h - pad * 2);
  return { kind, x, y, w, h, color: COLORS[Math.floor(Math.random() * COLORS.length)], key: Math.random() };
}

// Tap the exact centre of each shape. Eight rounds, up to 100 points each.
export default function PixelPerfect({ onFinish, onQuit }) {
  const [phase, setPhase] = useState('countdown');
  const [roundIndex, setRoundIndex] = useState(0);
  const [shape, setShape] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [total, setTotal] = useState(0);
  const boardRef = useRef(null);
  const results = useRef([]);
  const startedAt = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const boardSize = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    return rect ? { w: rect.width, h: rect.height } : { w: 400, h: 300 };
  };

  const start = () => {
    results.current = [];
    startedAt.current = performance.now();
    setPhase('playing');
  };

  // First shape once the board has a size
  useEffect(() => {
    if (phase === 'playing' && !shape) setShape(makeShape(boardSize()));
  }, [phase, shape]);

  const finish = () => {
    const timeMs = Math.round(performance.now() - startedAt.current);
    const score = results.current.reduce((n, r) => n + r.points, 0);
    const avgOff = results.current.reduce((n, r) => n + r.dist, 0) / results.current.length;
    const best = Math.min(...results.current.map((r) => r.dist));
    const accuracy = Math.round((score / (PIXEL_ROUNDS * 100)) * 100);
    sfx.victory();
    const rank =
      avgOff <= 3 ? { rank: 'S+', title: 'Sub-pixel Sorcerer', color: '#FA7538' }
      : avgOff <= 6 ? { rank: 'A', title: 'Grid-locked Perfectionist', color: '#C21356' }
      : avgOff <= 11 ? { rank: 'B', title: 'Steady-handed Designer', color: '#D81E6B' }
      : { rank: 'C', title: 'Nudge-key Enthusiast', color: '#E81D88' };

    onFinish({
      game: 'pixel',
      score,
      accuracy,
      time_ms: timeMs,
      detail: { avgOff: Number(avgOff.toFixed(2)), rounds: results.current.map((r) => Number(r.dist.toFixed(1))) },
      rank,
      headline: `${score} / ${PIXEL_ROUNDS * 100}`,
      summary: `On average you were ${avgOff.toFixed(1)}px from the true centre. Your best tap was ${best.toFixed(1)}px off.`,
      breakdown: results.current.map((r, i) => ({ label: `Round ${i + 1}`, value: `${r.dist.toFixed(1)}px`, points: `+${r.points}`, tone: r.points >= 80 ? 'center' : r.points >= 50 ? 'mid' : 'outer' })),
      stats: [
        { label: 'Avg offset', value: `${avgOff.toFixed(1)} px` },
        { label: 'Best tap', value: `${best.toFixed(1)} px` },
        { label: 'Precision', value: `${accuracy}%` },
        { label: 'Total time', value: `${(timeMs / 1000).toFixed(1)} s` },
      ],
      shareText: `📐 I scored ${score}/${PIXEL_ROUNDS * 100} in UXCO Pixel Perfect (${avgOff.toFixed(1)}px average offset). Can you find the centre?`,
    });
  };

  const tap = (e) => {
    if (phase !== 'playing' || !shape || reveal) return;
    const rect = boardRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = shape.x + shape.w / 2;
    const cy = shape.y + shape.h / 2;
    const dist = Math.hypot(px - cx, py - cy);
    const points = Math.max(0, Math.round(100 - (dist / ZERO_POINTS_AT_PX) * 100));
    results.current.push({ dist, points });
    setTotal((t) => t + points);
    if (points >= 50) sfx.correct(points / 10);
    else sfx.miss();
    setReveal({ px, py, cx, cy, dist, points });

    setTimeout(() => {
      if (!alive.current) return; // player quit mid-reveal
      setReveal(null);
      if (results.current.length >= PIXEL_ROUNDS) {
        finish();
      } else {
        setRoundIndex((r) => r + 1);
        setShape(makeShape(boardSize()));
      }
    }, 1100);
  };

  if (phase === 'countdown') {
    return <Countdown subtitle="Find the exact centre" tip="Tap the centre of each shape. 8 rounds — every pixel counts." onDone={start} />;
  }

  const shapeStyle = shape && {
    left: shape.x,
    top: shape.y,
    width: shape.w,
    height: shape.h,
    background: shape.color,
  };

  return (
    <div className="game-arena-screen pixel-arena">
      <HudShell
        onQuit={onQuit}
        metrics={[
          { label: 'Score', value: total, color: '#34D399' },
          { label: 'Round', value: `${Math.min(roundIndex + 1, PIXEL_ROUNDS)}/${PIXEL_ROUNDS}` },
        ]}
      />

      <p className="pixel-instruction">Tap the exact centre</p>

      <div ref={boardRef} className="pixel-board" onPointerDown={tap}>
        <div className="pixel-board-grid" aria-hidden="true" />
        {shape && <div key={shape.key} className={`pixel-shape shape-${shape.kind}`} style={shapeStyle} />}

        {reveal && (
          <>
            <svg className="pixel-reveal-line" aria-hidden="true">
              <line x1={reveal.px} y1={reveal.py} x2={reveal.cx} y2={reveal.cy} />
            </svg>
            <span className="pixel-marker you" style={{ left: reveal.px, top: reveal.py }} />
            <span className="pixel-marker target" style={{ left: reveal.cx, top: reveal.cy }} />
            <span className={`pixel-verdict ${reveal.points >= 80 ? 'great' : reveal.points >= 50 ? 'good' : 'off'}`} style={{ left: reveal.cx, top: reveal.cy }}>
              {reveal.dist < 1 ? 'Pixel perfect!' : `${reveal.dist.toFixed(1)}px off`} · +{reveal.points}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
