import React from 'react';
import { MessageSquare } from 'lucide-react';
import heroImage from '../../Images/UofS_UX.png_Collective_Hero_Image.png';

export default function HeroSection() {
  return (
    <section className="hero-fullscreen">
      <img 
        src={heroImage} 
        alt="Thorvaldson Building - University of Saskatchewan Campus" 
        className="hero-fullscreen-img"
      />
      <div className="hero-fullscreen-scrim" />
      
      <div className="hero-fullscreen-content">
        <h1 className="hero-fullscreen-title">
          Connecting & educating students in<br />
          <span className="hero-gradient-text">product & digital design</span>
        </h1>

        <div className="hero-fullscreen-actions">
          <a
            href="https://discord.gg/Fx7BUvzdzT"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-hero-primary"
          >
            <MessageSquare size={18} /> Join Discord
          </a>
        </div>
      </div>
    </section>
  );
}
