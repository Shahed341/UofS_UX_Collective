import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sfx } from '../sfx.js';

// Top bar shown during every game: live metrics, mute and quit.
export default function HudShell({ metrics, onQuit }) {
  const [sound, setSound] = useState(sfx.enabled);

  const toggleSound = () => {
    sfx.enabled = !sfx.enabled;
    setSound(sfx.enabled);
  };

  return (
    <div className="arena-hud-bar" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      {metrics.filter(Boolean).map(({ label, value, color, className }) => (
        <div key={label} className={`hud-metric ${className || ''}`}>
          <span className="hud-metric-label">{label}</span>
          <span className="hud-metric-val" style={color ? { color } : undefined}>{value}</span>
        </div>
      ))}
      <div className="hud-actions-right">
        <button type="button" className="hud-icon-btn" onClick={toggleSound} aria-label={sound ? 'Mute sound' : 'Unmute sound'}>
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button type="button" className="hud-quit-btn" onClick={onQuit}>✕ Quit</button>
      </div>
    </div>
  );
}
