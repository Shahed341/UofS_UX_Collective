import React, { useEffect, useRef } from 'react';

/*
 * Falling 0/1 "binary rain" behind the page. Digits land and stack on cards, bounce off
 * buttons and corners, pile up at the bottom of the screen and scatter away from the cursor.
 *
 * Performance notes (keeps it smooth on phones, 4K monitors and 144 Hz screens):
 * - Physics is time-based, so speed is the same at any refresh rate.
 * - Glyphs are pre-rendered sprites drawn with drawImage instead of fillText.
 * - Card positions are measured in page coordinates on a timer / resize, never during scroll;
 *   each frame just offsets them by the current scroll position (no layout reads per frame).
 * - Pixel ratio is capped, density adapts to screen size, and the loop pauses in hidden tabs.
 */

const OBSTACLE_SELECTORS = [
  '[data-obstacle]',
  '.event-ticket-row', '.spotlight-ticket-inner', '.event-principle-card', '.track-pill-btn',
  '.ticket-cal-button', '.spotlight-cal-btn', '.cal-main-card', '.inspector-main-card', '.inspector-prior-card',
  '.inspector-next-card', '.about-pillar-card', '.about-quick-banner', '.about-3d-red-card', '.about-collage-photo',
  '.about-3d-readmore-btn', '.gallery-card', '.contact-3d-hub', '.contact-channel-pill', '.contact-form-card',
  '.btn-primary', '.btn-secondary', '.cal-today-btn', '.cal-nav-btn', '.exec-3d-card', '.exec-nav-arrow-btn',
  '.footer-icon-btn', '.hero-join-link', '.collab-link', '.faq-pill-btn', '.archive-card', '.resource-card',
  '.role-card', '.game-card', '.stat-item', '.ev-row', '.subscribe-menu-btn',
].join(', ');

const BUTTON_CLASSES = ['btn-primary', 'btn-secondary', 'hero-join-link', 'track-pill-btn', 'faq-pill-btn'];

// UXCO palette, softened for a subtle background
const PALETTE = [
  [232, 29, 136, 0.32],
  [244, 111, 194, 0.28],
  [250, 155, 122, 0.30],
  [51, 51, 51, 0.35],
  [100, 100, 100, 0.24],
  [160, 160, 160, 0.16],
  [200, 200, 200, 0.12],
];

const CHAR_HEIGHT = 16;
const FONT_SIZE = 13.5;
const PILE_LIFETIME_MS = 10000;
const FLOOR_LIFETIME_MS = 20000;
const FLOOR_FADE_MS = 2500;
const MAX_STACK_PER_COL = 7;
const MAX_FLOOR_STACK = 8;
const MAX_DPR = 2;

// Wider columns on small screens keep phones light and uncluttered.
const columnWidthFor = (w) => (w < 480 ? 32 : w < 900 ? 28 : 25);

// Pre-render every glyph/colour/weight combination once per pixel ratio.
function buildSprites(dpr) {
  const sprites = {};
  const size = Math.ceil(CHAR_HEIGHT * dpr);
  for (const char of ['0', '1']) {
    for (const weight of ['500', '700']) {
      PALETTE.forEach(([r, g, b, a], ci) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.scale(dpr, dpr);
        cx.font = `${weight} ${FONT_SIZE}px 'Plus Jakarta Sans', 'Roboto Mono', monospace`;
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        cx.fillText(char, CHAR_HEIGHT / 2, CHAR_HEIGHT / 2);
        sprites[`${char}${weight}${ci}`] = c;
      });
    }
  }
  return sprites;
}

