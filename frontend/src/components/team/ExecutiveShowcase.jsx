/**
 * UX Collective — frontend/src/components/team/ExecutiveShowcase.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../../lib/api.js';
import { prefersReducedMotion } from '../../lib/motion.jsx';
import './ExecutiveShowcase.css';

const ROTATE_MS = 4500;

export default function ExecutiveShowcase() {
  const { data: executives = [] } = useApi('/api/team', { initial: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Start centred on the club lead (president) once the team loads
  useEffect(() => {
    const lead = executives.findIndex((e) => e.is_lead);
    setActiveIndex(lead >= 0 ? lead : Math.floor(executives.length / 2));
  }, [executives]);

  // Auto-rotate slowly enough to read the fun fact; pauses on hover/focus and for reduced motion
  useEffect(() => {
    if (isPaused || executives.length < 2 || prefersReducedMotion()) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev < executives.length - 1 ? prev + 1 : 0));
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [isPaused, executives.length]);

  const currentExec = executives[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : executives.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < executives.length - 1 ? prev + 1 : 0));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  if (!currentExec) return null;

  return (
    <div
      className="exec-showcase-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Executive team"
    >
      {/* Dynamic Header Info */}
      <div className="exec-header-block" aria-live="polite">
        <h3 className="exec-active-name">{currentExec.name}</h3>
        <p className="exec-active-role">
          <span className="exec-role-highlight">{currentExec.role}</span>
          <span className="exec-role-sep">•</span>
          {currentExec.major && <span>{currentExec.major}</span>}
          {currentExec.pronouns && <span className="exec-pronouns-tag">({currentExec.pronouns})</span>}
        </p>

        {currentExec.fact && (
          <div className="exec-active-fact" key={currentExec.id}>
            <span>✨ <strong>Fun Fact:</strong> {currentExec.fact}</span>
          </div>
        )}
      </div>

      {/* 3D Curved Perspective Cards Track with Infinite Circular Wrap */}
      <div 
        className="exec-carousel-stage"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="exec-cards-container">
          {executives.map((exec, idx) => {
            // Shortest circular wrap-around distance relative to activeIndex
            const total = executives.length;
            let diff = idx - activeIndex;
            const half = Math.floor(total / 2);
            while (diff > half) diff -= total;
            while (diff < -half) diff += total;

            const absDiff = Math.abs(diff);
            const isCenter = diff === 0;
            const flexOrder = diff + half; // Visual order with center card always in middle

            // Calculate 3D perspective rotation and scale
            let rotateY = 0;
            let scale = 1;
            let zIndex = 25 - absDiff * 2;
            let opacity = 1;

            if (isCenter) {
              rotateY = 0;
              scale = 1.28; // Prominent large selected card
              zIndex = 40;
              opacity = 1;
            } else if (diff < 0) {
              // Left side cards: smooth arc rotation inwards
              rotateY = Math.min(32, 14 + absDiff * 5.5);
              scale = Math.max(0.72, 0.9 - absDiff * 0.06);
              opacity = Math.max(0.62, 1 - absDiff * 0.1);
            } else {
              // Right side cards: smooth arc rotation inwards
              rotateY = -Math.min(32, 14 + absDiff * 5.5);
              scale = Math.max(0.72, 0.9 - absDiff * 0.06);
              opacity = Math.max(0.62, 1 - absDiff * 0.1);
            }

            let distanceClass = 'is-side';
            if (isCenter) distanceClass = 'is-focused';
            else if (absDiff === 2) distanceClass = 'is-outer';
            else if (absDiff >= 3) distanceClass = 'is-far-outer';

            return (
              <div
                key={exec.id}
                className={`exec-3d-card ${distanceClass}`}
                style={{
                  order: flexOrder,
                  transform: `perspective(1400px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                }}
                onClick={() => setActiveIndex(idx)}
                title={`${exec.name} — ${exec.role}`}
              >
                <div className="exec-card-inner">
                  <img
                    src={exec.image_url || '/logo.jpg'}
                    alt={`${exec.name} - ${exec.role}`}
                    className="exec-card-image"
                    loading="lazy"
                  />
                  <div className="exec-card-glass-glow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circular Nav Controls & Position Dots */}
      <div className="exec-controls-row">
        <button 
          className="exec-nav-arrow-btn prev"
          onClick={handlePrev}
          aria-label="Previous Executive"
          title="Previous Executive"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="exec-pagination-dots">
          {executives.map((exec, idx) => (
            <button
              key={exec.id}
              className={`exec-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Select ${exec.name}`}
              title={`${exec.name} (${exec.role})`}
            />
          ))}
        </div>

        <button 
          className="exec-nav-arrow-btn next"
          onClick={handleNext}
          aria-label="Next Executive"
          title="Next Executive"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
