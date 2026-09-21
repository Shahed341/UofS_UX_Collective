import React from 'react';

/**
 * USask Wheat Sheaf Leaf SVG Component
 * Stylized University of Saskatchewan wheat sheaf leaf mark with 7 symmetrical petals in pure white
 */
function UsaskWheatLeaf({ className = '', size = 360 }) {
  return (
    <svg
      viewBox="0 0 420 540"
      className={className}
      width={size}
      height={size * (540 / 420)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="University of Saskatchewan Wheat Leaf Icon"
    >
      <defs>
        {/* Reusable pointed leaf petal with organic contour */}
        <path
          id="usask-leaf-petal"
          d="M 0,-62 C 34,-31 34,31 0,62 C -34,31 -34,-31 0,-62 Z"
          fill="#FFFFFF"
        />
      </defs>

      {/* 1. Top Apex Vertical Leaf Petal */}
      <use href="#usask-leaf-petal" transform="translate(210, 92) rotate(0)" />

      {/* 2. Upper Pair (Row 1) */}
      <use href="#usask-leaf-petal" transform="translate(138, 218) rotate(-44)" />
      <use href="#usask-leaf-petal" transform="translate(282, 218) rotate(44)" />

      {/* 3. Middle Pair (Row 2) */}
      <use href="#usask-leaf-petal" transform="translate(138, 332) rotate(-44)" />
      <use href="#usask-leaf-petal" transform="translate(282, 332) rotate(44)" />

      {/* 4. Lower Pair (Row 3) */}
      <use href="#usask-leaf-petal" transform="translate(138, 446) rotate(-44)" />
      <use href="#usask-leaf-petal" transform="translate(282, 446) rotate(44)" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="hero-usask-section">
      {/* Dynamic Luminous Sunset Glow Overlay */}
      <div className="hero-mesh-background" />

      <div className="hero-content-wrapper">
        {/* Left Column: Title, Subtitle, Join CTA */}
        <div className="hero-text-column">
          <h1 className="hero-brand-title">
            U of S UX<br />
            Collective
          </h1>

          <p className="hero-brand-description">
            USask’s first ever product design club.<br className="hero-desc-br" />
            Educating and connecting student in<br className="hero-desc-br" />
            product design since 2022.
          </p>

          <a
            href="https://discord.gg/Fx7BUvzdzT"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-join-link"
            title="Join U of S UX Collective on Discord"
          >
            <span>Join us</span>
            <svg
              className="hero-arrow-icon"
              viewBox="0 0 38 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 10H34M34 10L24 2M34 10L24 18"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Right Column: Iconic USask Wheat Leaf Graphic */}
        <div className="hero-graphic-column">
          <div className="hero-leaf-container">
            <UsaskWheatLeaf className="hero-wheat-svg" size={360} />
          </div>
        </div>
      </div>
    </section>
  );
}

