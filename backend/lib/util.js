/**
 * UX Collective — backend/lib/util.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Saskatoon observes CST (UTC-6) all year, so local time is a fixed offset from UTC.
const SASKATOON_OFFSET_MS = -6 * 60 * 60 * 1000;

export function saskatoonNow() {
  return new Date(Date.now() + SASKATOON_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 150);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validates a request body against a small spec: { field: { required, max, email, url, oneOf } }.
// Returns { data, error } with trimmed strings.
export function validate(body, spec) {
  const data = {};
  for (const [field, rules] of Object.entries(spec)) {
    let value = body?.[field];
    value = typeof value === 'string' ? value.trim() : value ?? '';

    if (rules.required && (value === '' || value === null)) {
      return { error: `${rules.label || field} is required.` };
    }
    if (typeof value === 'string' && rules.max && value.length > rules.max) {
      return { error: `${rules.label || field} must be ${rules.max} characters or fewer.` };
    }
    if (value && rules.email && !EMAIL_RE.test(value)) {
      return { error: 'Please enter a valid email address.' };
    }
    if (value && rules.url && !/^https?:\/\/|^\/uploads\//.test(value)) {
      return { error: `${rules.label || field} must be a link starting with http:// or https://.` };
    }
    if (value && rules.oneOf && !rules.oneOf.includes(value)) {
      return { error: `${rules.label || field} is not a valid option.` };
    }
    data[field] = value;
  }
  return { data };
}

export function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Wraps async route handlers so thrown errors reach the error middleware.
export const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
