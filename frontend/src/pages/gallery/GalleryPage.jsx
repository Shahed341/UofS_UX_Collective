import React from 'react';
import './GalleryPage.css';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Thorvaldson Hall • Collective Base',
    description: 'The iconic collegiate gothic Thorvaldson Building at the University of Saskatchewan campus, home to our design meetups, workshops, and lab sessions.',
    img: '/thorvaldson_hero.png',
    tag: 'Campus Base'
  },
  {
    id: 2,
    title: 'UXCO Brand Identity & Visual System',
    description: 'The core aesthetic guidelines, logomarks, and gradient motifs developed for University of Saskatchewan UX Collective.',
    img: '/logo.jpg',
    tag: 'Identity'
  },
  {
    id: 3,
    title: 'Official Design System Color Palette',
    description: 'Harmonious palette: Deep Pink (#E81D88), Medium Pink (#F46FC2), Coral Pink (#FB8AA2), Orange-Coral (#FA9B7A), and Peach (#FDCEA1).',
    img: '/palette.jpg',
    tag: 'Design System'
  },
  {
    id: 4,
    title: 'Welcome Campaign & Poster Art',
    description: 'Promotional posters and social cards welcoming student designers and tech enthusiasts back to campus.',
    img: '/welcome.jpg',
    tag: 'Poster & Print'
  }
];

export default function GalleryPage() {
  return (
    <div className="gallery-page">
      <div className="page-header">
        <span className="page-tag">Visual Gallery</span>
        <h2 className="page-title">Work & Campus Showcase</h2>
        <p className="page-subtitle">
          Explore design artifacts, campus spaces, posters, color studies, and community creations by the UX Collective.
        </p>
      </div>

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
            </div>
            <div className="gallery-content">
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'var(--primary-pink)',
                letterSpacing: '0.8px'
              }}>
                {item.tag}
              </span>
              <h3 className="gallery-title">{item.title}</h3>
              <p className="gallery-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
