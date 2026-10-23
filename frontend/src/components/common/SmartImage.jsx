import React, { useState } from 'react';

const FALLBACK = '/thorvaldson_preview.jpg';

// Lazy image that fades in once loaded and falls back to a campus photo if the URL is broken.
export default function SmartImage({ src, alt = '', className = '', fallback = FALLBACK, eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed || !src ? fallback : src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`smart-img ${loaded ? 'is-loaded' : ''} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!failed) setFailed(true);
        else setLoaded(true);
      }}
      {...rest}
    />
  );
}
