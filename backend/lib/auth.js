/**
 * UX Collective — backend/lib/auth.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';

// Admin access is limited to a single Google account (ADMIN_EMAIL).
// Sessions are an HMAC-signed cookie, so no session table is needed.

export const SESSION_COOKIE = 'uxco_admin';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === 'production';

export const authConfig = {
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  adminEmail: (process.env.ADMIN_EMAIL || '').toLowerCase(),
  // Local development shortcut until Google credentials are configured. Never enabled in production.
  devLoginEnabled: !isProduction && process.env.ALLOW_DEV_LOGIN !== 'false',
};

const secret = process.env.SESSION_SECRET || (isProduction ? null : 'uxco-dev-only-secret');
if (!secret) {
  throw new Error('SESSION_SECRET must be set in production.');
}

const googleClient = authConfig.googleClientId ? new OAuth2Client(authConfig.googleClientId) : null;

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function startSession(res, { email, name, picture, method }) {
  const token = sign({ email, name, picture, method, exp: Date.now() + SESSION_TTL_MS });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function endSession(res) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export function currentAdmin(req) {
  return verify(req.cookies?.[SESSION_COOKIE]);
}

export function requireAdmin(req, res, next) {
  const admin = currentAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Admin login required.' });
  }
  req.admin = admin;
  next();
}

// Verifies a Google Identity Services ID token and checks it belongs to the admin account.
export async function verifyGoogleCredential(credential) {
  if (!googleClient) throw new Error('Google sign-in is not configured (GOOGLE_CLIENT_ID missing).');
  if (!authConfig.adminEmail) throw new Error('ADMIN_EMAIL is not configured.');

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: authConfig.googleClientId });
  const payload = ticket.getPayload();
  if (!payload?.email_verified || payload.email.toLowerCase() !== authConfig.adminEmail) {
    const err = new Error('This Google account is not authorised to manage the site.');
    err.status = 403;
    throw err;
  }
  return { email: payload.email, name: payload.name || payload.email, picture: payload.picture || '' };
}
