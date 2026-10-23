import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { SplitText, useMagnetic, prefersReducedMotion } from '../../lib/motion.jsx';
import { useSite } from '../../lib/site.jsx';
import { formatDate } from '../../lib/dates.js';

// Petal positions of the stylised USask wheat sheaf, top to bottom.
const PETALS = [
  { x: 210, y: 92, r: 0 },
  { x: 138, y: 218, r: -44 },
  { x: 282, y: 218, r: 44 },
  { x: 138, y: 332, r: -44 },
  { x: 282, y: 332, r: 44 },
  { x: 138, y: 446, r: -44 },
  { x: 282, y: 446, r: 44 },
];

/**
 * USask Wheat Sheaf Leaf SVG Component
 * Each petal flies in from a scattered position and settles into the sheaf.
 */
function UsaskWheatLeaf({ className = '', size = 360 }) {
  return (
    <svg
      viewBox="0 0 420 540"
      className={className}
      width={size}
      height={size * (540 / 420)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="University of Saskatchewan wheat sheaf"
    >
      <defs>
        {/* Reusable pointed leaf petal with organic contour */}
        <path id="usask-leaf-petal" d="M 0,-62 C 34,-31 34,31 0,62 C -34,31 -34,-31 0,-62 Z" fill="#FFFFFF" />
      </defs>

      {PETALS.map((petal, i) => (
        <g key={i} className="leaf-petal" style={{ '--i': i, '--from-x': `${(i % 2 ? 1 : -1) * (60 + i * 18)}px`, '--from-r': `${(i % 2 ? 1 : -1) * 90}deg` }}>
          <use href="#usask-leaf-petal" transform={`translate(${petal.x}, ${petal.y}) rotate(${petal.r})`} />
        </g>
      ))}
    </svg>
  );
}

export default function HeroSection({ nextEvent }) {
  const sectionRef = useRef(null);
  const joinRef = useMagnetic(0.3);
  const { discordInvite } = useSite();

  // Leaf and glow drift toward the cursor
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return undefined;
    let frame;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--px', px.toFixed(3));
        el.style.setProperty('--py', py.toFixed(3));
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-usask-section">
      {/* Dynamic Luminous Sunset Glow Overlay */}
      <div className="hero-mesh-background" />
      <div className="hero-glow-orb" aria-hidden="true" />

      <div className="hero-content-wrapper">
        {/* Left Column: Title, Subtitle, Join CTA */}
        <div className="hero-text-column">
          {nextEvent && (
            <Link to={`/events/${nextEvent.slug}`} className="hero-next-chip">
              <span className="hero-next-dot" />
              <span className="hero-next-label">Next up</span>
              <span className="hero-next-title">{nextEvent.title}</span>
              <span className="hero-next-date">{formatDate(nextEvent.start_at, { weekday: false, year: false, short: true })}</span>
            </Link>
          )}

          <h1 className="hero-brand-title">
            <SplitText text="U of S UX" startDelay={150} stagger={90} />
            <br />
            <SplitText text="Collective" startDelay={420} />
          </h1>

          <p className="hero-brand-description">
            USask’s first ever product design club.<br className="hero-desc-br" />
            Educating and connecting students in<br className="hero-desc-br" />
            product design since 2022.
          </p>

          <div className="hero-cta-row">
            <a
              ref={joinRef}
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-join-link magnetic"
              title="Join U of S UX Collective on Discord"
            >
              <span>Join us</span>
              <svg className="hero-arrow-icon" viewBox="0 0 38 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 10H34M34 10L24 2M34 10L24 18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <Link to="/events" className="hero-secondary-link">See upcoming events</Link>
          </div>
        </div>

        {/* Right Column: Iconic USask Wheat Leaf Graphic */}
        <div className="hero-graphic-column">
          <div className="hero-leaf-container">
            <UsaskWheatLeaf className="hero-wheat-svg" size={360} />
          </div>
        </div>
      </div>

      <a href="#about-uxco" className="hero-scroll-cue" aria-label="Scroll to learn more">
        <ChevronDown size={22} />
      </a>
    </section>
  );
}
