/**
 * UX Collective — frontend/src/pages/fun/FunPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crosshair, Grid3x3, Ruler, Play } from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import { Reveal, TiltCard } from '../../lib/motion.jsx';
import AimTrainer from './games/AimTrainer.jsx';
import PatternGame from './games/PatternGame.jsx';
import PixelPerfect from './games/PixelPerfect.jsx';
import GameResults from './GameResults.jsx';
import Leaderboard from './Leaderboard.jsx';
import { sfx } from './sfx.js';
import { track } from '../../lib/track.js';
import './FunPage.css';

const seconds = (ms) => (ms == null ? '–' : `${(ms / 1000).toFixed(1)}s`);

const GAMES = [
  {
    id: 'aim',
    name: 'Aim',
    icon: Crosshair,
    theme: 'crimson',
    component: AimTrainer,
    description: 'Hit 15 targets. Aim for the centre.',
    rules: ['Centre +3', 'Middle +2', 'Edge +1', 'Miss −1'],
    columns: [
      { key: 'score', primary: true, format: (r) => `${r.score}` },
      { key: 'time', format: (r) => seconds(r.time_ms) },
    ],
  },
  {
    id: 'pattern',
    name: 'Pattern',
    icon: Grid3x3,
    theme: 'coral',
    component: PatternGame,
    description: 'Numbers flash. Tap them back in order.',
    rules: ['3×3 → 9×9', '3 lives'],
    columns: [
      { key: 'score', primary: true, format: (r) => `${r.score}` },
      { key: 'time', format: (r) => seconds(r.time_ms) },
    ],
  },
  {
    id: 'pixel',
    name: 'Pixel',
    icon: Ruler,
    theme: 'amber',
    component: PixelPerfect,
    description: 'Tap the exact centre of each shape.',
    rules: ['8 rounds', '0px = 100'],
    columns: [
      { key: 'score', primary: true, format: (r) => `${r.score}` },
      { key: 'time', format: (r) => seconds(r.time_ms) },
    ],
  },
];

// Decorative art behind each game card, hinting at how the game plays.
function GameArt({ id }) {
  if (id === 'aim') {
    return (
      <span className="game-card-art art-aim" aria-hidden="true">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ring r3" />
        <span className="cross" />
      </span>
    );
  }
  if (id === 'pattern') {
    const numbers = { 0: 1, 5: 2, 7: 3 };
    return (
      <span className="game-card-art art-pattern" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`cell ${numbers[i] ? 'lit' : ''}`} style={{ '--k': numbers[i] || 0 }}>
            {numbers[i] || ''}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="game-card-art art-pixel" aria-hidden="true">
      <span className="shape" />
      <span className="marker" />
    </span>
  );
}

export default function FunPage() {
  const [selectedId, setSelectedId] = useState('aim');
  const [playing, setPlaying] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const game = GAMES.find((g) => g.id === selectedId);
  const GameComponent = game.component;

  // Games are full screen: stop the page scrolling behind them
  useEffect(() => {
    if (!playing && !result) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [playing, result]);

  const play = () => {
    sfx.init(); // browsers only allow audio after a user gesture
    track('game_start', selectedId);
    setResult(null);
    setSavedId(null);
    setRunKey((k) => k + 1);
    setPlaying(true);
  };

  const handleFinish = useCallback((res) => {
    track('game_finish', res.game);
    setPlaying(false);
    setResult(res);
  }, []);

  const handleQuit = useCallback(() => setPlaying(false), []);

  return (
    <div className="app-container page-padded game-corner">
      <PageHero title="Fun" lead="Three quick games. Beat the all-time best." />

      <div className="game-picker" role="tablist" aria-label="Choose a game">
        {GAMES.map((g, i) => {
          const Icon = g.icon;
          return (
            <Reveal key={g.id} variant="up" delay={i * 90}>
              <TiltCard
                as="button"
                type="button"
                role="tab"
                aria-selected={selectedId === g.id}
                className={`game-card theme-${g.theme} ${selectedId === g.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(g.id)}
                maxDeg={7}
              >
                <GameArt id={g.id} />
                <span className="game-card-icon"><Icon size={26} /></span>
                <span className="game-card-name">{g.name}</span>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <div className="game-stage" key={game.id}>
        <section className={`game-brief theme-${game.theme}`} data-obstacle>
          <div className="game-brief-art" aria-hidden="true">
            <span className="orb o1" />
            <span className="orb o2" />
            <span className="orb o3" />
          </div>
          <h2 className="game-brief-title">{game.name}</h2>
          <p className="game-brief-desc">{game.description}</p>
          <ul className="game-brief-rules">
            {game.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
          <button type="button" className="game-play-btn" onClick={play}>
            <Play size={20} fill="currentColor" /> Play
          </button>
        </section>

        <Leaderboard game={game} columns={game.columns} highlightId={savedId} refreshKey={refreshKey} />
      </div>

      {/* Games and results render on <body> so nothing on the page can clip or cover them */}
      {playing && createPortal(<GameComponent key={runKey} onFinish={handleFinish} onQuit={handleQuit} onRestart={play} />, document.body)}

      {result && createPortal(
        <GameResults
          result={result}
          onPlayAgain={play}
          onBack={() => setResult(null)}
          onSaved={(id) => {
            setSavedId(id);
            setRefreshKey((k) => k + 1);
          }}
        />,
        document.body
      )}
    </div>
  );
}
