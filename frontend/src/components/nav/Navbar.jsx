import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useMagnetic } from '../../lib/motion.jsx';
import './Navbar.css';

// The logo links home; Resources and Get Involved live on the homepage and in the footer.
export const NAV_ITEMS = [
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/fun', label: 'Fun' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const contactRef = useMagnetic(0.25);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the drawer on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock page scroll while the full-screen drawer is open; Escape closes it
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setIsMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  return (
    <>
      <header className={`navbar-wrapper ${isTransparent ? 'navbar-transparent' : 'navbar-solid'} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <nav className="navbar-content" aria-label="Main">
          <Link to="/" className="brand-section" viewTransition title="UX Collective home">
            <div className="brand-uxco-badge" aria-hidden="true">
              <span>UX</span>
              <span>CO</span>
            </div>
            <div className="brand-text-block">
              <span className="brand-title">UX Collective</span>
              <span className="brand-subtitle">University of Saskatchewan</span>
            </div>
          </Link>
  
          <div className="nav-right-container">
            <div className="nav-links">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  viewTransition
                  className={`nav-btn ${isActive(item.path) ? 'active-box' : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
            <Link
              ref={contactRef}
              to="/contact"
              viewTransition
              className={`nav-contact-cta magnetic ${isActive('/contact') ? 'is-active' : ''}`}
            >
              Contact
              <ArrowUpRight size={15} />
            </Link>
          </div>
  
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      <div id="mobile-drawer" className={`mobile-drawer ${isMobileMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMobileMenuOpen}>
        <div className="mobile-nav-links">
          {[...NAV_ITEMS, { path: '/contact', label: 'Contact' }].map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-btn ${isActive(item.path) ? 'active-box' : ''}`}
              style={{ '--i': i }}
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              <span className="mobile-nav-index">0{i + 1}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
