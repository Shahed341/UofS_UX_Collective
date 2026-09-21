import React, { useEffect, useRef } from 'react';

export default function BinaryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track obstacles relative to current viewport in real-time
    let obstacles = [];

    const getObstacleSelectors = () => [
      '.event-card',
      '.home-gallery-card',
      '.comment-card',
      '.cal-main-card',
      '.inspector-prior-card',
      '.inspector-main-card',
      '.prior-chip-btn',
      '.about-pillar-card',
      '.about-quick-banner',
      '.events-partners-ribbon',
      '.events-filter-btn',
      '.gallery-card',
      '.contact-3d-hub',
      '.contact-channel-pill',
      '.contact-form-card',
      '.btn-primary',
      '.btn-secondary',
      '.btn-cal',
      '.cal-today-btn',
      '.cal-nav-btn',
      '.exec-3d-card',
      '.exec-nav-arrow-btn',
      '.footer-icon-btn',
      '.hero-join-link',
      '.collab-link',
      '.faq-pill-btn',
      '.about-3d-red-card',
      '.about-collage-photo',
      '.about-3d-readmore-btn',
    ];

    const updateObstacles = () => {
      const elements = document.querySelectorAll(getObstacleSelectors().join(', '));
      const newObs = [];
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        // Keep elements in or near viewport
        if (rect.width > 20 && rect.height > 15 && rect.bottom > -50 && rect.top < height + 50) {
          const isButton = 
            el.tagName === 'BUTTON' || 
            el.tagName === 'A' ||
            el.classList.contains('btn-hero-primary') || 
            el.classList.contains('btn-hero-secondary') || 
            el.classList.contains('btn-hero-discord') || 
            el.classList.contains('btn-primary') || 
            el.classList.contains('btn-secondary') ||
            el.classList.contains('btn-cal') ||
            el.classList.contains('btn-ping');

          newObs.push({
            id: index,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            isButton,
          });
        }
      });
      obstacles = newObs;
    };

    // High DPI Canvas resize handler
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      updateObstacles();
    };

    updateSize();

    // Mouse interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 130,
      isActive: false,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', updateObstacles, { passive: true });

    // UXCO Brand Colors
    const paletteColors = [
      { r: 232, g: 29, b: 136, a: 0.5 },  // Primary Pink
      { r: 244, g: 111, b: 194, a: 0.45 }, // Medium Pink
      { r: 250, g: 155, b: 122, a: 0.5 },  // Orange-Coral
      { r: 51, g: 51, b: 51, a: 0.65 },    // Deep Grey Accent
      { r: 100, g: 100, b: 100, a: 0.4 },  // Medium Grey
      { r: 160, g: 160, b: 160, a: 0.25 }, // Subtle Grey
      { r: 200, g: 200, b: 200, a: 0.18 }, // Light Tint
    ];

    const columnWidth = 22;
    const charHeight = 16;
    const fontSize = 14;
    const PILE_LIFETIME_MS = 10000; // 10 seconds before slipping behind box
    const FLOOR_PILE_LIFETIME_MS = 20000; // 20 seconds before bottom tower digits disappear
    const MAX_STACK_PER_COL = 7;
    const MAX_FLOOR_STACK = 8; // Max tower height at bottom

    let particles = [];

    const createParticle = (colIndex, startY = null, layer = 'interactive') => {
      const colX = colIndex * columnWidth + columnWidth / 2;
      const colorObj = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      return {
        colIndex,
        colX,
        x: colX,
        y: startY !== null ? startY : -20 - Math.random() * 80,
        targetX: colX,
        targetY: null,
        vx: 0,
        vy: 0,
        speed: 0.38 + Math.random() * 0.42,
        char: Math.random() > 0.5 ? '1' : '0',
        color: colorObj,
        weight: Math.random() > 0.6 ? '700' : '500',
        flipTimer: 50 + Math.floor(Math.random() * 100),
        state: 'falling', // 'falling' | 'stacked' | 'falling_behind' | 'stacked_bottom'
        settledAt: null,
        obsId: null,
        relX: 0, // Relative X offset inside the obstacle box
        stackIndex: 0, // Vertical position in pile/tower
        ignoreObsId: null,
        layer,
      };
    };

    const initParticles = () => {
      const columnsCount = Math.ceil(width / columnWidth) + 1;
      particles = [];
      for (let c = 0; c < columnsCount; c++) {
        particles.push(createParticle(c, Math.random() * height, 'interactive'));
        particles.push(createParticle(c, Math.random() * (height / 2), 'interactive'));
        particles.push(createParticle(c, Math.random() * height, 'ambient'));
        if (Math.random() > 0.4) {
          particles.push(createParticle(c, (height / 2) + Math.random() * (height / 2), 'ambient'));
        }
      }
    };

    initParticles();

    // Re-anchor and reconcile particles on window resize
    const handleResize = () => {
      updateSize();
      const currentCols = Math.ceil(width / columnWidth) + 1;

      // Filter out-of-bounds particles
      particles = particles.filter((p) => p.x <= width + 50 && p.colIndex <= currentCols + 1);

      // Re-anchor stacked particles to obstacle's new bounding box / floor
      particles.forEach((p) => {
        // Recalculate colX based on column width
        p.colX = p.colIndex * columnWidth + columnWidth / 2;

        if (p.state === 'stacked' && p.obsId !== null) {
          const obs = obstacles.find((o) => o.id === p.obsId);
          if (obs) {
            p.targetX = obs.left + p.relX;
            p.targetY = obs.top - 4 - p.stackIndex * charHeight;
            // Snap position to prevent floating off-screen
            p.x = p.targetX;
            p.y = p.targetY;
          } else {
            // Obstacle vanished or shifted offscreen, resume falling
            p.state = 'falling';
            p.obsId = null;
            p.settledAt = null;
          }
        } else if (p.state === 'stacked_bottom') {
          p.targetX = p.colX;
          p.targetY = height - 16 - p.stackIndex * charHeight;
          p.x = p.targetX;
          p.y = p.targetY;
        }
      });

      // Refill ambient streams if window widened
      while (particles.length < currentCols * 3.5) {
        const randomCol = Math.floor(Math.random() * currentCols);
        particles.push(createParticle(randomCol, Math.random() * height, 'ambient'));
      }
    };

    window.addEventListener('resize', handleResize);
    const obsInterval = setInterval(updateObstacles, 800);

    // Animation Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();
      const stackCounters = new Map();
      const floorStackCounters = new Map();

      // Pre-calculate existing floor towers per column
      for (let j = 0; j < particles.length; j++) {
        const pt = particles[j];
        if (pt.state === 'stacked_bottom') {
          const cur = floorStackCounters.get(pt.colIndex) || 0;
          floorStackCounters.set(pt.colIndex, Math.max(cur, pt.stackIndex + 1));
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Character flipping (0 <-> 1)
        p.flipTimer--;
        if (p.flipTimer <= 0) {
          p.char = p.char === '1' ? '0' : '1';
          p.flipTimer = 60 + Math.floor(Math.random() * 120);
        }

        // Mouse distraction physics
        if (mouse.isActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 2.2;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force * 0.7;
          }
        }

        // --- STATE: STACKED AT BOTTOM OF SCREEN (FOOTER TOWER) ---
        if (p.state === 'stacked_bottom') {
          const age = now - p.settledAt;

          // Stay for 20 seconds before disappearing
          if (age >= FLOOR_PILE_LIFETIME_MS) {
            particles.splice(i, 1);
            i--;
            continue;
          }

          // Maintain bottom tower position
          p.targetX = p.colX;
          p.targetY = height - 16 - p.stackIndex * charHeight;

          // Physics spring to maintain tower brick position
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.88;
          p.vy *= 0.88;
          p.x += (p.targetX - p.x) * 0.16;
          p.y += (p.targetY - p.y) * 0.16;

          // Smooth fade-out in final 2.5 seconds of the 20s duration
          let alpha = p.color.a;
          const fadeWindow = 2500;
          if (age > FLOOR_PILE_LIFETIME_MS - fadeWindow) {
            const remainingRatio = (FLOOR_PILE_LIFETIME_MS - age) / fadeWindow;
            alpha = p.color.a * Math.max(0, Math.min(1, remainingRatio));
          }

          // Draw stacked floor tower digit
          ctx.font = `${p.weight} ${fontSize}px 'Plus Jakarta Sans', 'Roboto Mono', monospace`;
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(p.char, p.x, p.y);
          continue;
        }

        // --- STATE: STACKED ON TOP OF A BOX / CARD ---
        if (p.state === 'stacked') {
          const obs = obstacles.find((o) => o.id === p.obsId);
          const age = now - p.settledAt;

          // If obstacle is gone (e.g. page navigated / layout changed), fall down
          if (!obs) {
            p.state = 'falling';
            p.obsId = null;
            p.settledAt = null;
          } else if (age >= PILE_LIFETIME_MS) {
            // AFTER 10s: Slip behind the box and continue raining to bottom!
            p.state = 'falling_behind';
            p.ignoreObsId = p.obsId;
            p.obsId = null;
            p.settledAt = null;
            p.speed = 0.35 + Math.random() * 0.4;
            p.vx = (Math.random() - 0.5) * 0.3;
          } else {
            // Dynamically recalculate target position from live obstacle box
            p.targetX = obs.left + p.relX;
            p.targetY = obs.top - 4 - p.stackIndex * charHeight;

            // Physics spring to maintain position attached to the box
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.88;
            p.vy *= 0.88;
            p.x += (p.targetX - p.x) * 0.15;
            p.y += (p.targetY - p.y) * 0.15;

            const key = `${p.colIndex}_${p.obsId}`;
            const curCount = stackCounters.get(key) || 0;
            stackCounters.set(key, curCount + 1);

            // Draw stacked number
            ctx.font = `${p.weight} ${fontSize}px 'Plus Jakarta Sans', 'Roboto Mono', monospace`;
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
            ctx.textAlign = 'center';
            ctx.fillText(p.char, p.x, p.y);
            continue;
          }
        }

        // --- STATE: FALLING (AND FALLING BEHIND BOX TO BOTTOM) ---
        p.x += p.vx;
        p.y += p.speed + p.vy;
        p.vx *= 0.94; // slight bounce conservation
        p.vy *= 0.94;

        // Steer x gently towards column slot
        p.x += (p.colX - p.x) * 0.025;

        // Clear ignore lock once particle has moved past the obstacle bounds
        if (p.ignoreObsId !== null) {
          const pastObs = obstacles.find((o) => o.id === p.ignoreObsId);
          if (
            !pastObs || 
            p.y > pastObs.bottom + 14 || 
            p.y < pastObs.top - 25 || 
            p.x < pastObs.left - 25 || 
            p.x > pastObs.right + 25
          ) {
            p.ignoreObsId = null;
            if (p.state === 'falling_behind') {
              p.state = 'falling';
            }
          }
        }

        // Check landing & corner bouncing collision for interactive particles
        if (p.state === 'falling' && p.layer === 'interactive') {
          for (let o = 0; o < obstacles.length; o++) {
            const obs = obstacles[o];
            if (obs.id === p.ignoreObsId) continue;

            const isButton = obs.isButton;
            const cornerWidth = Math.min(26, Math.max(12, obs.width * 0.22));

            // A. TOP BOUNDARY COLLISION & CORNER BOUNCE
            if (p.y >= obs.top - 6 && p.y <= obs.top + 12) {
              // 1. LEFT CORNER BOUNCE: Bounces outward to the left & slightly upwards
              if (p.x >= obs.left - 10 && p.x <= obs.left + cornerWidth) {
                p.vx = - (1.5 + Math.random() * 1.8);
                p.vy = - (1.1 + Math.random() * 1.4);
                p.ignoreObsId = obs.id;
                p.char = p.char === '1' ? '0' : '1'; // subtle digit flip on bounce
                break;
              }

              // 2. RIGHT CORNER BOUNCE: Bounces outward to the right & slightly upwards
              if (p.x >= obs.right - cornerWidth && p.x <= obs.right + 10) {
                p.vx = (1.5 + Math.random() * 1.8);
                p.vy = - (1.1 + Math.random() * 1.4);
                p.ignoreObsId = obs.id;
                p.char = p.char === '1' ? '0' : '1';
                break;
              }

              // 3. CENTER FLAT IMPACT
              if (p.x > obs.left + cornerWidth && p.x < obs.right - cornerWidth) {
                if (isButton) {
                  // Buttons: playful light bounce off the top
                  p.vy = - (0.9 + Math.random() * 1.1);
                  p.vx = (Math.random() - 0.5) * 1.4;
                  p.ignoreObsId = obs.id;
                  p.char = p.char === '1' ? '0' : '1';
                  break;
                } else {
                  // Boxes & Cards: Stack on top with slight landing dampening
                  const key = `${p.colIndex}_${obs.id}`;
                  const currentStack = stackCounters.get(key) || 0;

                  if (currentStack < MAX_STACK_PER_COL) {
                    const landingY = obs.top - 4 - currentStack * charHeight;
                    if (p.y >= landingY && p.y <= landingY + 14) {
                      p.state = 'stacked';
                      p.obsId = obs.id;
                      p.relX = Math.max(8, Math.min(obs.width - 8, p.x - obs.left));
                      p.stackIndex = currentStack;
                      p.targetX = obs.left + p.relX;
                      p.targetY = landingY;
                      p.y = landingY;
                      p.vy = -0.4;
                      p.settledAt = now;
                      stackCounters.set(key, currentStack + 1);

                      // Spawn replacement particle at top
                      particles.push(createParticle(p.colIndex, null, 'interactive'));
                      break;
                    }
                  }
                }
              }
            }

            // B. SIDE EDGES DEFLECTION BOUNCE (while falling beside boxes & buttons)
            if (p.y > obs.top + 4 && p.y < obs.bottom) {
              if (p.x >= obs.left - 6 && p.x <= obs.left + 3) {
                p.vx = - (1.2 + Math.random() * 1.2);
                p.ignoreObsId = obs.id;
                p.char = p.char === '1' ? '0' : '1';
                break;
              }
              if (p.x >= obs.right - 3 && p.x <= obs.right + 6) {
                p.vx = (1.2 + Math.random() * 1.2);
                p.ignoreObsId = obs.id;
                p.char = p.char === '1' ? '0' : '1';
                break;
              }
            }
          }
        }

        // --- BOTTOM FLOOR / FOOTER TOWER STACKING COLLISION ---
        if (p.state === 'falling' && (p.layer === 'interactive' || Math.random() > 0.5)) {
          const curFloorCount = floorStackCounters.get(p.colIndex) || 0;
          if (curFloorCount < MAX_FLOOR_STACK) {
            const floorLandingY = height - 16 - curFloorCount * charHeight;
            if (p.y >= floorLandingY - 8 && p.y <= floorLandingY + 14) {
              p.state = 'stacked_bottom';
              p.settledAt = now;
              p.stackIndex = curFloorCount;
              p.targetX = p.colX;
              p.targetY = floorLandingY;
              p.x = p.colX;
              p.y = floorLandingY;
              p.vy = -0.3; // soft landing dampener
              floorStackCounters.set(p.colIndex, curFloorCount + 1);

              // Spawn replacement falling particle from the top
              particles.push(createParticle(p.colIndex, null, p.layer));

              // Draw settled bottom digit
              ctx.font = `${p.weight} ${fontSize}px 'Plus Jakarta Sans', 'Roboto Mono', monospace`;
              ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
              ctx.textAlign = 'center';
              ctx.fillText(p.char, p.x, p.y);
              continue;
            }
          }
        }

        // Recycle when falling past bottom of screen
        if (p.y > height + 30) {
          const maxAllowed = Math.ceil(width / columnWidth) * 4.5;
          if (particles.length > maxAllowed) {
            particles.splice(i, 1);
            i--;
            continue;
          } else {
            particles[i] = createParticle(p.colIndex, null, p.layer);
            continue;
          }
        }

        // Draw falling number
        ctx.font = `${p.weight} ${fontSize}px 'Plus Jakarta Sans', 'Roboto Mono', monospace`;
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
        ctx.textAlign = 'center';
        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(obsInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateObstacles);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#FFFFFF',
      }}
      aria-hidden="true"
    />
  );
}
