import React from 'react';
import { Target, Compass, Users, Sparkles } from 'lucide-react';
import ExecutiveShowcase from '../../components/team/ExecutiveShowcase.jsx';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page-wrapper">
      {/* 1. Contained Top Section: Header & Mission Grid */}
      <div className="app-container page-padded" style={{ paddingBottom: '20px' }}>
        <div className="page-header">
          <span className="page-tag">About Us</span>
          <h2 className="page-title">University of Saskatchewan UX Collective</h2>
          <p className="page-subtitle">
            The University of Saskatchewan’s first-ever design club connecting and educating students in product and digital design. 📱✨
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card-title">
              <Target size={22} color="#E81D88" />
              Our Mission & Purpose
            </h3>
            <p className="about-card-text">
              <strong>"Design with purpose, build with empathy."</strong><br />
              UXCO provides a creative platform where student designers, developers, and researchers collaborate on real-world digital experiences. Whether you are interested in Figma prototyping, UX research, usability testing, or front-end engineering, everyone is welcome — no prior experience required!
            </p>
            <ul className="values-list">
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Product & Digital Design:</strong> Hands-on workshops covering design systems, mobile app design, and wireframing.</span>
              </li>
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Campus Tech Collaboration:</strong> Partnering with CSSS, USask Cybersecurity Club, AWS Student Builder Group, and USask Game Dev.</span>
              </li>
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Industry & Career Prep:</strong> Tech internship panels, portfolio critiques, and mentorship opportunities.</span>
              </li>
            </ul>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">
              <Compass size={22} color="#FA9B7A" />
              Community & Campus Hub
            </h3>
            <p className="about-card-text">
              Official student design organization operating under the University of Saskatchewan Students’ Union (USSU):
            </p>
            <ul className="values-list">
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Location:</strong> University of Saskatchewan, Saskatoon, Saskatchewan, Canada.</span>
              </li>
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Official Email:</strong> <code>usaskuxcollective@ussu.ca</code></span>
              </li>
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Community Discord:</strong> Active discussions, design feedback, and workshop notifications.</span>
              </li>
              <li className="values-item">
                <span className="values-bullet" />
                <span><strong>Tech Stack:</strong> Containerized Docker platform with React 18, Node.js Express, and MySQL 8.0.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Full-Width 3D Executive Leadership Showcase Across Laptops & Desktops */}
      <section className="about-fullwidth-team-section">
        <ExecutiveShowcase />
      </section>
    </div>
  );
}
