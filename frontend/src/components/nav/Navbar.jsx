import React, { useState } from 'react';
import { Info, Calendar, Image, Mail, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activePage, setActivePage, isConnected }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-content">
        {/* Left Side: Brand Logo acts as Main Page (Homepage) Button */}
        <div 
          className="brand-section" 
          onClick={() => handleNavClick('homepage')}
          role="button"
          tabIndex={0}
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
        </div>

        {/* Right Side: Desktop Nav Links */}
        <div className="nav-right-container">
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-btn ${isSelected ? 'active-box' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
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
              const isSelected = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`mobile-nav-btn ${isSelected ? 'active-box' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
