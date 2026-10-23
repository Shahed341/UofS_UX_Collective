import React from 'react';
import { Reveal, SplitText } from '../../lib/motion.jsx';
import './PageHero.css';

// Standard animated header for inner pages: eyebrow, word-by-word title, lead text and optional actions.
export default function PageHero({ eyebrow, icon, title, lead, children, align = 'center' }) {
  return (
    <header className={`page-hero align-${align}`}>
      <div className="page-hero-blob blob-a" aria-hidden="true" />
      <div className="page-hero-blob blob-b" aria-hidden="true" />
      {eyebrow && (
        <Reveal variant="down" className="page-hero-eyebrow">
          {icon}
          <span>{eyebrow}</span>
        </Reveal>
      )}
      <SplitText as="h1" className="page-hero-title" text={title} startDelay={120} />
      {lead && (
        <Reveal as="p" variant="blur" delay={380} className="page-hero-lead">
          {lead}
        </Reveal>
      )}
      {children && (
        <Reveal variant="up" delay={520} className="page-hero-actions">
          {children}
        </Reveal>
      )}
    </header>
  );
}
