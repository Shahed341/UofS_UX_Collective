import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Flame, 
  Target, 
  CircleDot,
  Circle,
  XCircle,
  Trophy, 
  Zap, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  Share2, 
  Volume2, 
  VolumeX,
  Award,
  Crosshair,
  Layers,
  ChevronRight,
  CheckCircle2,
  X,
  Medal,
  Users,
  ChevronDown
} from 'lucide-react';
import './FunPage.css';

const TOTAL_DOTS = 15;

// Default Seeded Community Leaderboard
const DEFAULT_LEADERBOARD = [
  { id: 'seed-1', name: 'Palima S.', score: 43, accuracy: 100, totalTime: 6.82, avgReaction: 242, date: 'Top Rank' },
  { id: 'seed-2', name: 'Nina S.', score: 41, accuracy: 93, totalTime: 7.45, avgReaction: 278, date: 'Top Rank' },
  { id: 'seed-3', name: 'Trushank L.', score: 39, accuracy: 93, totalTime: 8.12, avgReaction: 310, date: 'Top Rank' },
  { id: 'seed-4', name: 'Shahed M.', score: 38, accuracy: 87, totalTime: 8.44, avgReaction: 325, date: 'Top Rank' },
  { id: 'seed-5', name: 'Jason M.', score: 35, accuracy: 87, totalTime: 9.15, avgReaction: 360, date: 'Top Rank' },
  { id: 'seed-6', name: 'Ayodeji D.', score: 33, accuracy: 80, totalTime: 9.80, avgReaction: 390, date: 'Top Rank' },
];

// Ranking Algorithm: 1. Highest Score/Points -> 2. Highest Accuracy -> 3. Fastest Total Time
const sortLeaderboard = (list) => {
  return [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.totalTime - b.totalTime;
  });
};

