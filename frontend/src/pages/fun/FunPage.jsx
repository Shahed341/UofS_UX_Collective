import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Flame, 
  Target, 
  Trophy, 
  Zap, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  Share2, 
  Volume2, 
  VolumeX,
  Award,
  Crosshair,
  TrendingUp,
  Layers,
  ChevronRight,
  HelpCircle,
  Activity
} from 'lucide-react';
import './FunPage.css';

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
  const [targetCountGoal, setTargetCountGoal] = useState(20); // 15, 20, 30
  const [sizeMode, setSizeMode] = useState('dynamic'); // 'dynamic' | 'small' | 'medium' | 'large'

  // Live Game State
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

  // High score tracking
  const [bestStats, setBestStats] = useState(() => {
    try {
      const saved = localStorage.getItem('uxco_aim_high_score');
      return saved ? JSON.parse(saved) : { score: 0, accuracy: 0, avgReaction: 0, centerHits: 0 };
    } catch (e) {
      return { score: 0, accuracy: 0, avgReaction: 0, centerHits: 0 };
    }
  });

  const arenaRef = useRef(null);

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
  };

  // Determine dynamic size for next spawned circle
  const getNextTargetSize = useCallback(() => {
    if (sizeMode === 'small') return 48;
    if (sizeMode === 'medium') return 64;
    if (sizeMode === 'large') return 80;
    // Dynamic Mode: Randomly varies between 42px (precise small), 60px (mid), and 82px (large)
    const sizes = [44, 52, 64, 76, 84];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }, [sizeMode]);

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
        setCurrentHitCount(0);
        setTotalClicks(0);
        setCurrentStreak(0);
        setMaxStreak(0);
        setReactionRecords([]);
        setZoneCounts({ center: 0, middle: 0, outer: 0, miss: 0 });
        setTotalScoreAcc(0);
        setFloatingPoints([]);
        setGameState('playing');
        setGameStartTime(performance.now());
        setTimeout(() => {
          spawnNextTarget();
        }, 50);
      }
    }, 800);
  };

  // 3-Zone Target Click Handler
  const handleTargetClick = (e) => {
    e.stopPropagation();
    const now = performance.now();
    const hitNumber = currentHitCount + 1;
    const newTotalClicks = totalClicks + 1;
    const reaction = targetSpawnTime ? Math.round(now - targetSpawnTime) : 280;

    // Calculate exact radial click distance from center of the target
    const targetEl = e.currentTarget.getBoundingClientRect();
    const centerX = targetEl.left + targetEl.width / 2;
    const centerY = targetEl.top + targetEl.height / 2;
    const radius = targetEl.width / 2;

    const clickDist = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    const ratio = Math.min(1, clickDist / radius);

    // 3 Concentric Zones: Center (<=33%), Middle (34%-66%), Outer (67%-100%)
    let zone = 'outer';
    let zoneLabel = 'OUTER EDGE';
    let zonePoints = 100;
    let zoneColor = '#FA7538';
    let pitchMultiplier = 1;

    if (ratio <= 0.33) {
      zone = 'center';
      zoneLabel = '🎯 BULLSEYE!';
      zonePoints = 300;
      zoneColor = '#FFD700';
      pitchMultiplier = 1.35;
    } else if (ratio <= 0.66) {
      zone = 'middle';
      zoneLabel = '✨ MID RING';
      zonePoints = 200;
      zoneColor = '#FF6B4A';
      pitchMultiplier = 1.15;
    } else {
      zone = 'outer';
      zoneLabel = '⚡ OUTER RING';
      zonePoints = 100;
      zoneColor = '#E81D88';
      pitchMultiplier = 0.95;
    }

    const newStreak = currentStreak + 1;
    const newMaxStreak = Math.max(maxStreak, newStreak);
    const streakBonus = Math.floor((newStreak - 1) * 25);
    const earnedPoints = zonePoints + streakBonus;

    // Play pitch-shifted pop sound
    sfx.playPop(pitchMultiplier + (newStreak - 1) * 0.05);

    // Add floating feedback at click point
    const arenaRect = arenaRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = e.clientX - arenaRect.left;
    const clickY = e.clientY - arenaRect.top;

    setFloatingPoints((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        text: `+${earnedPoints} (${zoneLabel})`,
        reaction: `${reaction}ms`,
        zone,
        streak: newStreak > 2 ? `🔥 ${newStreak}x` : null
      }
    ]);

    const newRecord = { reaction, zone, points: earnedPoints, distRatio: ratio };
    const updatedRecords = [...reactionRecords, newRecord];

    setCurrentHitCount(hitNumber);
    setTotalClicks(newTotalClicks);
    setCurrentStreak(newStreak);
    setMaxStreak(newMaxStreak);
    setReactionRecords(updatedRecords);
    setTotalScoreAcc((prev) => prev + earnedPoints);
    setZoneCounts((prev) => ({ ...prev, [zone]: prev[zone] + 1 }));

    if (hitNumber >= targetCountGoal) {
      // Game Complete
      const totalTimeSec = (now - gameStartTime) / 1000;
      setFinalDuration(totalTimeSec);
      setGameState('gameover');
      sfx.playVictory();

      // Final score calculation
      const avgReaction = Math.round(
        updatedRecords.reduce((a, b) => a + b.reaction, 0) / hitNumber
      );
      const accuracy = Math.round((hitNumber / newTotalClicks) * 100);
      const finalScore = totalScoreAcc + earnedPoints + Math.round(accuracy * 15) - Math.round(avgReaction * 1.2);

      if (finalScore > (bestStats.score || 0)) {
        const newBest = {
          score: Math.max(100, finalScore),
          accuracy,
          avgReaction,
          centerHits: (zoneCounts.center + (zone === 'center' ? 1 : 0))
        };
        setBestStats(newBest);
        try {
          localStorage.setItem('uxco_aim_high_score', JSON.stringify(newBest));
        } catch (err) {}
      }
    } else {
      spawnNextTarget();
    }
  };

  // Arena Miss Handler
  const handleArenaMiss = (e) => {
    if (gameState !== 'playing') return;
    sfx.playMiss();
    setTotalClicks((prev) => prev + 1);
    setCurrentStreak(0);
    setZoneCounts((prev) => ({ ...prev, miss: prev.miss + 1 }));

    const rect = arenaRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setFloatingPoints((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        text: '✕ Miss (Outside)',
        isMiss: true
      }
    ]);
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

  const currentAccuracy = totalClicks > 0
    ? Math.round((currentHitCount / totalClicks) * 100)
    : 100;

  const finalComputedScore = Math.max(
    100,
    totalScoreAcc + Math.round(currentAccuracy * 15) - Math.round(avgReactionTime * 1.2) + (maxStreak * 25)
  );

  // Rank Badge based on Zone Precision & Speed
  const getRankBadge = () => {
    const centerRatio = currentHitCount > 0 ? (zoneCounts.center / currentHitCount) : 0;
    if (currentAccuracy >= 95 && avgReactionTime < 340 && centerRatio >= 0.5) {
      return { rank: 'S+', title: '⚡ Godlike Bullseye Master', color: '#FA7538' };
    }
    if (currentAccuracy >= 90 && avgReactionTime < 420) {
      return { rank: 'A', title: '🎨 Figma Precision Master', color: '#C21356' };
    }
    if (currentAccuracy >= 80 && avgReactionTime < 520) {
      return { rank: 'B', title: '🎯 Pro UI Designer', color: '#D81E6B' };
    }
    return { rank: 'C', title: '✨ Quick Cursor Learner', color: '#E81D88' };
  };

  const rankInfo = getRankBadge();

  // Share score
  const handleShareScore = () => {
    const text = `🎯 UXCO Aim Precision Score: ${finalComputedScore.toLocaleString()} pts | 🎯 ${zoneCounts.center} Bullseyes | ⚡ ${avgReactionTime}ms Reaction | ⏱️ ${finalDuration.toFixed(2)}s Total Time | ${currentAccuracy}% Accuracy! Try it at UX Collective! 🚀`;
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
            <h1 className="fun-main-title">Speed, Precision & 3-Zone Reflex Lab</h1>
            <p className="fun-main-subtitle">
              Targets are divided into 3 zones: <strong>Bullseye (Center)</strong>, <strong>Mid Ring</strong>, and <strong>Outer Edge</strong>. Test how fast and accurate your cursor is!
            </p>
          </div>

          {/* Featured 3D Game Card */}
          <div className="featured-game-card">
            <div className="game-card-mesh-bg" />
            <div className="game-card-content">
              <div className="game-status-badge">
                <Flame size={14} />
                <span>Featured Game • 3-Zone Concentric Tracking</span>
              </div>

              <div className="game-info-row">
                <div>
                  <h2 className="game-title">Sunset 3-Zone Precision Aim Lab</h2>
                  <p className="game-description">
                    Circles pop up dynamically across your screen with <strong>varying sizes</strong>. Every click is tracked down to the pixel: hit the <strong>Bullseye Center</strong> for max score, fast reaction time, and combo multipliers!
                  </p>
                </div>

                {bestStats.score > 0 && (
                  <div className="high-score-chip">
                    <Trophy size={22} color="#FFD700" />
                    <div>
                      <span className="high-score-label">Personal Best</span>
                      <span className="high-score-val">{bestStats.score.toLocaleString()} pts</span>
                      <span className="high-score-sub">{bestStats.avgReaction}ms • {bestStats.accuracy}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3-Zone Scoring Visual Pill Banner */}
              <div className="zone-explainer-banner">
                <div className="zone-explain-item center">
                  <span className="zone-pill center">🎯 Center Bullseye (≤33%)</span>
                  <span className="zone-pts">+300 Pts</span>
                </div>
                <div className="zone-explain-item mid">
                  <span className="zone-pill mid">✨ Mid Ring (34%-66%)</span>
                  <span className="zone-pts">+200 Pts</span>
                </div>
                <div className="zone-explain-item outer">
                  <span className="zone-pill outer">⚡ Outer Edge (67%-100%)</span>
                  <span className="zone-pts">+100 Pts</span>
                </div>
              </div>

              {/* Settings Bar */}
              <div className="game-settings-bar">
                <div className="setting-group">
                  <span className="setting-label">Target Count:</span>
                  <div className="setting-options">
                    {[15, 20, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`setting-btn ${targetCountGoal === num ? 'active' : ''}`}
                        onClick={() => setTargetCountGoal(num)}
                      >
                        {num} Targets
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <span className="setting-label">Circle Sizing:</span>
                  <div className="setting-options">
                    {[
                      { id: 'dynamic', label: '🎲 Dynamic (Random Sizes)' },
                      { id: 'large', label: 'Large (80px)' },
                      { id: 'medium', label: 'Medium (64px)' },
                      { id: 'small', label: 'Small (48px)' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`setting-btn ${sizeMode === opt.id ? 'active' : ''}`}
                        onClick={() => setSizeMode(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
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

                <div className="game-perks-list">
                  <span>⚡ Reaction speed in milliseconds</span>
                  <span>🎯 3-Zone accuracy & radial tracking</span>
                  <span>⏱️ Exact elapsed time</span>
                </div>
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
          2. COUNTDOWN OVERLAY
          ======================================================== */}
      {gameState === 'countdown' && (
        <div className="game-countdown-screen">
          <div className="countdown-content">
            <span className="countdown-subtitle">Get Ready! Aim for the Bullseye...</span>
            <div className="countdown-number-display">{countdownNum}</div>
            <p className="countdown-tip">Tip: Clicking the inner golden core grants 3x points and maximum precision rank!</p>
          </div>
        </div>
      )}

      {/* ========================================================
          3. FULL INTERACTIVE PLAYING ARENA
          ======================================================== */}
      {gameState === 'playing' && (
        <div 
          className="game-arena-screen"
          ref={arenaRef}
          onClick={handleArenaMiss}
        >
          {/* Top Realtime HUD */}
          <div className="arena-hud-bar" onClick={(e) => e.stopPropagation()}>
            <div className="hud-metric">
              <span className="hud-metric-label">Targets</span>
              <span className="hud-metric-val">{currentHitCount} / {targetCountGoal}</span>
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

          {/* Floating Point Indicators (+300 Bullseye / +200 Mid / +100 Outer / Miss) */}
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
          4. END-OF-GAME RESULTS SCREEN (Comprehensive Precision Report)
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

              <h2 className="results-score-title">{finalComputedScore.toLocaleString()} Points</h2>
              <p className="results-congrats-text">
                Cleared {targetCountGoal} targets in <strong>{finalDuration.toFixed(2)}s</strong> with an average reaction time of <strong>{avgReactionTime}ms</strong>.
              </p>

              {/* 3-Zone Accuracy Breakdown Card */}
              <div className="results-zone-breakdown-card">
                <h4 className="zone-breakdown-title">
                  <Target size={16} color="#C21356" />
                  <span>3-Zone Precision Breakdown</span>
                </h4>

                <div className="zone-stats-row">
                  <div className="zone-stat-col center">
                    <span className="zone-stat-pill">🎯 Center (≤33%)</span>
                    <span className="zone-stat-count">{zoneCounts.center} Hits</span>
                    <span className="zone-stat-percent">
                      {currentHitCount > 0 ? Math.round((zoneCounts.center / currentHitCount) * 100) : 0}% of targets
                    </span>
                  </div>

                  <div className="zone-stat-col mid">
                    <span className="zone-stat-pill">✨ Middle (34-66%)</span>
                    <span className="zone-stat-count">{zoneCounts.middle} Hits</span>
                    <span className="zone-stat-percent">
                      {currentHitCount > 0 ? Math.round((zoneCounts.middle / currentHitCount) * 100) : 0}% of targets
                    </span>
                  </div>

                  <div className="zone-stat-col outer">
                    <span className="zone-stat-pill">⚡ Outer (67-100%)</span>
                    <span className="zone-stat-count">{zoneCounts.outer} Hits</span>
                    <span className="zone-stat-percent">
                      {currentHitCount > 0 ? Math.round((zoneCounts.outer / currentHitCount) * 100) : 0}% of targets
                    </span>
                  </div>

                  <div className="zone-stat-col miss">
                    <span className="zone-stat-pill">✕ Misses</span>
                    <span className="zone-stat-count">{zoneCounts.miss} Clicks</span>
                    <span className="zone-stat-percent">Outside Target</span>
                  </div>
                </div>
              </div>

              {/* Speed & Accuracy Summary Grid */}
              <div className="results-metrics-grid">
                <div className="result-stat-box">
                  <div className="stat-box-icon"><Target size={18} color="#C21356" /></div>
                  <span className="stat-box-val">{currentAccuracy}%</span>
                  <span className="stat-box-label">Overall Accuracy ({currentHitCount}/{totalClicks} clicks)</span>
                </div>

                <div className="result-stat-box">
                  <div className="stat-box-icon"><Zap size={18} color="#FA7538" /></div>
                  <span className="stat-box-val">{avgReactionTime} ms</span>
                  <span className="stat-box-label">Avg Speed (Fastest: {fastestReaction}ms)</span>
                </div>

                <div className="result-stat-box">
                  <div className="stat-box-icon"><Clock size={18} color="#D81E6B" /></div>
                  <span className="stat-box-val">{finalDuration.toFixed(2)} s</span>
                  <span className="stat-box-label">Total Elapsed Time</span>
                </div>

                <div className="result-stat-box">
                  <div className="stat-box-icon"><Flame size={18} color="#F59E0B" /></div>
                  <span className="stat-box-val">{maxStreak}</span>
                  <span className="stat-box-label">Max Hit Streak</span>
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
