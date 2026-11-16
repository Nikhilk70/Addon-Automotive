export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Wrap async route handlers so thrown errors reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PINCODE_RE = /^[1-9]\d{5}$/;

/** Normalises an Indian mobile number to its last 10 digits. */
export const normalisePhone = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

export function str(value, field, { required = true, max = 200, min = 0 } = {}) {
  const v = typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  if (required && !v) throw new HttpError(400, `${field} is required`, { field });
  if (v.length > max) throw new HttpError(400, `${field} is too long`, { field });
  if (v && v.length < min) throw new HttpError(400, `${field} is too short`, { field });
  return v;
}

export function phone(value, field = 'Phone') {
  const v = normalisePhone(value);
  if (!PHONE_RE.test(v)) throw new HttpError(400, `${field} must be a valid 10-digit mobile number`, { field: 'phone' });
  return v;
}

export function email(value, { required = false } = {}) {
  const v = str(value, 'Email', { required, max: 120 }).toLowerCase();
  if (v && !EMAIL_RE.test(v)) throw new HttpError(400, 'Email address looks invalid', { field: 'email' });
  return v;
}

export function pincode(value) {
  const v = str(value, 'Pincode', { max: 6 });
  if (!PINCODE_RE.test(v)) throw new HttpError(400, 'Pincode must be 6 digits', { field: 'pincode' });
  return v;
}

export function oneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw new HttpError(400, `${field} must be one of: ${allowed.join(', ')}`, { field });
  return value;
}

export function int(value, field, { min = -Infinity, max = Infinity } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${field} is invalid`, { field });
  return n;
}
