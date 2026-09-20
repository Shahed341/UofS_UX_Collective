import React from 'react';
import { ArrowRight, Sparkles, Database, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onScrollToPipeline }) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-pill">
          <Sparkles size={14} /> Full Stack Connected
        </div>
        <h2 className="hero-title">
          Empowering human-centered <span className="gradient-text">design & code</span>
        </h2>
        <p className="hero-description">
          The official digital hub for the University of Saskatchewan UX Collective.
          Containerized with React frontend, Node.js API backend, and high-performance MySQL database.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={onScrollToPipeline}>
            Inspect Live Stack <ArrowRight size={16} />
          </button>
          <a 
            href="#events" 
            className="btn-secondary"
          >
            Explore Events & DB Rows
          </a>
        </div>
      </div>

      <div className="hero-image-card">
        <img 
          src="/welcome.jpg" 
          alt="UXCO Welcome Graphic" 
          className="hero-preview-img"
          onError={(e) => {
            // fallback if graphic is unavailable
            e.target.style.display = 'none';
          }} 
        />
      </div>
    </section>
  );
}
