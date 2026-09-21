import React from 'react';
import { Sparkles, Eye, Layers } from 'lucide-react';
import './GalleryPage.css';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Thorvaldson Hall • Campus Base',
    description: 'Collegiate gothic home to our weekly design jams, workshops, and Figma labs.',
    img: '/thorvaldson_hero.png',
    tag: 'Campus Base'
  },
  {
    id: 2,
    title: 'UXCO Visual Identity',
    description: 'Modern typography, emblem marks, and dynamic sunset gradients crafted for our brand.',
    img: '/logo.jpg',
    tag: 'Brand System'
  },
  {
    id: 3,
    title: 'Design System Palette',
    description: 'Luminous sunset spectrum: Crimson (#C21356), Coral Pink (#D81E6B), and Sunset Orange (#FA7538).',
    img: '/palette.jpg',
    tag: 'Color Study'
  },
  {
    id: 4,
    title: 'Campus Campaign & Poster Art',
    description: 'Promotional posters welcoming USask student designers and creators back to campus.',
    img: '/welcome.jpg',
    tag: 'Poster & Print'
  }
];

export default function GalleryPage() {
  return (
    <div className="gallery-page-wrapper">
      <div className="app-container page-padded">
        {/* Header */}
        <div className="page-header">
          <span className="page-tag">Visual Showcase</span>
          <h1 className="page-title">Campus Moments & Design Work</h1>
          <p className="page-subtitle">
            A curated look into our design sprints, brand systems, and creative campus sessions.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {GALLERY_ITEMS.map((item) => (
            <div key={item.id} className="gallery-card">
              <div className="gallery-img-wrapper">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="gallery-img"
                  onError={(e) => {
                    e.target.src = '/logo.jpg';
                  }}
                />
                <div className="gallery-img-overlay" />
                <span className="gallery-tag-pill">{item.tag}</span>
              </div>
              <div className="gallery-content">
                <h3 className="gallery-title">{item.title}</h3>
                <p className="gallery-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
