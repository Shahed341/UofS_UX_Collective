/**
 * UX Collective — backend/index.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { migrate } from './db/migrate.js';
import { UPLOAD_DIR } from './lib/uploads.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import calendarRoutes from './routes/calendar.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Requests arrive through the Vite dev proxy or Nginx, so trust one proxy hop for client IPs (rate limiting)
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', calendarRoutes);
app.use('/api', publicRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    error: status >= 500 ? 'Something went wrong on our side.' : err.message,
  });
});

migrate()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 UXCO backend running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database migration failed:', error);
    process.exit(1);
  });
