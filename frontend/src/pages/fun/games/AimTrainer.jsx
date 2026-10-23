/**
 * UX Collective — frontend/src/pages/fun/games/AimTrainer.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Countdown from './Countdown.jsx';
import HudShell from './HudShell.jsx';
import { sfx } from '../sfx.js';

export const AIM_TOTAL_DOTS = 15;
const SIZES = [42, 50, 62, 74, 84];

// Three-zone aim trainer: centre +3, middle +2, edge +1, miss -1. 15 targets.
export default function AimTrainer({ onFinish, onQuit, onRestart }) {
  const [phase, setPhase] = useState('countdown');
  const [, rerender] = useState(0);
  const [target, setTarget] = useState({ x: 0, y: 0, size: 64, key: 0 });
  const [floaters, setFloaters] = useState([]);
  const arenaRef = useRef(null);
  const run = useRef(null);

  const spawn = useCallback(() => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Smaller targets on phones, and keep clear of the HUD at the top
    const scale = rect.width < 600 ? 0.85 : 1;
    const size = Math.round(SIZES[Math.floor(Math.random() * SIZES.length)] * scale);
    const margin = size / 2 + 16;
    const top = rect.width < 600 ? 150 : 110;
    setTarget((t) => ({
      size,
      x: margin + Math.random() * Math.max(10, rect.width - margin * 2),
      y: top + margin + Math.random() * Math.max(10, rect.height - top - margin * 2),
      key: t.key + 1,
    }));
    run.current.spawnedAt = performance.now();
  }, []);

  const start = () => {
    run.current = { done: 0, hits: 0, score: 0, streak: 0, maxStreak: 0, reactions: [], zones: { center: 0, middle: 0, outer: 0, miss: 0 }, startedAt: performance.now(), spawnedAt: 0 };
    setPhase('playing');
    requestAnimationFrame(spawn);
  };

  const addFloater = (e, data) => {
    const rect = arenaRef.current.getBoundingClientRect();
    setFloaters((f) => [...f.slice(-6), { id: performance.now() + Math.random(), x: e.clientX - rect.left, y: e.clientY - rect.top, ...data }]);
  };

  const advance = () => {
    const r = run.current;
    r.done++;
    rerender((n) => n + 1);
    if (r.done < AIM_TOTAL_DOTS) {
      spawn();
      return;
    }
    sfx.victory();
    const timeMs = Math.round(performance.now() - r.startedAt);
    const avg = r.reactions.length ? Math.round(r.reactions.reduce((a, b) => a + b, 0) / r.reactions.length) : 0;
    const accuracy = Math.round((r.hits / AIM_TOTAL_DOTS) * 100);
    const rank =
      r.score >= 38 && avg < 380 ? { rank: 'S+', title: 'Godlike Bullseye Master', color: '#FA7538' }
      : r.score >= 30 && avg < 460 ? { rank: 'A', title: 'Figma Precision Master', color: '#C21356' }
      : r.score >= 20 ? { rank: 'B', title: 'Pro UI Designer', color: '#D81E6B' }
      : { rank: 'C', title: 'Quick Cursor Learner', color: '#E81D88' };

    onFinish({
      game: 'aim',
      score: Math.max(0, r.score),
      accuracy,
      time_ms: timeMs,
      detail: { zones: r.zones, avgReaction: avg, maxStreak: r.maxStreak },
      rank,
      headline: `${r.score} points`,
      summary: `${AIM_TOTAL_DOTS} targets in ${(timeMs / 1000).toFixed(2)}s with an average reaction of ${avg}ms.`,
      breakdown: [
        { label: 'Centre', value: `${r.zones.center} hits`, points: `+${r.zones.center * 3}`, tone: 'center' },
        { label: 'Middle', value: `${r.zones.middle} hits`, points: `+${r.zones.middle * 2}`, tone: 'mid' },
        { label: 'Edge', value: `${r.zones.outer} hits`, points: `+${r.zones.outer}`, tone: 'outer' },
        { label: 'Misses', value: `${r.zones.miss}`, points: `-${r.zones.miss}`, tone: 'miss' },
      ],
      stats: [
        { label: 'Accuracy', value: `${accuracy}%` },
        { label: 'Avg reaction', value: `${avg} ms` },
        { label: 'Total time', value: `${(timeMs / 1000).toFixed(2)} s` },
        { label: 'Best streak', value: r.maxStreak },
      ],
      shareText: `🎯 I scored ${r.score}/45 in the UXCO Aim Trainer (${accuracy}% accuracy, ${avg}ms avg reaction). Beat me:`,
    });
  };

  const onTargetHit = (e) => {
    e.stopPropagation();
    const r = run.current;
    const reaction = Math.round(performance.now() - r.spawnedAt);
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2)) / (rect.width / 2));
    const [zone, points, label, pitch] =
      ratio <= 0.33 ? ['center', 3, '🎯 BULLSEYE', 1.35] : ratio <= 0.66 ? ['middle', 2, '✨ MID', 1.15] : ['outer', 1, '⚡ EDGE', 0.95];

    r.hits++;
    r.score += points;
    r.streak++;
    r.maxStreak = Math.max(r.maxStreak, r.streak);
    r.reactions.push(reaction);
    r.zones[zone]++;
    sfx.pop(pitch + (r.streak - 1) * 0.05);
    addFloater(e, { text: `+${points} ${label}`, sub: `${reaction}ms`, zone, streak: r.streak > 2 ? `🔥 ${r.streak}x` : null });
    advance();
  };

  const onMiss = (e) => {
    if (phase !== 'playing') return;
    const r = run.current;
    r.score -= 1;
    r.streak = 0;
    r.zones.miss++;
    sfx.miss();
    addFloater(e, { text: '-1 Missed', miss: true });
    advance();
  };

  // Floating labels clean themselves up
  useEffect(() => {
    if (!floaters.length) return undefined;
    const t = setTimeout(() => setFloaters((f) => f.slice(1)), 750);
    return () => clearTimeout(t);
  }, [floaters]);

  if (phase === 'countdown') {
    return <Countdown subtitle="Aim for the golden core" tip="Centre +3 · Middle +2 · Edge +1 · Missing costs a point" onDone={start} />;
  }

  const r = run.current;
  const avg = r.reactions.length ? Math.round(r.reactions.reduce((a, b) => a + b, 0) / r.reactions.length) : 0;

  return (
    <div className="game-arena-screen" ref={arenaRef} onPointerDown={onMiss}>
      <HudShell
        onQuit={onQuit}
        onRestart={onRestart}
        metrics={[
          { label: 'Score', value: r.score, color: r.score >= 0 ? '#34D399' : '#F87171' },
          { label: 'Target', value: `${Math.min(r.done + 1, AIM_TOTAL_DOTS)}/${AIM_TOTAL_DOTS}` },
          { label: 'Avg', value: `${avg}ms` },
          r.streak > 1 && { label: 'Streak', value: `🔥 ${r.streak}x`, className: 'streak' },
        ]}
      />

      <button
        key={target.key}
        type="button"
        className="arena-target-circle concentric-3zone"
        style={{ left: target.x, top: target.y, width: target.size, height: target.size }}
        onPointerDown={onTargetHit}
        aria-label="Target"
      >
        <span className="target-outer-zone">
          <span className="target-mid-zone">
            <span className="target-center-bullseye">
              <span className="bullseye-crosshair-dot" />
            </span>
          </span>
        </span>
        <span className="target-pulse-ring" />
      </button>

      {floaters.map((f) => (
        <div key={f.id} className={`floating-score-tag ${f.miss ? 'miss' : 'hit'} zone-${f.zone || 'outer'}`} style={{ left: f.x, top: f.y }}>
          <span className="floating-main-text">{f.text}</span>
          {f.sub && <span className="floating-ms-text">{f.sub}</span>}
          {f.streak && <span className="floating-streak">{f.streak}</span>}
        </div>
      ))}
    </div>
  );
}
