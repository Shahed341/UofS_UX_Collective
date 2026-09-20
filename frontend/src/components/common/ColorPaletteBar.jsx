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
    <section style={{
      background: '#FAFAFA',
      border: '1px solid #F0F0F0',
      borderRadius: '12px',
      padding: '12px 18px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }} aria-label="UXCO Color Palette">
      <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#666666' }}>
        UXCO Design System Palette
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {PALETTE.map((c) => (
          <div key={c.hex} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#333333' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: c.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span>{c.hex}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
