import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crosshair, Palette, Ruler, Gamepad2, Play, Target, CircleDot, Circle, XCircle } from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import { Reveal, TiltCard } from '../../lib/motion.jsx';
import AimTrainer, { AIM_TOTAL_DOTS } from './games/AimTrainer.jsx';
import ColorEye from './games/ColorEye.jsx';
import PixelPerfect, { PIXEL_ROUNDS } from './games/PixelPerfect.jsx';
import GameResults from './GameResults.jsx';
import Leaderboard from './Leaderboard.jsx';
import { sfx } from './sfx.js';
import './FunPage.css';
import './GameCorner.css';

const seconds = (ms) => (ms == null ? '–' : `${(ms / 1000).toFixed(2)}s`);

const GAMES = [
  {
    id: 'aim',
    name: 'Aim Trainer',
    tagline: 'Reflexes & precision',
    icon: Crosshair,
    theme: 'crimson',
    component: AimTrainer,
    description: `${AIM_TOTAL_DOTS} targets pop up at random sizes. Hit the core for the most points — but a miss costs you.`,
    rules: [
      { icon: Target, text: 'Centre +3' },
      { icon: CircleDot, text: 'Middle +2' },
      { icon: Circle, text: 'Edge +1' },
      { icon: XCircle, text: 'Miss −1' },
    ],
    columns: [
      { key: 'score', primary: true, format: (r) => `${r.score} pts` },
      { key: 'acc', format: (r) => `${r.accuracy ?? '–'}%` },
      { key: 'time', format: (r) => seconds(r.time_ms) },
    ],
  },
  {
    id: 'color',
    name: 'Colour Eye',
    tagline: 'Colour perception',
    icon: Palette,
    theme: 'coral',
    component: ColorEye,
    description: 'Spot the tile with a slightly different shade. The grid grows and the difference shrinks every level. 45 seconds.',
    rules: [
      { icon: Palette, text: 'Find the odd shade' },
      { icon: Target, text: '+1 level each' },
      { icon: XCircle, text: 'Wrong tap −3s' },
    ],
    columns: [
      { key: 'level', primary: true, format: (r) => `Lvl ${r.score}` },
      { key: 'acc', format: (r) => `${r.accuracy ?? '–'}%` },
      { key: 'time', format: (r) => (r.time_ms ? `${(r.time_ms / 1000).toFixed(2)}s/find` : '–') },
    ],
  },
  {
    id: 'pixel',
    name: 'Pixel Perfect',
    tagline: 'Visual precision',
    icon: Ruler,
    theme: 'amber',
    component: PixelPerfect,
    description: `Tap the exact centre of ${PIXEL_ROUNDS} shapes. You get up to 100 points per round — every pixel off costs you.`,
    rules: [
      { icon: Target, text: '0px = 100 pts' },
      { icon: Ruler, text: '30px+ = 0 pts' },
      { icon: CircleDot, text: `${PIXEL_ROUNDS} rounds` },
    ],
    columns: [
      { key: 'score', primary: true, format: (r) => `${r.score} pts` },
      { key: 'acc', format: (r) => `${r.accuracy ?? '–'}%` },
      { key: 'time', format: (r) => seconds(r.time_ms) },
    ],
  },
];

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
    setResult(null);
    setSavedId(null);
    setRunKey((k) => k + 1);
    setPlaying(true);
  };

  const handleFinish = useCallback((res) => {
    setPlaying(false);
    setResult(res);
  }, []);

  const handleQuit = useCallback(() => setPlaying(false), []);

  return (
    <div className="app-container page-padded game-corner">
      <PageHero
        eyebrow="Game Corner"
        icon={<Gamepad2 size={14} />}
        title="Train your designer’s eye"
        lead="Three quick games built by UXCO. Play on desktop or phone, save your score, and top the weekly leaderboard."
      />

      <div className="game-picker" role="tablist" aria-label="Choose a game">
        {GAMES.map((g, i) => {
          const Icon = g.icon;
          return (
            <Reveal key={g.id} variant="up" delay={i * 100}>
              <TiltCard
                as="button"
                type="button"
                role="tab"
                aria-selected={selectedId === g.id}
                className={`game-card theme-${g.theme} ${selectedId === g.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(g.id)}
                maxDeg={7}
              >
                <span className="game-card-icon"><Icon size={26} /></span>
                <span className="game-card-tagline">{g.tagline}</span>
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
            {game.rules.map(({ icon: Icon, text }) => (
              <li key={text}><Icon size={16} /> {text}</li>
            ))}
          </ul>
          <button type="button" className="game-play-btn" onClick={play}>
            <Play size={20} fill="currentColor" /> Play {game.name}
          </button>
        </section>

        <Leaderboard game={game} columns={game.columns} highlightId={savedId} refreshKey={refreshKey} />
      </div>

      {/* Games and results render on <body> so nothing on the page can clip or cover them */}
      {playing && createPortal(<GameComponent key={runKey} onFinish={handleFinish} onQuit={handleQuit} />, document.body)}

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
