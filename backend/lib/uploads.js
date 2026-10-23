import path from 'node:path';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import multer from 'multer';

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve('uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED_TYPES[file.mimetype]}`);
  },
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    const err = new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed.');
    err.status = 400;
    cb(err);
  },
});

export const publicUrlFor = (file) => `/uploads/${file.filename}`;

// Deletes a previously uploaded file; external URLs (e.g. demo images) are ignored.
export async function removeUpload(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const file = path.join(UPLOAD_DIR, path.basename(url));
  await unlink(file).catch(() => {});
}
