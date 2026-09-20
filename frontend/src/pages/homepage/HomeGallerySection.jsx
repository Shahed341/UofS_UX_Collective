import React from 'react';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';

const HIGHLIGHT_IMAGES = [
  {
    id: 1,
    title: 'Thorvaldson Hall • Campus Base',
    tag: 'Campus Base',
    img: '/thorvaldson_hero.png',
  },
  {
    id: 2,
    title: 'Brand Identity System',
    tag: 'Identity',
    img: '/logo.jpg',
  },
  {
    id: 3,
    title: 'Official Design Palette',
    tag: 'Design Tokens',
    img: '/palette.jpg',
  },
  {
    id: 4,
    title: 'Welcome Campaign Poster',
    tag: 'Poster & Print',
    img: '/welcome.jpg',
  },
];

export default function HomeGallerySection({ setActivePage }) {
  return (
    <section className="home-gallery-section">
      <div className="section-header">
        <div>
          <span className="section-tag">Visual Showcase</span>
          <h3 className="section-title">Design Work & Campus Life</h3>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => setActivePage('gallery')}
        >
          View Full Gallery <ArrowRight size={15} />
        </button>
      </div>

      <div className="home-gallery-grid">
        {HIGHLIGHT_IMAGES.map((item) => (
          <div key={item.id} className="home-gallery-card" onClick={() => setActivePage('gallery')}>
            <div className="home-gallery-img-box">
              <img 
                src={item.img} 
                alt={item.title} 
                className="home-gallery-img"
                onError={(e) => { e.target.src = '/logo.jpg'; }}
              />
            </div>
            <div className="home-gallery-caption">
              <span className="gallery-tag-pill">{item.tag}</span>
              <h4 className="home-gallery-title">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
