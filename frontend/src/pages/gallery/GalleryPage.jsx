import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowUpRight } from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import SmartImage from '../../components/common/SmartImage.jsx';
import Lightbox from '../../components/common/Lightbox.jsx';
import { Reveal } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { formatDate } from '../../lib/dates.js';
import './GalleryPage.css';

// Brand work that isn't tied to an event album.
const BRAND_ITEMS = [
  { id: 'b1', url: '/thorvaldson_hero.png', caption: 'Thorvaldson Hall — our campus base', event_title: 'Campus' },
  { id: 'b2', url: '/logo.jpg', caption: 'UXCO visual identity', event_title: 'Brand' },
  { id: 'b3', url: '/palette.jpg', caption: 'Sunset design system palette', event_title: 'Brand' },
  { id: 'b4', url: '/welcome.jpg', caption: 'Welcome campaign posters', event_title: 'Brand' },
];

export default function GalleryPage() {
  const { data: photos = [], loading, error } = useApi('/api/gallery', { initial: [] });
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const albums = useMemo(() => {
    const seen = new Map();
    photos.forEach((p) => {
      if (!seen.has(p.event_slug)) seen.set(p.event_slug, { slug: p.event_slug, title: p.event_title, start_at: p.start_at, count: 0 });
      seen.get(p.event_slug).count++;
    });
    return [...seen.values()];
  }, [photos]);

  const visible = useMemo(() => {
    if (filter === 'brand') return BRAND_ITEMS;
    if (filter === 'all') return [...photos, ...BRAND_ITEMS];
    return photos.filter((p) => p.event_slug === filter);
  }, [photos, filter]);

  const currentAlbum = albums.find((a) => a.slug === filter);

  return (
    <div className="app-container page-padded gallery-page-wrapper">
      <PageHero
        eyebrow="Visual showcase"
        icon={<Camera size={14} />}
        title="Campus moments & design work"
        lead="Photos from our workshops, jams and socials — plus the brand system behind UXCO. Tap any photo to open it full screen."
      />

      <div className="gallery-filters" role="tablist" aria-label="Albums">
        <button type="button" role="tab" aria-selected={filter === 'all'} className={`pill-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All photos
        </button>
        {albums.map((a) => (
          <button
            key={a.slug}
            type="button"
            role="tab"
            aria-selected={filter === a.slug}
            className={`pill-filter ${filter === a.slug ? 'active' : ''}`}
            onClick={() => setFilter(a.slug)}
          >
            {a.title} <span className="gallery-filter-count">{a.count}</span>
          </button>
        ))}
        <button type="button" role="tab" aria-selected={filter === 'brand'} className={`pill-filter ${filter === 'brand' ? 'active' : ''}`} onClick={() => setFilter('brand')}>
          Brand & campus
        </button>
      </div>

      {currentAlbum && (
        <Reveal variant="up" className="gallery-album-head">
          <div>
            <h2>{currentAlbum.title}</h2>
            <span>{formatDate(currentAlbum.start_at)}</span>
          </div>
          <Link to={`/events/${currentAlbum.slug}`} className="btn-secondary">
            Read the recap <ArrowUpRight size={15} />
          </Link>
        </Reveal>
      )}

      {loading ? (
        <div className="gallery-masonry">
          {[220, 300, 260, 340, 200, 280].map((h, i) => <div key={i} className="skeleton gallery-skeleton" style={{ height: h }} />)}
        </div>
      ) : error && filter !== 'brand' ? (
        <div className="state-box is-error">Couldn’t load photos. Please refresh in a moment.</div>
      ) : (
        <div className="gallery-masonry" key={filter}>
          {visible.map((photo, i) => (
            <Reveal key={photo.id} variant="scale" delay={(i % 6) * 60} className="gallery-tile">
              <button type="button" onClick={() => setLightboxIndex(i)} aria-label={`Open photo: ${photo.caption || photo.event_title}`}>
                <SmartImage src={photo.url} alt={photo.caption || photo.event_title || ''} />
                <span className="gallery-tile-overlay">
                  <span className="gallery-tile-event">{photo.event_title}</span>
                  {photo.caption && <span className="gallery-tile-caption">{photo.caption}</span>}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox photos={visible} index={lightboxIndex} onIndexChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
}
