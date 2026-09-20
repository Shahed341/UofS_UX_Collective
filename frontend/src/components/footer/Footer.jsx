import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        {/* Col 1: Logo & Small About */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <img 
              src="/logo.jpg" 
              alt="UX Collective Logo" 
              className="footer-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h3 className="footer-title">UX Collective</h3>
              <p className="footer-subtitle">University of Saskatchewan</p>
            </div>
          </div>

          <p className="footer-about-text">
            The University of Saskatchewan’s first-ever design club connecting and educating students in product & digital design. Ratified USSU student organization fostering inclusive, human-centered digital experiences across campus.
          </p>

          <div className="footer-address-box">
            <MapPin size={16} color="#E81D88" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>
              Thorvaldson Building, University of Saskatchewan<br />
              110 Science Place, Saskatoon, SK S7N 5C9, Canada
            </span>
          </div>
        </div>

        {/* Col 2: Quick Navigation */}
        <div>
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/" className="footer-link-item">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="footer-link-item">
                About Us & Executive Team
              </Link>
            </li>
            <li>
              <Link to="/events" className="footer-link-item">
                Upcoming Events & Sprints
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="footer-link-item">
                Visual Gallery & Showcase
              </Link>
            </li>
            <li>
              <Link to="/contact" className="footer-link-item">
                Contact & Inquiries
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Community & Socials */}
        <div>
          <h4 className="footer-col-title">Community & Contact</h4>
          <ul className="footer-links-list">
            <li>
              <a 
                href="mailto:usaskuxcollective@ussu.ca" 
                className="footer-link-item"
              >
                <Mail size={15} color="#FA9B7A" />
                <span>usaskuxcollective@ussu.ca</span>
              </a>
            </li>
            <li>
              <a 
                href="https://discord.gg/Fx7BUvzdzT" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link-item"
                style={{ color: '#5865F2' }}
              >
                <MessageSquare size={15} />
                <span>Join Official Discord Server</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/company/uofs-ux-collective/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link-item"
                style={{ color: '#0A66C2' }}
              >
                <span>LinkedIn Community Page</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>

          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>
            <strong>Ratified Student Club:</strong> USSU recognized student organization for the 2026/27 academic year.
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div>
          © {new Date().getFullYear()} University of Saskatchewan UX Collective. All rights reserved.
        </div>
        <div>
          Containerized with React 18 • Node.js Express • MySQL 8.0 in Docker
        </div>
      </div>
    </footer>
  );
}
