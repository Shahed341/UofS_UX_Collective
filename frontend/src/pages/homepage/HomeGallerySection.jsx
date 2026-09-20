import React from 'react';
import { useNavigate } from 'react-router-dom';

const MONTAGE_COLUMNS = [
  {
    id: 'col-1',
    items: [
      { id: 1, title: 'Thorvaldson Hall Campus Base', img: '/thorvaldson_hero.png', height: 130 },
      { id: 2, title: 'Collaborative Sprint Session', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80', height: 150 },
    ]
  },
  {
    id: 'col-2',
    items: [
      { id: 3, title: 'UXCO Brand Identity', img: '/logo.jpg', height: 110 },
      { id: 4, title: 'UI Wireframing & Sketching', img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80', height: 135 },
    ]
  },
  {
    id: 'col-3',
    items: [
      { id: 5, title: 'Design Critique & Mentorship', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80', height: 260 },
    ]
  },
  {
    id: 'col-4',
    items: [
      { id: 6, title: 'Fall Workshop & Panel Talk', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80', height: 295 },
    ]
  },
  {
    id: 'col-5',
    items: [
      { id: 7, title: 'Interactive Studio Space', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80', height: 270 },
    ]
  },
  {
    id: 'col-6',
    items: [
      { id: 8, title: 'Welcome Campaign Posters', img: '/welcome.jpg', height: 250 },
    ]
  },
  {
    id: 'col-7',
    items: [
      { id: 9, title: 'Design System & Palette', img: '/palette.jpg', height: 110 },
      { id: 10, title: 'Team Meeting & Hackathon', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80', height: 135 },
    ]
  },
  {
    id: 'col-8',
    items: [
      { id: 11, title: 'Creative Design Studio', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80', height: 130 },
      { id: 12, title: 'Student Community Reviews', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80', height: 150 },
    ]
  }
];

export default function HomeGallerySection() {
  const navigate = useNavigate();

  return (
    <section className="home-montage-section">
      <div className="montage-grid-wrapper">
        <div className="montage-columns-container">
          {MONTAGE_COLUMNS.map((col) => (
            <div key={col.id} className="montage-column">
              {col.items.map((item) => (
                <div 
                  key={item.id} 
                  className="montage-photo-card"
                  style={{ height: `${item.height}px` }}
                  onClick={() => navigate('/gallery')}
                  title={`${item.title} — Click to view Gallery`}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="montage-photo-img"
                    onError={(e) => { e.target.src = '/thorvaldson_hero.png'; }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
