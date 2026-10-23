import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './Lightbox.css';

// Full-screen photo viewer with keyboard, swipe and click navigation.
// photos: [{ url, caption, event_title? }]
export default function Lightbox({ photos, index, onClose, onIndexChange }) {
  const [touchStart, setTouchStart] = useState(null);
  const closeRef = useRef(null);
  const photo = photos[index];

  const go = useCallback(
    (delta) => onIndexChange((index + delta + photos.length) % photos.length),
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [go, onClose]);

  if (!photo) return null;

  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    setTouchStart(null);
  };

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <button ref={closeRef} className="lightbox-btn lightbox-close" onClick={onClose} aria-label="Close">
        <X size={22} />
      </button>

      {photos.length > 1 && (
        <>
          <button className="lightbox-btn lightbox-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">
            <ChevronLeft size={26} />
          </button>
          <button className="lightbox-btn lightbox-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">
            <ChevronRight size={26} />
          </button>
        </>
      )}

      <figure
        className="lightbox-figure"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <img key={photo.url} src={photo.url} alt={photo.caption || photo.event_title || 'Event photo'} className="lightbox-img" />
        <figcaption className="lightbox-caption">
          <span>{photo.caption || photo.event_title}</span>
          <span className="lightbox-count">{index + 1} / {photos.length}</span>
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}
