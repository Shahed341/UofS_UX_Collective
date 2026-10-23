/**
 * UX Collective — frontend/src/pages/about/AboutPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import { Target, Users, Sparkles, Compass, ArrowUpRight } from 'lucide-react';
import ExecutiveShowcase from '../../components/team/ExecutiveShowcase.jsx';
import { Reveal, SplitText, TiltCard } from '../../lib/motion.jsx';
import { useSite } from '../../lib/site.jsx';
import './AboutPage.css';

export default function AboutPage() {
  const { stats, discordInvite } = useSite();

  return (
    <div className="about-page-wrapper">
      {/* 1. Header & Concise 3D Pillar Cards */}
      <div className="app-container page-padded" style={{ paddingBottom: '16px' }}>
        <div className="about-header-block">
          <SplitText
            as="h1"
            className="about-lead-heading"
            stagger={28}
            text={`The University of Saskatchewan’s first student-led product & digital design community, educating and connecting creators since ${stats.foundedYear}.`}
          />
        </div>

        {/* 3D Pillars Grid with Sunset Palette & Minimal Text */}
        <div className="about-pillars-grid">
          {/* Card 1: Mission (3D Crimson Card) */}
          <Reveal variant="flip" delay={0}><TiltCard className="about-pillar-card pillar-crimson">
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
          </TiltCard></Reveal>

          {/* Card 2: Community (3D Sunset Coral/Orange Card) */}
          <Reveal variant="flip" delay={120}><TiltCard className="about-pillar-card pillar-coral">
            <div className="pillar-icon-box">
              <Users size={22} color="#FFFFFF" />
            </div>
            <h3 className="pillar-title">Inclusive Community</h3>
            <p className="pillar-text">
              100% open to all USask students across Computer Science, Design, Business, Arts, and Engineering. Zero prior experience needed to join.
            </p>
            <div className="pillar-chips">
              <span className="pillar-chip">🤝 {stats.members}+ Members</span>
              <span className="pillar-chip">📍 USask Saskatoon</span>
              <span className="pillar-chip">🏛️ USSU Ratified</span>
            </div>
          </TiltCard></Reveal>

          {/* Card 3: Collaborations (3D Sunset Amber Card) */}
          <Reveal variant="flip" delay={240}><TiltCard className="about-pillar-card pillar-amber">
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
          </TiltCard></Reveal>
        </div>

        {/* Quick Sunset Stats Banner */}
        <Reveal variant="up" className="about-quick-banner">
          <div className="quick-banner-item">
            <span className="quick-banner-val">{stats.foundedYear}</span>
            <span className="quick-banner-lbl">Founded</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <span className="quick-banner-val">{stats.members}+</span>
            <span className="quick-banner-lbl">Discord Members</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <span className="quick-banner-val">100%</span>
            <span className="quick-banner-lbl">Free to Join</span>
          </div>
          <div className="quick-banner-sep" />
          <div className="quick-banner-item">
            <a 
              href={discordInvite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="quick-banner-link"
            >
              <span>Join on Discord</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </Reveal>
      </div>

      {/* 2. Full-Width 3D Executive Leadership Showcase */}
      <section className="about-fullwidth-team-section">
        <ExecutiveShowcase />
      </section>
    </div>
  );
}
