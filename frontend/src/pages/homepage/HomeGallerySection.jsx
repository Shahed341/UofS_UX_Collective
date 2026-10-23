/**
 * UX Collective — frontend/src/pages/homepage/HomeGallerySection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../../components/common/SmartImage.jsx';
import { Reveal, useScrollProgress } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';

// Static campus images used until event albums are uploaded.
const FALLBACK_PHOTOS = [
  { url: '/thorvaldson_hero.png', caption: 'Thorvaldson Hall' },
  { url: '/welcome.jpg', caption: 'Welcome campaign posters' },
  { url: '/logo.jpg', caption: 'UXCO brand identity' },
  { url: '/palette.jpg', caption: 'Design system palette' },
  { url: '/thorvaldson_preview.jpg', caption: 'Campus base' },
];

// Column layout of the arched montage: heights per photo slot (px).
const COLUMN_SHAPES = [[130, 150], [110, 135], [260], [295], [270], [250], [110, 135], [130, 150]];

export default function HomeGallerySection() {
  const { data: photos } = useApi('/api/gallery', { initial: [] });
  const [ref, progress] = useScrollProgress();

  const columns = useMemo(() => {
    const pool = photos?.length ? photos : FALLBACK_PHOTOS;
    let n = 0;
    return COLUMN_SHAPES.map((heights) => heights.map((height) => ({ ...pool[n++ % pool.length], height, key: n })));
  }, [photos]);

  return (
    <section ref={ref} className="home-montage-section" aria-label="Photo highlights">
      <Reveal variant="up" className="app-container montage-head">
        <div>
          <span className="section-eyebrow">Gallery</span>
          <h2 className="section-heading">Moments from the studio</h2>
        </div>
        <Link to="/gallery" className="btn-secondary">
          View gallery <ArrowRight size={15} />
        </Link>
      </Reveal>

      <div className="montage-grid-wrapper">
        <div className="montage-columns-container">
          {columns.map((col, i) => {
            // Alternate columns drift in opposite directions while scrolling
            const shift = (progress - 0.5) * (i % 2 ? -60 : 60);
            return (
              <div key={i} className="montage-column" style={{ transform: `translateY(${shift}px)` }}>
                {col.map((item) => (
                  <Link
                    key={item.key}
                    to="/gallery"
                    className="montage-photo-card"
                    style={{ height: `${item.height}px` }}
                    title={item.caption || item.event_title}
                  >
                    <SmartImage src={item.url} alt={item.caption || item.event_title || ''} className="montage-photo-img" />
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
