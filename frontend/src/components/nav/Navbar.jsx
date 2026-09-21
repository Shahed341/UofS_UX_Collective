import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/events', label: 'Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
  ];

  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  return (
    <header className={`navbar-wrapper ${isTransparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      <nav className="navbar-content">
        {/* Left Side: Brand Logo acts as Main Page (Homepage) Link */}
        <Link 
          to="/"
          className="brand-section" 
          onClick={() => setIsMobileMenuOpen(false)}
          title="Return to Main Page"
        >
          <div className="brand-uxco-badge">
            <span>UX</span>
            <span>CO</span>
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title">UX Collective</h1>
            <p className="brand-subtitle">University of Saskatchewan</p>
          </div>
        </Link>

        {/* Right Side: Desktop Nav Links */}
        <div className="nav-right-container">
          <div className="nav-links">
            {navItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-btn ${isSelected ? 'active-box' : ''}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Hamburger 3-Bar Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-nav-links">
            {navItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-btn ${isSelected ? 'active-box' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

