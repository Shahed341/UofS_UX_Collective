/**
 * UX Collective — frontend/src/pages/fun/sfx.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Tiny Web Audio synth for instant game sound effects (no audio files to load).
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone({ type = 'sine', from, to = from, gain = 0.22, duration = 0.1, delay = 0 }) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      const now = this.ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(from, now);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + duration * 0.9);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(amp);
      amp.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio is a nice-to-have; ignore failures
    }
  }

  pop(pitch = 1) {
    this.tone({ from: 400 * pitch, to: 820 * pitch, gain: 0.28, duration: 0.09 });
  }

  miss() {
    this.tone({ type: 'triangle', from: 220, to: 130, gain: 0.2, duration: 0.12 });
  }

  tick() {
    this.tone({ from: 540, gain: 0.2, duration: 0.08 });
  }

  correct(level = 0) {
    this.tone({ from: 600 + level * 25, to: 900 + level * 25, gain: 0.2, duration: 0.12 });
  }

  victory() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => this.tone({ from: freq, gain: 0.22, duration: 0.22, delay: i * 0.09 }));
  }
}

export const sfx = new SoundFX();
