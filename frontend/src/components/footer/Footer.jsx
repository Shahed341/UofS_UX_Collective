import React from 'react';
import { MapPin, Mail, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import './Footer.css';

function DiscordIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        {/* Col 1: Brand, Motto & Location */}
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

          <p className="footer-motto-text">
            Connecting and educating students in product & digital design across USask.
          </p>

          <div className="footer-location-row">
            <MapPin size={15} color="#E81D88" style={{ flexShrink: 0 }} />
            <span>Thorvaldson Building • Saskatoon, SK</span>
          </div>

          {/* Quick Social Icon Row */}
          <div className="footer-social-icons-row">
            <a 
              href="https://www.instagram.com/uofs_uxcollective/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn instagram"
              title="Follow us on Instagram"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>

            <a 
              href="https://www.linkedin.com/company/uofs-ux-collective/posts/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn linkedin"
              title="Connect on LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>

            <a 
              href="https://discord.gg/Fx7BUvzdzT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn discord"
              title="Join Community Discord"
              aria-label="Discord"
            >
              <DiscordIcon size={18} />
            </a>

            <a 
              href="mailto:usaskuxcollective@ussu.ca" 
              className="footer-icon-btn email"
              title="Send us an Email"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Col 2: Social & Contact Channels */}
        <div className="footer-connect-col">
          <h4 className="footer-col-title">Connect With Us</h4>
          <ul className="footer-links-list">
            <li>
              <a 
                href="https://www.instagram.com/uofs_uxcollective/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link-item social-link-insta"
              >
                <Instagram size={16} color="#E1306C" />
                <span>Instagram</span>
                <ExternalLink size={12} className="footer-link-ext" />
              </a>
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/company/uofs-ux-collective/posts/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link-item social-link-linkedin"
              >
                <Linkedin size={16} color="#0A66C2" />
                <span>LinkedIn</span>
                <ExternalLink size={12} className="footer-link-ext" />
              </a>
            </li>
            <li>
              <a 
                href="https://discord.gg/Fx7BUvzdzT" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link-item social-link-discord"
              >
                <DiscordIcon size={16} color="#5865F2" />
                <span>Discord Server</span>
                <ExternalLink size={12} className="footer-link-ext" />
              </a>
            </li>
            <li>
              <a 
                href="mailto:usaskuxcollective@ussu.ca" 
                className="footer-link-item"
              >
                <Mail size={16} color="#FA9B7A" />
                <span>usaskuxcollective@ussu.ca</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div>
          © {currentYear} University of Saskatchewan UX Collective • USSU Ratified Club
        </div>
        <div>
          Containerized with React 18 • Node.js Express • MySQL 8.0
        </div>
      </div>
    </footer>
  );
}
