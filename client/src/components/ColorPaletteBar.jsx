import React from 'react';

const PALETTE = [
  { name: 'Primary (Deep Pink)', hex: '#E81D88', bg: '#E81D88' },
  { name: 'Secondary (Medium Pink)', hex: '#F46FC2', bg: '#F46FC2' },
  { name: 'Accent 1 (Coral Pink)', hex: '#FB8AA2', bg: '#FB8AA2' },
  { name: 'Accent 2 (Orange-Coral)', hex: '#FA9B7A', bg: '#FA9B7A' },
  { name: 'Accent 3 (Peach-Orange)', hex: '#FDCEA1', bg: '#FDCEA1' },
  { name: 'Base (Deep Grey)', hex: '#333333', bg: '#333333' },
  { name: 'Canvas (White)', hex: '#FFFFFF', bg: '#FFFFFF' }
];

export default function ColorPaletteBar() {
  return (
    <section className="palette-ribbon" aria-label="UXCO Color Palette">
      <span className="palette-label">Design System Palette</span>
      <div className="palette-swatches">
        {PALETTE.map((c) => (
          <div key={c.hex} className="swatch-item" title={`${c.name} - ${c.hex}`}>
            <span className="swatch-dot" style={{ backgroundColor: c.bg }} />
            <span>{c.hex}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
