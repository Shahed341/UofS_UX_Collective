/**
 * UX Collective — backend/routes/auth.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authConfig, currentAdmin, endSession, startSession, verifyGoogleCredential } from '../lib/auth.js';
import { asyncRoute } from '../lib/util.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

// Tells the login page which sign-in options are available.
router.get('/config', (req, res) => {
  res.json({
    success: true,
    googleClientId: authConfig.googleClientId,
    googleConfigured: !!(authConfig.googleClientId && authConfig.adminEmail),
    devLoginEnabled: authConfig.devLoginEnabled,
  });
});

router.get('/me', (req, res) => {
  const admin = currentAdmin(req);
  if (!admin) return res.status(401).json({ success: false });
  res.json({ success: true, admin: { email: admin.email, name: admin.name, picture: admin.picture, method: admin.method } });
});

router.post('/google', loginLimiter, asyncRoute(async (req, res) => {
  const credential = req.body?.credential;
  if (!credential) return res.status(400).json({ success: false, error: 'Missing Google credential.' });
  try {
    const profile = await verifyGoogleCredential(credential);
    startSession(res, { ...profile, method: 'google' });
    res.json({ success: true, admin: profile });
  } catch (error) {
    res.status(error.status || 401).json({ success: false, error: error.message });
  }
}));

router.post('/dev-login', loginLimiter, (req, res) => {
  if (!authConfig.devLoginEnabled) {
    return res.status(404).json({ success: false, error: 'Not available.' });
  }
  const profile = { email: authConfig.adminEmail || 'dev@localhost', name: 'Local Admin', picture: '' };
  startSession(res, { ...profile, method: 'dev' });
  res.json({ success: true, admin: profile });
});

router.post('/logout', (req, res) => {
  endSession(res);
  res.json({ success: true });
});

export default router;
