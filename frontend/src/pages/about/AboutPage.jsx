import React from 'react';
import { Target, Users, Sparkles, Compass, ArrowUpRight } from 'lucide-react';
import ExecutiveShowcase from '../../components/team/ExecutiveShowcase.jsx';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page-wrapper">
      {/* 1. Header & Concise 3D Pillar Cards */}
      <div className="app-container page-padded" style={{ paddingBottom: '16px' }}>
        <div className="page-header">
          <span className="page-tag">About UXCO</span>
          <h1 className="page-title">Design with Purpose. Build with Empathy.</h1>
          <p className="page-subtitle">
            The University of Saskatchewan’s first student-led product & digital design community, educating and connecting creators since 2022.
          </p>
        </div>

        {/* 3D Pillars Grid with Sunset Palette & Minimal Text */}
        <div className="about-pillars-grid">
          {/* Card 1: Mission (3D Crimson Card) */}
          <div className="about-pillar-card pillar-crimson">
            <div className="pillar-icon-box">
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <h3 className="pillar-title">Our Mission</h3>
            <p className="pillar-text">
              Empowering USask students to turn creative ideas into polished digital products through hands-on design sprints, Figma prototyping, and mentorship.
            </p>
            <div className="pillar-chips">
              <span className="pillar-chip">✨ UI/UX Design</span>
              <span className="pillar-chip">🎨 Figma Sprints</span>
              <span className="pillar-chip">🚀 Portfolio Prep</span>
            </div>
          </div>

          {/* Card 2: Community (3D Sunset Coral/Orange Card) */}
          <div className="about-pillar-card pillar-coral">
            <div className="pillar-icon-box">
              <Users size={22} color="#FFFFFF" />
            </div>
            <h3 className="pillar-title">Inclusive Community</h3>
            <p className="pillar-text">
              100% open to all USask students across Computer Science, Design, Business, Arts, and Engineering. Zero prior experience needed to join.
            </p>
            <div className="pillar-chips">
              <span className="pillar-chip">🤝 300+ Members</span>
              <span className="pillar-chip">📍 USask Saskatoon</span>
              <span className="pillar-chip">🏛️ USSU Ratified</span>
            </div>
          </div>

          {/* Card 3: Collaborations (3D Sunset Amber Card) */}
          <div className="about-pillar-card pillar-amber">
            <div className="pillar-icon-box">
              <Compass size={22} color="#FFFFFF" />
            </div>
            <h3 className="pillar-title">Campus Partners</h3>
            <p className="pillar-text">
              Partnered with CSSS, USask Cybersecurity, AWS Builders, and USask Game Dev to host multi-club tech hackathons and industry networking mixers.
            </p>
            <div className="pillar-chips">
              <span className="pillar-chip">⚡ CSSS & zu</span>
              <span className="pillar-chip">🛡️ Cyber Club</span>
              <span className="pillar-chip">🎮 Game Dev</span>
            </div>
          </div>
        </div>

        {/* Quick Sunset Stats Banner */}
        <div className="about-quick-banner">
          <div className="quick-banner-item">
            <span className="quick-banner-val">2022</span>
            <span className="quick-banner-lbl">Founded</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <span className="quick-banner-val">300+</span>
            <span className="quick-banner-lbl">Active Members</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <span className="quick-banner-val">100%</span>
            <span className="quick-banner-lbl">Free to Join</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <a 
              href="https://discord.gg/Fx7BUvzdzT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="quick-banner-link"
            >
              <span>Join on Discord</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Full-Width 3D Executive Leadership Showcase */}
      <section className="about-fullwidth-team-section">
        <ExecutiveShowcase />
      </section>
    </div>
  );
}
