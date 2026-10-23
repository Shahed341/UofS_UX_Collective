import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';
import { api, useApi } from '../../lib/api.js';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    const script = existing || document.createElement('script');
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true });
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

// Sign-in screen: Google (single club account) when configured, plus a local dev shortcut.
export default function AdminLogin({ onSignedIn }) {
  const { data: config } = useApi('/api/auth/config', { select: (r) => r });
  const [error, setError] = useState('');
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!config?.googleConfigured) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: async ({ credential }) => {
            try {
              const res = await api.post('/api/auth/google', { credential });
              onSignedIn(res.admin);
            } catch (err) {
              setError(err.message);
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'pill', width: 280 });
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [config, onSignedIn]);

  const devLogin = async () => {
    try {
      const res = await api.post('/api/auth/dev-login');
      onSignedIn(res.admin);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-badge"><ShieldCheck size={28} /></div>
        <h1>UXCO Admin</h1>
        <p>Sign in with the club’s Google account to manage events, photos and content.</p>

        {error && <div className="ux-alert error" role="alert">{error}</div>}

        {config?.googleConfigured ? (
          <div ref={buttonRef} className="admin-google-btn" />
        ) : (
          config && (
            <div className="admin-setup-note">
              <strong>Google sign-in isn’t configured yet.</strong>
              <span>Set <code>GOOGLE_CLIENT_ID</code> and <code>ADMIN_EMAIL</code> (see <code>.env.example</code>) and restart the backend.</span>
            </div>
          )
        )}

        {config?.devLoginEnabled && (
          <button type="button" className="admin-dev-btn" onClick={devLogin}>
            <Terminal size={16} /> Continue as local dev admin
          </button>
        )}

        <Link to="/" className="admin-back-link"><ArrowLeft size={15} /> Back to site</Link>
      </div>
    </div>
  );
}
