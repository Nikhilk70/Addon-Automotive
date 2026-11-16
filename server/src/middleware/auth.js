import crypto from 'node:crypto';
import { HttpError } from '../utils/http.js';

const SECRET = () => process.env.TOKEN_SECRET || 'dev-only-secret-change-me';
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const sign = (payload) => crypto.createHmac('sha256', SECRET()).update(payload).digest('base64url');

export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function checkPassword(input) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || 'addon@admin123');
  const given = Buffer.from(String(input ?? ''));
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export function requireAdmin(req, _res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return next(new HttpError(401, 'Login required'));
  const expected = sign(payload);
  const ok = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return next(new HttpError(401, 'Invalid session'));
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > exp) return next(new HttpError(401, 'Session expired, please log in again'));
  } catch {
    return next(new HttpError(401, 'Invalid session'));
  }
  next();
}
