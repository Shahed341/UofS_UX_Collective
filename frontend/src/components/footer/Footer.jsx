import React from 'react';
import { Mail, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

function DiscordIcon({ size = 20, color = 'currentColor' }) {
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
      <div className="footer-mesh-overlay" />

      <div className="footer-content-container">
        {/* Left / Center Column: Brand, 3-Line About, Social Icons */}
        <div className="footer-main-col">
          <div className="footer-brand-header">
            <div className="brand-uxco-badge footer-uxco-badge">
              <span>UX</span>
              <span>CO</span>
            </div>
            <div>
              <h3 className="footer-title">UX Collective</h3>
              <p className="footer-subtitle">University of Saskatchewan</p>
            </div>
          </div>

          <p className="footer-about-3lines">
            The University of Saskatchewan’s first-ever design club connecting and educating students in product & digital design.
            We foster human-centered experiences through hands-on workshops, design sprints, and tech mentorship.
            A ratified USSU student organization open to all students across campus.
          </p>

          <div className="footer-contact-icons-row">
            <a 
              href="https://www.instagram.com/uofs_uxcollective/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn instagram"
              title="Follow us on Instagram: @uofs_uxcollective"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a 
              href="https://www.linkedin.com/company/uofs-ux-collective/posts/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn linkedin"
              title="Connect on LinkedIn: UX Collective"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>

            <a 
              href="https://discord.gg/Fx7BUvzdzT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn discord"
              title="Join Community Discord"
              aria-label="Discord"
            >
              <DiscordIcon size={20} />
            </a>

            <a 
              href="mailto:usaskuxcollective@ussu.ca" 
              className="footer-icon-btn email"
              title="Email us: usaskuxcollective@ussu.ca"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Right Column: Our Collaborators */}
        <div className="footer-collaborators-col">
          <h4 className="footer-collaborators-title">Our Collaborators</h4>
          <ul className="footer-collaborators-list">
            <li>
              <a 
                href="https://csss.usask.ca/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="collab-link collab-underline"
                title="Computer Science Student Society"
              >
                CSSS
              </a>
            </li>
            <li>
              <a 
                href="https://zu.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="collab-link collab-underline"
                title="zu - Product Design & Strategy Agency"
              >
                zu
              </a>
            </li>
            <li>
              <a 
                href="https://ussu.ca/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="collab-link collab-italic"
                title="University of Saskatchewan Students' Union"
              >
                USSU
              </a>
            </li>
            <li>
              <a 
                href="mailto:usaskuxcollective@ussu.ca?subject=Collaboration%20Inquiry%20with%20UXCO" 
                className="collab-link collab-italic"
                title="Partner or Collaborate with UX Collective"
              >
                Company Here
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright-text">
          © {currentYear} University of Saskatchewan UX Collective • USSU Ratified Club
        </p>
      </div>
    </footer>
  );
}