export default function BinaryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let columnWidth = 25;
    let sprites = {};
    let particles = [];
    let obstacles = [];
    let obstacleMap = new Map();
    let measuredScrollY = 0;
    let frameId = null;
    let lastTime = performance.now();

    const pointer = { x: -1000, y: -1000, active: false, radius: 130 };

    // ---------- Obstacles ----------

    let nextObstacleId = 1;
    const elementIds = new WeakMap();

    const measureObstacles = () => {
      measuredScrollY = window.scrollY;
      const list = [];
      document.querySelectorAll(OBSTACLE_SELECTORS).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 15) return;
        // Only keep elements within a couple of screens of the viewport
        if (rect.bottom < -height || rect.top > height * 2) return;
        if (!elementIds.has(el)) elementIds.set(el, nextObstacleId++);
        list.push({
          id: elementIds.get(el),
          left: rect.left,
          right: rect.right,
          top: rect.top + measuredScrollY,
          bottom: rect.bottom + measuredScrollY,
          width: rect.width,
          isButton: el.tagName === 'BUTTON' || el.tagName === 'A' || BUTTON_CLASSES.some((c) => el.classList.contains(c)),
        });
      });
      obstacles = list;
      obstacleMap = new Map(list.map((o) => [o.id, o]));
    };

    let measureTimer = null;
    const scheduleMeasure = (delay = 120) => {
      clearTimeout(measureTimer);
      measureTimer = setTimeout(measureObstacles, delay);
    };

    // ---------- Particles ----------

    const createParticle = (colIndex, startY = null, layer = 'interactive') => {
      const colX = colIndex * columnWidth + columnWidth / 2;
      return {
        colIndex,
        colX,
        x: colX,
        y: startY ?? -20 - Math.random() * 80,
        targetX: colX,
        targetY: 0,
        vx: 0,
        vy: 0,
        speed: 0.38 + Math.random() * 0.42,
        char: Math.random() > 0.5 ? '1' : '0',
        color: Math.floor(Math.random() * PALETTE.length),
        weight: Math.random() > 0.6 ? '700' : '500',
        flipIn: 800 + Math.random() * 1600,
        state: 'falling', // falling | stacked | behind | floor
        settledAt: 0,
        obsId: null,
        relX: 0,
        stackIndex: 0,
        ignoreObsId: null,
        layer,
      };
    };

    const columnsCount = () => Math.ceil(width / columnWidth) + 1;
    // Fewer particles per column on short/small screens
    const perColumn = () => (height < 700 ? 2.4 : 3.2);

    const seedParticles = () => {
      particles = [];
      const cols = columnsCount();
      for (let c = 0; c < cols; c++) {
        particles.push(createParticle(c, Math.random() * height, 'interactive'));
        particles.push(createParticle(c, Math.random() * height, 'ambient'));
        if (Math.random() < perColumn() - 2) {
          particles.push(createParticle(c, Math.random() * height, Math.random() > 0.5 ? 'interactive' : 'ambient'));
        }
      }
    };

    // ---------- Sizing ----------

    const resize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const widthChanged = newWidth !== width;

      if (newDpr !== dpr || !sprites['05000']) sprites = buildSprites(newDpr);
      dpr = newDpr;
      width = newWidth;
      height = newHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Height-only changes (mobile address bar showing/hiding) keep the current particles.
      if (widthChanged) {
        const oldColumnWidth = columnWidth;
        columnWidth = columnWidthFor(width);
        const cols = columnsCount();
        if (particles.length === 0 || oldColumnWidth !== columnWidth) {
          seedParticles();
        } else {
          particles = particles.filter((p) => p.colIndex < cols);
          const target = Math.round(cols * perColumn());
          while (particles.length < target) {
            particles.push(createParticle(Math.floor(Math.random() * cols), Math.random() * height, 'ambient'));
          }
        }
      }
      measureObstacles();
    };

    // ---------- Drawing ----------

    const draw = (p, alpha = 1) => {
      const sprite = sprites[`${p.char}${p.weight}${p.color}`];
      if (!sprite) return;
      if (alpha < 1) ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, p.x - CHAR_HEIGHT / 2, p.y - CHAR_HEIGHT / 2 - 4, CHAR_HEIGHT, CHAR_HEIGHT);
      if (alpha < 1) ctx.globalAlpha = 1;
    };

    const clear = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    };

    const flip = (p) => {
      p.char = p.char === '1' ? '0' : '1';
    };

    // ---------- Simulation step ----------

    const step = (dt, now) => {
      const k = dt / 16.667; // 1.0 at 60 fps
      const damp88 = Math.pow(0.88, k);
      const damp94 = Math.pow(0.94, k);
      const spring = 1 - Math.pow(1 - 0.15, k);
      const steer = 1 - Math.pow(1 - 0.025, k);
      // Obstacles are stored in page coordinates; convert with the live scroll position
      const scrollY = window.scrollY;
      const viewTop = (o) => o.top - scrollY;

      const stackCounts = new Map();
      const floorCounts = new Map();
      for (const p of particles) {
        if (p.state === 'floor') {
          floorCounts.set(p.colIndex, Math.max(floorCounts.get(p.colIndex) || 0, p.stackIndex + 1));
        }
      }

      const spawned = [];
      const maxParticles = Math.ceil(columnsCount() * (perColumn() + 0.8));

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.flipIn -= dt;
        if (p.flipIn <= 0) {
          flip(p);
          p.flipIn = 1000 + Math.random() * 2000;
        }

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < pointer.radius * pointer.radius && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / pointer.radius) * 2.2 * k;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force * 0.7;
          }
        }

        // Settled at the bottom of the screen
        if (p.state === 'floor') {
          const age = now - p.settledAt;
          if (age >= FLOOR_LIFETIME_MS) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
            i--;
            continue;
          }
          p.targetX = p.colX;
          p.targetY = height - 16 - p.stackIndex * CHAR_HEIGHT;
          p.x += p.vx * k;
          p.y += p.vy * k;
          p.vx *= damp88;
          p.vy *= damp88;
          p.x += (p.targetX - p.x) * spring;
          p.y += (p.targetY - p.y) * spring;
          const remaining = FLOOR_LIFETIME_MS - age;
          draw(p, remaining < FLOOR_FADE_MS ? remaining / FLOOR_FADE_MS : 1);
          continue;
        }

        // Stacked on a card
        if (p.state === 'stacked') {
          const obs = obstacleMap.get(p.obsId);
          if (!obs) {
            p.state = 'falling';
            p.obsId = null;
          } else if (now - p.settledAt >= PILE_LIFETIME_MS) {
            p.state = 'behind';
            p.ignoreObsId = p.obsId;
            p.obsId = null;
            p.speed = 0.35 + Math.random() * 0.4;
            p.vx = (Math.random() - 0.5) * 0.3;
          } else {
            p.targetX = obs.left + p.relX;
            p.targetY = viewTop(obs) - 4 - p.stackIndex * CHAR_HEIGHT;
            p.x += p.vx * k;
            p.y += p.vy * k;
            p.vx *= damp88;
            p.vy *= damp88;
            // Follow the card tightly while scrolling, softly otherwise
            p.x += (p.targetX - p.x) * spring;
            p.y = Math.abs(p.targetY - p.y) > 40 ? p.targetY : p.y + (p.targetY - p.y) * spring;
            const key = `${p.colIndex}_${p.obsId}`;
            stackCounts.set(key, (stackCounts.get(key) || 0) + 1);
            draw(p);
            continue;
          }
        }

        // Falling (or slipping behind a card)
        p.x += p.vx * k;
        p.y += (p.speed + p.vy) * k;
        p.vx *= damp94;
        p.vy *= damp94;
        p.x += (p.colX - p.x) * steer;

        if (p.ignoreObsId !== null) {
          const past = obstacleMap.get(p.ignoreObsId);
          const top = past ? viewTop(past) : 0;
          if (!past || p.y > top + (past.bottom - past.top) + 14 || p.y < top - 25 || p.x < past.left - 25 || p.x > past.right + 25) {
            p.ignoreObsId = null;
            if (p.state === 'behind') p.state = 'falling';
          }
        }

        if (p.state === 'falling' && p.layer === 'interactive') {
          for (let o = 0; o < obstacles.length; o++) {
            const obs = obstacles[o];
            if (obs.id === p.ignoreObsId) continue;
            const top = viewTop(obs);
            const bottom = top + (obs.bottom - obs.top);
            if (p.y < top - 6 || p.y > bottom) continue;
            const corner = Math.min(26, Math.max(12, obs.width * 0.22));

            if (p.y <= top + 12) {
              if (p.x >= obs.left - 10 && p.x <= obs.left + corner) {
                p.vx = -(1.5 + Math.random() * 1.8);
                p.vy = -(1.1 + Math.random() * 1.4);
                p.ignoreObsId = obs.id;
                flip(p);
                break;
              }
              if (p.x >= obs.right - corner && p.x <= obs.right + 10) {
                p.vx = 1.5 + Math.random() * 1.8;
                p.vy = -(1.1 + Math.random() * 1.4);
                p.ignoreObsId = obs.id;
                flip(p);
                break;
              }
              if (p.x > obs.left + corner && p.x < obs.right - corner) {
                if (obs.isButton) {
                  p.vy = -(0.9 + Math.random() * 1.1);
                  p.vx = (Math.random() - 0.5) * 1.4;
                  p.ignoreObsId = obs.id;
                  flip(p);
                  break;
                }
                const key = `${p.colIndex}_${obs.id}`;
                const count = stackCounts.get(key) || 0;
                if (count < MAX_STACK_PER_COL) {
                  const landingY = top - 4 - count * CHAR_HEIGHT;
                  if (p.y >= landingY && p.y <= landingY + 14) {
                    p.state = 'stacked';
                    p.obsId = obs.id;
                    p.relX = Math.max(8, Math.min(obs.width - 8, p.x - obs.left));
                    p.stackIndex = count;
                    p.y = landingY;
                    p.vy = -0.4;
                    p.settledAt = now;
                    stackCounts.set(key, count + 1);
                    if (particles.length + spawned.length < maxParticles) spawned.push(createParticle(p.colIndex));
                    break;
                  }
                }
              }
            }

            if (p.y > top + 4) {
              if (p.x >= obs.left - 6 && p.x <= obs.left + 3) {
                p.vx = -(1.2 + Math.random() * 1.2);
                p.ignoreObsId = obs.id;
                flip(p);
                break;
              }
              if (p.x >= obs.right - 3 && p.x <= obs.right + 6) {
                p.vx = 1.2 + Math.random() * 1.2;
                p.ignoreObsId = obs.id;
                flip(p);
                break;
              }
            }
          }
        }

        if (p.state === 'falling' && (p.layer === 'interactive' || p.colIndex % 2 === 0)) {
          const count = floorCounts.get(p.colIndex) || 0;
          if (count < MAX_FLOOR_STACK) {
            const floorY = height - 16 - count * CHAR_HEIGHT;
            if (p.y >= floorY - 8 && p.y <= floorY + 14) {
              p.state = 'floor';
              p.settledAt = now;
              p.stackIndex = count;
              p.x = p.colX;
              p.y = floorY;
              p.vy = -0.3;
              floorCounts.set(p.colIndex, count + 1);
              if (particles.length + spawned.length < maxParticles) spawned.push(createParticle(p.colIndex, null, p.layer));
              draw(p);
              continue;
            }
          }
        }

        if (p.y > height + 30) {
          particles[i] = createParticle(p.colIndex, null, p.layer);
          continue;
        }

        draw(p);
      }

      if (spawned.length) particles.push(...spawned);

      // Keep every column fed so the rain never thins out
      const minParticles = Math.round(columnsCount() * perColumn());
      while (particles.length < minParticles) {
        particles.push(createParticle(Math.floor(Math.random() * columnsCount()), null, 'ambient'));
      }
    };

    // ---------- Loop ----------

    const loop = (time) => {
      const dt = Math.min(48, time - lastTime); // clamp after tab switches / long frames
      lastTime = time;
      clear();
      step(dt, Date.now());
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frameId !== null || reducedMotion) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    // ---------- Events ----------

    let resizeFrame = null;
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        resize();
        if (reducedMotion) renderStatic();
      });
    };
    const onPointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.radius = e.pointerType === 'touch' ? 90 : 130;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onScroll = () => scheduleMeasure(150);
    const onVisibility = () => (document.hidden ? stop() : start());

    // Static frame for visitors who prefer reduced motion
    const renderStatic = () => {
      clear();
      for (const p of particles) draw(p);
    };

    resize();
    // Sprites may have been drawn with a fallback font; redraw once Plus Jakarta Sans has loaded
    document.fonts?.ready.then(() => {
      sprites = buildSprites(dpr);
      if (reducedMotion) renderStatic();
    });
    if (reducedMotion) {
      renderStatic();
    } else {
      start();
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    // Re-measure when the page layout changes (route changes, images loading, accordions)
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => scheduleMeasure(200)) : null;
    resizeObserver?.observe(document.body);
    const measureInterval = setInterval(() => {
      if (!document.hidden) measureObstacles();
    }, 2000);

    return () => {
      stop();
      clearTimeout(measureTimer);
      clearInterval(measureInterval);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="binary-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#FFFFFF',
      }}
      aria-hidden="true"
    />
  );
}
