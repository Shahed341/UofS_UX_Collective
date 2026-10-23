/**
 * UX Collective — frontend/src/lib/track.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Anonymous, cookie-free analytics for the admin dashboard.
// Each visit gets a random id kept only in sessionStorage; nothing personal is sent.

function sessionId() {
  try {
    let id = sessionStorage.getItem('uxco_sid');
    if (!id) {
      id = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('uxco_sid', id);
    }
    return id;
  } catch {
    return '0000000000000000';
  }
}

let lastPageView = { path: '', at: 0 };

export function track(type, target = '') {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return;

  // React StrictMode runs effects twice in development; ignore the duplicate page view
  if (type === 'page_view') {
    if (lastPageView.path === path && Date.now() - lastPageView.at < 1500) return;
    lastPageView = { path, at: Date.now() };
  }

  fetch('/api/track', {
    method: 'POST',
    keepalive: true, // still delivered when the click navigates away
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, path, target: String(target).slice(0, 200), sid: sessionId() }),
  }).catch(() => {});
}