// Web Audio Synthesizer for instant sound effects
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop(pitchMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(820 * pitchMultiplier, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playMiss() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playCountdown() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function FunPage() {
  const [gameState, setGameState] = useState('lobby'); // 'lobby' | 'countdown' | 'playing' | 'gameover'

  // Live Game State (15 Dots Fixed Challenge)
  const [dotsCompleted, setDotsCompleted] = useState(0);
  const [currentHitCount, setCurrentHitCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [reactionRecords, setReactionRecords] = useState([]); // { reaction, zone, points, distRatio }
  const [zoneCounts, setZoneCounts] = useState({ center: 0, middle: 0, outer: 0, miss: 0 });
  const [totalScoreAcc, setTotalScoreAcc] = useState(0);

  const [targetSpawnTime, setTargetSpawnTime] = useState(null);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [currentTargetSize, setCurrentTargetSize] = useState(64);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [countdownNum, setCountdownNum] = useState(3);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [finalDuration, setFinalDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Leaderboard States
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem('uxco_aim_leaderboard');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sortLeaderboard(parsed);
      }
    } catch (e) {}
    return sortLeaderboard(DEFAULT_LEADERBOARD);
  });

  const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [userRankResult, setUserRankResult] = useState(null);

  const arenaRef = useRef(null);

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
  };

  // Determine dynamic random size for each spawned circle
  const getNextTargetSize = useCallback(() => {
    const sizes = [42, 50, 62, 74, 84];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }, []);

  // Spawn random target inside safe bounds
  const spawnNextTarget = useCallback(() => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const nextSize = getNextTargetSize();
    setCurrentTargetSize(nextSize);

    const margin = nextSize + 28;
    const availWidth = Math.max(160, rect.width - margin * 2);
    const availHeight = Math.max(160, rect.height - margin * 2);

    const randomX = margin + Math.random() * availWidth;
    const randomY = margin + Math.random() * availHeight;

    setTargetPos({ x: randomX, y: randomY });
    setTargetSpawnTime(performance.now());
  }, [getNextTargetSize]);

  // Start game with 3-2-1 Countdown
  const handleStartGame = () => {
    sfx.init();
    setIsLeaderboardExpanded(false);
    setGameState('countdown');
    setCountdownNum(3);
    sfx.playCountdown();

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        sfx.playCountdown();
      } else {
        clearInterval(timer);
        // Reset and begin Playing
        setDotsCompleted(0);
        setCurrentHitCount(0);
        setTotalClicks(0);
        setCurrentStreak(0);
        setMaxStreak(0);
        setReactionRecords([]);
        setZoneCounts({ center: 0, middle: 0, outer: 0, miss: 0 });
        setTotalScoreAcc(0);
        setFloatingPoints([]);
        setHasSubmittedScore(false);
        setPlayerNameInput('');
        setUserRankResult(null);
        setGameState('playing');
        setGameStartTime(performance.now());
        setTimeout(() => {
          spawnNextTarget();
        }, 50);
      }
    }, 800);
  };

  // Complete the round when all 15 dots are finished
  const finishGame = (finalScore, completedHitCount, updatedRecords, updatedZoneCounts, now) => {
    const totalTimeSec = (now - (gameStartTime || now)) / 1000;
    setFinalDuration(totalTimeSec);
    setGameState('gameover');
    sfx.playVictory();
  };

  // Save Player Name & Score to Leaderboard
  const handleSaveLeaderboardScore = (e) => {
    if (e) e.preventDefault();
    if (hasSubmittedScore) return;

    const finalName = playerNameInput.trim() || 'Unknown';
    const finalAccuracy = TOTAL_DOTS > 0 ? Math.round((currentHitCount / TOTAL_DOTS) * 100) : 100;
    const finalAvgReaction = reactionRecords.length > 0
      ? Math.round(reactionRecords.reduce((a, b) => a + b.reaction, 0) / reactionRecords.length)
      : 0;

    const newEntry = {
      id: Date.now().toString(),
      name: finalName,
      score: totalScoreAcc,
      accuracy: finalAccuracy,
      totalTime: Number(finalDuration.toFixed(2)),
      avgReaction: finalAvgReaction,
      date: 'Just now'
    };

    const updated = sortLeaderboard([...leaderboard, newEntry]);
    const newRank = updated.findIndex((item) => item.id === newEntry.id) + 1;

    setLeaderboard(updated);
    setHasSubmittedScore(true);
    setUserRankResult(newRank);

    try {
      localStorage.setItem('uxco_aim_leaderboard', JSON.stringify(updated.slice(0, 50)));
    } catch (err) {}
  };

  // 3-Zone Target Click Handler: Center (+3), Middle (+2), Outer (+1)
  const handleTargetClick = (e) => {
    e.stopPropagation();
    const now = performance.now();
    const newCompleted = dotsCompleted + 1;
    const newHits = currentHitCount + 1;
    const newTotalClicks = totalClicks + 1;
    const reaction = targetSpawnTime ? Math.round(now - targetSpawnTime) : 250;

    // Radial distance calculation from target center
    const targetEl = e.currentTarget.getBoundingClientRect();
    const centerX = targetEl.left + targetEl.width / 2;
    const centerY = targetEl.top + targetEl.height / 2;
    const radius = targetEl.width / 2;

    const clickDist = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    const ratio = Math.min(1, clickDist / radius);

    // Scoring: Center = 3, Middle = 2, Side (Outer) = 1
    let zone = 'outer';
    let zoneLabel = 'OUTER EDGE';
    let zonePoints = 1;
    let pitchMultiplier = 0.95;

    if (ratio <= 0.33) {
      zone = 'center';
      zoneLabel = '🎯 BULLSEYE!';
      zonePoints = 3;
      pitchMultiplier = 1.35;
    } else if (ratio <= 0.66) {
      zone = 'middle';
      zoneLabel = '✨ MID RING';
      zonePoints = 2;
      pitchMultiplier = 1.15;
    } else {
      zone = 'outer';
      zoneLabel = '⚡ SIDE RING';
      zonePoints = 1;
      pitchMultiplier = 0.95;
    }

    const newScore = totalScoreAcc + zonePoints;
    const newStreak = currentStreak + 1;
    const newMaxStreak = Math.max(maxStreak, newStreak);

    // Play pitch-shifted pop sound
    sfx.playPop(pitchMultiplier + (newStreak - 1) * 0.05);

    // Floating feedback at click point
    const arenaRect = arenaRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = e.clientX - arenaRect.left;
    const clickY = e.clientY - arenaRect.top;

    setFloatingPoints((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        text: `+${zonePoints} (${zoneLabel})`,
        reaction: `${reaction}ms`,
        zone,
        streak: newStreak > 2 ? `🔥 ${newStreak}x` : null
      }
    ]);

    const newRecord = { reaction, zone, points: zonePoints, distRatio: ratio };
    const updatedRecords = [...reactionRecords, newRecord];
    const updatedZoneCounts = { ...zoneCounts, [zone]: zoneCounts[zone] + 1 };

    setDotsCompleted(newCompleted);
    setCurrentHitCount(newHits);
    setTotalClicks(newTotalClicks);
    setCurrentStreak(newStreak);
    setMaxStreak(newMaxStreak);
    setReactionRecords(updatedRecords);
    setTotalScoreAcc(newScore);
    setZoneCounts(updatedZoneCounts);

    if (newCompleted >= TOTAL_DOTS) {
      finishGame(newScore, newHits, updatedRecords, updatedZoneCounts, now);
    } else {
      spawnNextTarget();
    }
  };

  // Arena Miss Handler: Click outside dot loses 1 point (-1) and advances to next dot
  const handleArenaMiss = (e) => {
    if (gameState !== 'playing') return;
    const now = performance.now();
    const newCompleted = dotsCompleted + 1;
    const newTotalClicks = totalClicks + 1;
    const newScore = totalScoreAcc - 1;

    sfx.playMiss();
    setCurrentStreak(0);

    const rect = arenaRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setFloatingPoints((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        text: '-1 (Missed)',
        isMiss: true
      }
    ]);

    const updatedZoneCounts = { ...zoneCounts, miss: zoneCounts.miss + 1 };

    setDotsCompleted(newCompleted);
    setTotalClicks(newTotalClicks);
    setTotalScoreAcc(newScore);
    setZoneCounts(updatedZoneCounts);

    if (newCompleted >= TOTAL_DOTS) {
      finishGame(newScore, currentHitCount, reactionRecords, updatedZoneCounts, now);
    } else {
      spawnNextTarget();
    }
  };

  // Clean floating points
  useEffect(() => {
    if (floatingPoints.length > 0) {
      const timer = setTimeout(() => {
        setFloatingPoints((prev) => prev.slice(1));
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [floatingPoints]);

  // Derived Performance Metrics
  const avgReactionTime = reactionRecords.length > 0
    ? Math.round(reactionRecords.reduce((a, b) => a + b.reaction, 0) / reactionRecords.length)
    : 0;

  const fastestReaction = reactionRecords.length > 0
    ? Math.min(...reactionRecords.map(r => r.reaction))
    : 0;

  const currentAccuracy = TOTAL_DOTS > 0
    ? Math.round((currentHitCount / TOTAL_DOTS) * 100)
    : 100;

  // Rank Badge based on Score & Speed
  const getRankBadge = () => {
    if (totalScoreAcc >= 38 && avgReactionTime < 380) {
      return { rank: 'S+', title: '⚡ Godlike Bullseye Master', color: '#FA7538' };
    }
    if (totalScoreAcc >= 30 && avgReactionTime < 460) {
      return { rank: 'A', title: '🎨 Figma Precision Master', color: '#C21356' };
    }
    if (totalScoreAcc >= 20) {
      return { rank: 'B', title: '🎯 Pro UI Designer', color: '#D81E6B' };
    }
    return { rank: 'C', title: '✨ Quick Cursor Learner', color: '#E81D88' };
  };

  const rankInfo = getRankBadge();

  // Share score
  const handleShareScore = () => {
    const name = playerNameInput.trim() || 'Unknown';
    const text = `🎯 UXCO Reflex Aim Score: ${totalScoreAcc} pts / 45 by ${name} | 🎯 ${zoneCounts.center} Bullseyes | ⚡ ${avgReactionTime}ms Avg Reaction | ⏱️ ${finalDuration.toFixed(2)}s Total Time | ${currentAccuracy}% Accuracy! Try it on UX Collective! 🚀`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="fun-page-wrapper">
      {/* ========================================================
          1. LOBBY VIEW: ARCADE GAME SELECTION
          ======================================================== */}
      {gameState === 'lobby' && (
        <div className="app-container page-padded">
          {/* Header */}
          <div className="fun-header-block">
            <h1 className="fun-main-title">UXCO Gameboard</h1>
          </div>

          {/* Featured 3D Game Card */}
          <div className="featured-game-card">
            <div className="game-card-mesh-bg" />
            <div className="game-card-content game-card-2col-layout">
              {/* Left Column */}
              <div className="game-card-main-col">
                <div>
                  <h2 className="game-title">Sunset 3-Zone Precision Aim Lab</h2>
                  <p className="game-description">
                    15 circles pop up rapidly with <strong>random dynamic sizes</strong>. Hit the <strong>Center</strong> (+3 pts), <strong>Middle</strong> (+2 pts), or <strong>Side</strong> (+1 pt). Clicking outside counts as a miss (-1 pt) and skips immediately to the next dot!
                  </p>
                </div>

                {/* 3-Zone & Miss Scoring Visual Pill Banner (Distinct Icons + Points Only) */}
                <div className="zone-explainer-banner">
                  <div className="zone-explain-item center">
                    <Target size={18} color="#FFD700" />
                    <span className="zone-pts">+3 Pts</span>
                  </div>
                  <div className="zone-explain-item mid">
                    <CircleDot size={18} color="#FFB199" />
                    <span className="zone-pts">+2 Pts</span>
                  </div>
                  <div className="zone-explain-item outer">
                    <Circle size={18} color="#FFA6D5" />
                    <span className="zone-pts">+1 Pt</span>
                  </div>
                  <div className="zone-explain-item miss">
                    <XCircle size={18} color="#FCA5A5" />
                    <span className="zone-pts">-1 Pt</span>
                  </div>
                </div>

                {/* Launch Action */}
                <div className="game-launch-row">
                  <button 
                    type="button" 
                    className="btn-launch-game"
                    onClick={handleStartGame}
                  >
                    <Crosshair size={20} />
                    <span>Start Precision Challenge</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Right Column: Full-Height Leaderboard Card */}
              <div 
                className="leaderboard-mini-card full-height"
                onClick={() => setIsLeaderboardExpanded(true)}
                title="Click to view full Leaderboard"
              >
                <div className="leaderboard-mini-header">
                  <div className="leaderboard-mini-title-wrap">
                    <Trophy size={16} color="#FFD700" />
                    <span className="leaderboard-mini-title">Leaderboard</span>
                  </div>
                  <span className="leaderboard-expand-pill">Top 4 ▾</span>
                </div>

                <div className="leaderboard-mini-list">
                  {leaderboard.slice(0, 4).map((entry, idx) => (
                    <div key={entry.id || idx} className={`leaderboard-mini-row rank-${idx + 1}`}>
                      <div className="mini-row-left">
                        <span className={`mini-rank-num rank-${idx + 1}`}>#{idx + 1}</span>
                        <span className="mini-player-name">{entry.name || 'Unknown'}</span>
                      </div>
                      <div className="mini-row-right">
                        <span className="mini-player-score">{entry.score} pts</span>
                        <span className="mini-player-time">{entry.totalTime}s</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="leaderboard-click-hint">Click to expand full ranking ↗</div>
              </div>
            </div>
          </div>

          {/* Upcoming Arcade Teaser Cards */}
          <div className="arcade-upcoming-grid">
            <div className="arcade-teaser-card">
              <div className="teaser-icon-box">
                <Sparkles size={22} color="#FA7538" />
              </div>
              <div className="teaser-status">Coming Soon</div>
              <h3 className="teaser-title">Figma Shortcut Speedrun</h3>
              <p className="teaser-desc">
                Test your keyboard speed with essential Figma hotkeys: autolayout, components, boolean ops, and vector points.
              </p>
            </div>

            <div className="arcade-teaser-card">
              <div className="teaser-icon-box">
                <Layers size={22} color="#D81E6B" />
              </div>
              <div className="teaser-status">Coming Soon</div>
              <h3 className="teaser-title">Color Harmony & Contrast Matcher</h3>
              <p className="teaser-desc">
                Guess WCAG AAA contrast ratios and identify harmonious hex palette complementary triads against the clock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EXPANDED FULL LEADERBOARD MODAL / DRAWER
          ======================================================== */}
      {isLeaderboardExpanded && (
        <div className="leaderboard-modal-overlay" onClick={() => setIsLeaderboardExpanded(false)}>
          <div className="leaderboard-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-modal-header">
              <div className="leaderboard-modal-title-group">
                <div className="trophy-badge-icon">
                  <Trophy size={24} color="#FFD700" />
                </div>
                <div>
                  <h2 className="leaderboard-modal-title">UXCO Aim Lab Leaderboard</h2>
                  <p className="leaderboard-modal-subtitle">
                    Ranked by <strong>Precision Score</strong> (+3 Center, +2 Mid, +1 Side, -1 Miss) and <strong>Fastest Elapsed Time</strong>.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="leaderboard-close-btn"
                onClick={() => setIsLeaderboardExpanded(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Precision Score</th>
                    <th>Accuracy</th>
                    <th>Total Time</th>
                    <th>Avg Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, idx) => (
                    <tr key={player.id || idx} className={`leaderboard-row rank-${idx + 1}`}>
                      <td>
                        <span className={`rank-badge rank-${idx + 1}`}>
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="player-cell">
                        <strong>{player.name || 'Unknown'}</strong>
                      </td>
                      <td className="score-cell">
                        <span className="score-badge">{player.score} pts</span>
                      </td>
                      <td>{player.accuracy}%</td>
                      <td className="time-cell">⏱️ {player.totalTime}s</td>
                      <td>⚡ {player.avgReaction}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="leaderboard-modal-footer">
              <button 
                type="button" 
                className="btn-modal-start"
                onClick={handleStartGame}
              >
                <Crosshair size={18} />
                <span>Play & Challenge Top Rank</span>
              </button>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setIsLeaderboardExpanded(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. COUNTDOWN OVERLAY
          ======================================================== */}
      {gameState === 'countdown' && (
        <div className="game-countdown-screen">
          <div className="countdown-content">
            <span className="countdown-subtitle">Get Ready! Aim for the Golden Core...</span>
            <div className="countdown-number-display">{countdownNum}</div>
            <p className="countdown-tip">Center Bullseye gives +3 points. Don't click outside or you will lose 1 point!</p>
          </div>
        </div>
      )}

      {/* ========================================================
          3. FULL INTERACTIVE PLAYING ARENA (Target Count Hidden)
          ======================================================== */}
      {gameState === 'playing' && (
        <div 
          className="game-arena-screen"
          ref={arenaRef}
          onClick={handleArenaMiss}
        >
          {/* Top Realtime HUD (Target Count Intentionally Hidden) */}
          <div className="arena-hud-bar" onClick={(e) => e.stopPropagation()}>
            <div className="hud-metric">
              <span className="hud-metric-label">Live Score</span>
              <span className="hud-metric-val" style={{ color: totalScoreAcc >= 0 ? '#34D399' : '#F87171' }}>
                {totalScoreAcc} pts
              </span>
            </div>

            <div className="hud-metric">
              <span className="hud-metric-label">Hit Rate</span>
              <span className="hud-metric-val">{currentAccuracy}%</span>
            </div>

            <div className="hud-metric">
              <span className="hud-metric-label">Avg Speed</span>
              <span className="hud-metric-val">{avgReactionTime} ms</span>
            </div>

            <div className="hud-metric">
              <span className="hud-metric-label">Bullseyes</span>
              <span className="hud-metric-val" style={{ color: '#FFD700' }}>🎯 {zoneCounts.center}</span>
            </div>

            {currentStreak > 1 && (
              <div className="hud-metric streak">
                <span className="hud-metric-label">Streak</span>
                <span className="hud-metric-val">🔥 {currentStreak}x</span>
              </div>
            )}

            <div className="hud-actions-right">
              <button 
                type="button" 
                className="hud-icon-btn" 
                onClick={toggleSound}
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <button 
                type="button" 
                className="hud-quit-btn"
                onClick={() => setGameState('lobby')}
              >
                ✕ Quit
              </button>
            </div>
          </div>

          {/* 3-Zone Concentric Target Circle Entity */}
          <div
            className="arena-target-circle concentric-3zone"
            style={{
              left: `${targetPos.x}px`,
              top: `${targetPos.y}px`,
              width: `${currentTargetSize}px`,
              height: `${currentTargetSize}px`,
            }}
            onClick={handleTargetClick}
          >
            {/* Outer Ring Layer (67% - 100%) */}
            <div className="target-outer-zone">
              {/* Middle Ring Layer (34% - 66%) */}
              <div className="target-mid-zone">
                {/* Center Core / Bullseye (0 - 33%) */}
                <div className="target-center-bullseye">
                  <div className="bullseye-crosshair-dot" />
                </div>
              </div>
            </div>

            {/* Glowing Pulse Animation */}
            <div className="target-pulse-ring" />
          </div>

          {/* Floating Point Indicators (+3 Center / +2 Mid / +1 Side / -1 Miss) */}
          {floatingPoints.map((pt) => (
            <div
              key={pt.id}
              className={`floating-score-tag ${pt.isMiss ? 'miss' : 'hit'} zone-${pt.zone || 'outer'}`}
              style={{ left: `${pt.x}px`, top: `${pt.y}px` }}
            >
              <span className="floating-main-text">{pt.text}</span>
              {pt.reaction && <span className="floating-ms-text">{pt.reaction}</span>}
              {pt.streak && <span className="floating-streak">{pt.streak}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          4. END-OF-GAME RESULTS SCREEN (Score & Accuracy Report)
          ======================================================== */}
      {gameState === 'gameover' && (
        <div className="game-results-screen">
          <div className="results-modal-card">
            <div className="results-header-mesh" />

            <div className="results-body">
              {/* Rank Header */}
              <div className="results-rank-badge" style={{ borderColor: rankInfo.color }}>
                <Award size={24} color={rankInfo.color} />
                <span>{rankInfo.rank} Rank • {rankInfo.title}</span>
              </div>

              <h2 className="results-score-title">{totalScoreAcc} Points</h2>
              <p className="results-congrats-text">
                Completed 15 targets in <strong>{finalDuration.toFixed(2)}s</strong> with an average reaction time of <strong>{avgReactionTime}ms</strong>.
              </p>

              {/* Clean Inline Name Input (No outer nested box) */}
              <div className="results-name-section-clean">
                {!hasSubmittedScore ? (
                  <form onSubmit={handleSaveLeaderboardScore} className="results-name-form-clean">
                    <input
                      type="text"
                      maxLength={22}
                      placeholder="Enter your name (leave blank for 'Unknown')"
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                      className="player-name-input-clean"
                      autoFocus
                    />
                    <button type="submit" className="btn-submit-score-clean">
                      Save to Leaderboard
                    </button>
                  </form>
                ) : (
                  <div className="results-name-saved-clean">
                    <CheckCircle2 size={18} color="#10B981" />
                    <span>Saved as <strong>{playerNameInput.trim() || 'Unknown'}</strong>! Rank <strong>#{userRankResult}</strong></span>
                    <button 
                      type="button" 
                      className="btn-view-leaderboard-link"
                      onClick={() => setIsLeaderboardExpanded(true)}
                    >
                      View Leaderboard ↗
                    </button>
                  </div>
                )}
              </div>

              {/* Flat Clean 3-Zone Points Breakdown (No Nested Boxes) */}
              <div className="results-breakdown-flat">
                <div className="breakdown-flat-item center">
                  <Target size={18} color="#D97706" />
                  <span className="flat-item-title">Center</span>
                  <span className="flat-item-val">{zoneCounts.center} hits</span>
                  <span className="flat-item-pts">+{zoneCounts.center * 3} pts</span>
                </div>
                <div className="breakdown-flat-item mid">
                  <CircleDot size={18} color="#EA580C" />
                  <span className="flat-item-title">Middle</span>
                  <span className="flat-item-val">{zoneCounts.middle} hits</span>
                  <span className="flat-item-pts">+{zoneCounts.middle * 2} pts</span>
                </div>
                <div className="breakdown-flat-item outer">
                  <Circle size={18} color="#C21356" />
                  <span className="flat-item-title">Side</span>
                  <span className="flat-item-val">{zoneCounts.outer} hits</span>
                  <span className="flat-item-pts">+{zoneCounts.outer * 1} pts</span>
                </div>
                <div className="breakdown-flat-item miss">
                  <XCircle size={18} color="#DC2626" />
                  <span className="flat-item-title">Misses</span>
                  <span className="flat-item-val">{zoneCounts.miss} misses</span>
                  <span className="flat-item-pts">-{zoneCounts.miss * 1} pts</span>
                </div>
              </div>

              {/* Clean Flat Stats Row (No Box Grids) */}
              <div className="results-stats-row-flat">
                <div className="stat-flat-item">
                  <span className="stat-flat-val">{currentAccuracy}%</span>
                  <span className="stat-flat-label">Accuracy ({currentHitCount}/15)</span>
                </div>
                <div className="stat-flat-divider" />
                <div className="stat-flat-item">
                  <span className="stat-flat-val">{avgReactionTime} ms</span>
                  <span className="stat-flat-label">Avg Speed (Best: {fastestReaction}ms)</span>
                </div>
                <div className="stat-flat-divider" />
                <div className="stat-flat-item">
                  <span className="stat-flat-val">{finalDuration.toFixed(2)} s</span>
                  <span className="stat-flat-label">Total Time</span>
                </div>
                <div className="stat-flat-divider" />
                <div className="stat-flat-item">
                  <span className="stat-flat-val">{maxStreak}</span>
                  <span className="stat-flat-label">Max Hit Streak</span>
                </div>
              </div>

              {/* Actions Row */}
              <div className="results-actions-row">
                <button
                  type="button"
                  className="btn-results-primary"
                  onClick={handleStartGame}
                >
                  <RotateCcw size={18} />
                  <span>Play Again</span>
                </button>

                <button
                  type="button"
                  className="btn-results-share"
                  onClick={handleShareScore}
                >
                  <Share2 size={16} />
                  <span>{copiedNotification ? 'Copied to Clipboard!' : 'Share Precision Score'}</span>
                </button>

                <button
                  type="button"
                  className="btn-results-secondary"
                  onClick={() => setGameState('lobby')}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Arcade</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
