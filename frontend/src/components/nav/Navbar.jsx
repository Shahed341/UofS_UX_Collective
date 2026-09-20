import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, Calendar, Image, Mail, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ isConnected }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/about', label: 'About', icon: Info },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-content">
        {/* Left Side: Brand Logo acts as Main Page (Homepage) Link */}
        <Link 
          to="/"
          className="brand-section" 
          onClick={() => setIsMobileMenuOpen(false)}
          title="Return to Main Page"
        >
          <img 
            src="/logo.jpg" 
            alt="UX Collective Logo" 
            className="logo-img" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 className="brand-title">UX Collective</h1>
            <p className="brand-subtitle">University of Saskatchewan</p>
          </div>
        </Link>

        {/* Right Side: Desktop Nav Links */}
        <div className="nav-right-container">
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-btn ${isSelected ? 'active-box' : ''}`}
                >
                  <Icon size={15} />
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
              const Icon = item.icon;
              const isSelected = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-btn ${isSelected ? 'active-box' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={18} />
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

