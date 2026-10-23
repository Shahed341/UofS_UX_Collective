import React, { useEffect, useState } from 'react';
import { sfx } from '../sfx.js';

// Full-screen 3-2-1 before a game starts.
export default function Countdown({ subtitle, tip, onDone }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    sfx.tick();
    if (n === 0) {
      onDone();
      return undefined;
    }
    const t = setTimeout(() => setN((v) => v - 1), 750);
    return () => clearTimeout(t);
    // onDone is stable for the lifetime of the countdown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <div className="game-countdown-screen" role="status" aria-live="assertive">
      <div className="countdown-content">
        <span className="countdown-subtitle">{subtitle}</span>
        <div key={n} className="countdown-number-display">{n || 'Go!'}</div>
        {tip && <p className="countdown-tip">{tip}</p>}
      </div>
    </div>
  );
}
