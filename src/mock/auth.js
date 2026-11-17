import { HttpError } from './http.js';

/*
 * Demo-only admin login. Everything runs in the visitor's browser, so this is
 * NOT real security: anyone can read the password from the page source.
 * Fine for a client demo; a real backend must do this on the server.
 */
export const DEMO_ADMIN_PASSWORD = 'addon@admin123';
const TTL_MS = 12 * 60 * 60 * 1000;

export function issueToken() {
  return `demo.${btoa(JSON.stringify({ role: 'admin', exp: Date.now() + TTL_MS }))}`;
}

export function checkPassword(input) {
  return String(input ?? '') === DEMO_ADMIN_PASSWORD;
}

export function requireAdmin(req, _res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token.startsWith('demo.')) return next(new HttpError(401, 'Login required'));
  try {
    const { exp } = JSON.parse(atob(token.slice(5)));
    if (Date.now() > exp) return next(new HttpError(401, 'Session expired, please log in again'));
  } catch {
    return next(new HttpError(401, 'Invalid session'));
  }
  next();
}
