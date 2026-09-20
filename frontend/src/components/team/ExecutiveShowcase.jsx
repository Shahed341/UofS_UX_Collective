import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import './ExecutiveShowcase.css';

import shahedImg from '../../Images/Executive_team/Md Shahed, Web Developer.jpg';
import kateImg from '../../Images/Executive_team/Kate Wright, Social Media Director.jpg';
import ninaImg from '../../Images/Executive_team/Nina Sproule, Vice President.jpg';
import palimaImg from '../../Images/Executive_team/Palima Shrestha, President.jpg';
import jasonImg from '../../Images/Executive_team/Jason Monette, Treasurer.jpg';
import ayodejiImg from '../../Images/Executive_team/Ayodeji Daramola, Events & Communications Director.jpg';
import trushankImg from '../../Images/Executive_team/Trushank Lakdawala, Upper Year Representative.jpg';

const EXECUTIVES = [
  {
    id: 'shahed',
    name: 'Md Shahed',
    pronouns: 'he/him',
    role: 'Web Developer',
    major: '4th Year Computer Science',
    fact: 'Loves to film his life like a documentary! 🎥🎬',
    img: shahedImg
  },
  {
    id: 'kate',
    name: 'Kate Wright',
    pronouns: 'she/her',
    role: 'Social Media Director',
    major: '4th Year Interactive Systems Design',
    fact: 'Designed the 2026 Nuit Blanche Saskatoon brand identity! 🎨🌃',
    img: kateImg
  },
  {
    id: 'nina',
    name: 'Nina Sproule',
    pronouns: 'she/her',
    role: 'Vice President',
    major: '4th Year Interactive Systems Design',
    fact: 'Has over 3,000 hours in Solitaire! 🃏🕐',
    img: ninaImg
  },
  {
    id: 'palima',
    name: 'Palima Shrestha',
    pronouns: 'she/her',
    role: 'President',
    major: '4th Year Interactive Systems Design',
    fact: 'Hiked to Machu Picchu this year! 🥾⛰️',
    img: palimaImg,
    isPresident: true
  },
  {
    id: 'jason',
    name: 'Jason Monette',
    pronouns: 'he/him',
    role: 'Treasurer',
    major: '4th Year Software Engineering',
    fact: 'Used to be a competitive dancer! 🕺',
    img: jasonImg
  },
  {
    id: 'ayodeji',
    name: 'Ayodeji Daramola',
    pronouns: 'he/him',
    role: 'Events & Communications Director',
    major: '3rd Year Computer Science',
    fact: 'Enjoys photography and graphic design in his free time! 📸🎨',
    img: ayodejiImg
  },
  {
    id: 'trushank',
    name: 'Trushank Lakdawala',
    pronouns: 'he/him',
    role: 'Upper Year Representative',
    major: '4th Year Computer Science',
    fact: 'Niche TikTok celebrity! 📱⭐',
    img: trushankImg
  }
];

export default function ExecutiveShowcase() {
  // Center President by default (index 3)
  const [activeIndex, setActiveIndex] = useState(3);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const effectiveIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const currentExec = EXECUTIVES[effectiveIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : EXECUTIVES.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < EXECUTIVES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="exec-showcase-wrapper">
      {/* Dynamic Header Info */}
      <div className="exec-header-block">
        <div className="exec-badge-pill">
          <Sparkles size={14} color="#E81D88" />
          <span>2026/27 Executive Leadership</span>
        </div>

        <h3 className="exec-active-name">{currentExec.name}</h3>
        <p className="exec-active-role">
          <span className="exec-role-highlight">{currentExec.role}</span>
          <span className="exec-role-sep">•</span>
          <span>{currentExec.major}</span>
          <span className="exec-pronouns-tag">({currentExec.pronouns})</span>
        </p>

        <div className="exec-active-fact">
          <span>✨ <strong>Fun Fact:</strong> {currentExec.fact}</span>
        </div>
      </div>

      {/* 3D Curved Perspective Cards Track */}
      <div className="exec-carousel-stage">
        <div className="exec-cards-container">
          {EXECUTIVES.map((exec, idx) => {
            const diff = idx - effectiveIndex;
            const absDiff = Math.abs(diff);
            const isCenter = diff === 0;

            // Calculate 3D perspective rotation and scale
            let rotateY = 0;
            let scale = 1;
            let zIndex = 20 - absDiff;
            let opacity = 1;

            if (isCenter) {
              rotateY = 0;
              scale = 1.16;
              zIndex = 30;
              opacity = 1;
            } else if (diff < 0) {
              // Left side cards: smooth arc rotation inwards
              rotateY = Math.min(30, 14 + absDiff * 5.5);
              scale = Math.max(0.82, 1 - absDiff * 0.055);
              opacity = Math.max(0.74, 1 - absDiff * 0.08);
            } else {
              // Right side cards: smooth arc rotation inwards
              rotateY = -Math.min(30, 14 + absDiff * 5.5);
              scale = Math.max(0.82, 1 - absDiff * 0.055);
              opacity = Math.max(0.74, 1 - absDiff * 0.08);
            }

            return (
              <div
                key={exec.id}
                className={`exec-3d-card ${isCenter ? 'is-focused' : 'is-side'}`}
                style={{
                  transform: `perspective(1400px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setActiveIndex(idx)}
                title={`${exec.name} — ${exec.role}`}
              >
                <div className="exec-card-inner">
                  <img
                    src={exec.img}
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
          {EXECUTIVES.map((exec, idx) => (
            <button
              key={exec.id}
              className={`exec-dot ${idx === effectiveIndex ? 'active' : ''}`}
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
