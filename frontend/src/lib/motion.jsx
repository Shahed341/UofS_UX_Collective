import React, { useEffect, useRef, useState } from 'react';

// Shared motion helpers. Every effect is skipped when the visitor prefers reduced motion,
// and pointer effects are skipped on touch devices.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

// One observer for every <Reveal>, instead of one per element.
let revealObserver = null;
function observeReveal(el) {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
  }
  revealObserver.observe(el);
  return () => revealObserver?.unobserve(el);
}

/**
 * Fades/slides children in when they scroll into view.
 * variant: 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'flip'
 */
export function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }
    return observeReveal(el);
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Splits text into words that rise in one after another.
export function SplitText({ text, as: Tag = 'span', className = '', stagger = 55, startDelay = 0 }) {
  const words = String(text).split(' ');
  return (
    <Tag className={`split-text ${className}`}>
      {words.map((word, i) => (
        <span className="split-word-mask" key={`${word}-${i}`}>
          <span className="split-word" style={{ '--word-delay': `${startDelay + i * stagger}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

// Counts from 0 to `target` once the returned ref scrolls into view.
export function useCountUp(target, { duration = 1600 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const end = Number(target) || 0;
    if (!el) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setValue(end);
      return undefined;
    }
    if (started.current) {
      setValue(end);
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      started.current = true;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setValue(Math.round(end * eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return [ref, value];
}

// Element gently follows the cursor while hovered.
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return undefined;

    let frame;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return ref;
}

// 3D tilt toward the cursor; also sets --glow-x/--glow-y for a cursor-following highlight.
export function useTilt(maxDeg = 8) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return undefined;

    let frame;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--glow-x', `${px * 100}%`);
        el.style.setProperty('--glow-y', `${py * 100}%`);
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * maxDeg}deg) rotateY(${(px - 0.5) * maxDeg}deg) translateY(-4px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };

    el.classList.add('tilt-enabled');
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.classList.remove('tilt-enabled');
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [maxDeg]);

  return ref;
}

// Wrapper component version of useTilt for lists.
export function TiltCard({ as: Tag = 'div', className = '', maxDeg = 8, children, ...rest }) {
  const ref = useTilt(maxDeg);
  return (
    <Tag ref={ref} className={`tilt-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Scroll progress (0–1) of an element through the viewport, for parallax.
export function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    let frame;
    const update = () => {
      frame = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setProgress(Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return [ref, progress];
}
