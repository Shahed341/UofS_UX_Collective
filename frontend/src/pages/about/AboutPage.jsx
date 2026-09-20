import React from 'react';
import { Target, Compass, Users, Sparkles } from 'lucide-react';
import './AboutPage.css';

const EXEC_TEAM = [
  {
    num: '1/7',
    name: 'Palima Shrestha',
    pronouns: 'she/her',
    role: 'President',
    major: '4th Year Interactive Systems Design',
    fact: 'Hiked to Machu Picchu this year! 🥾⛰️'
  },
  {
    num: '2/7',
    name: 'Nina Sproule',
    pronouns: 'she/her',
    role: 'Vice President',
    major: '4th Year Interactive Systems Design',
    fact: 'Has over 3,000 hours in Solitaire! 🃏🕐'
  },
  {
    num: '3/7',
    name: 'Jason Monette',
    pronouns: 'he/him',
    role: 'Treasurer',
    major: '4th Year Software Engineering',
    fact: 'Used to be a competitive dancer! 🕺'
  },
  {
    num: '4/7',
    name: 'Ayodeji Daramola',
    pronouns: 'he/him',
    role: 'Events & Communications Director',
    major: '3rd Year Computer Science',
    fact: 'Enjoys photography and graphic design in his free time! 📸🎨'
  },
  {
    num: '5/7',
    name: 'Kate Wright',
    pronouns: 'she/her',
    role: 'Social Media Director',
    major: '4th Year Interactive Systems Design',
    fact: 'Designed the 2026 Nuit Blanche Saskatoon brand identity this summer! 🎨🌃'
  },
  {
    num: '6/7',
    name: 'Md Shahed',
    pronouns: 'he/him',
    role: 'Web Developer',
    major: '4th Year Computer Science',
    fact: 'Loves to film his life like a documentary! 🎥🎬'
  },
  {
    num: '7/7',
    name: 'Trushank Lakdawala',
    pronouns: 'he/him',
    role: 'Upper Year Representative',
    major: '4th Year Computer Science',
    fact: 'Niche TikTok celebrity! 📱⭐'
  }
];

export default function AboutPage() {
  return (
    <div className="about-page">
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

      {/* 2026/27 Executive Team (Text Only) */}
      <div className="team-section">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="page-tag">Leadership</span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-dark)' }}>
            2026/27 Executive Team 🧑‍💻
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Meet the team leading the University of Saskatchewan UX Collective this school year.
          </p>
        </div>

        <div className="team-grid">
          {EXEC_TEAM.map((member) => (
            <div key={member.name} className="team-card">
              <div>
                <div className="team-card-header">
                  <span className="team-role-tag">{member.role}</span>
                  <span className="team-number-badge">({member.num})</span>
                </div>
                <h4 className="team-name">
                  {member.name}
                  <span className="team-pronouns">({member.pronouns})</span>
                </h4>
                <p className="team-major">🎓 {member.major}</p>
              </div>

              <div className="team-fact-box">
                <strong>✨ Fun Fact:</strong> {member.fact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
