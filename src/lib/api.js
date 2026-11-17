/*
 * API client. In this static demo build, every call is answered in the browser
 * by src/mock/ (same routes, rules and responses as the original Express API),
 * with data saved in localStorage.
 *
 * To use a real backend later: replace `handle(...)` below with
 * `fetch(`${BASE}${path}`, ...)` and delete src/mock/.
 */
import { handle } from '../mock/index.js';

const TOKEN_KEY = 'addon_admin_token';
const LATENCY_MS = 120; // small delay so loading states behave like a real site

export const adminToken = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage blocked */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } },
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

async function request(method, path, body, { admin = false, signal } = {}) {
  const headers = {};
  if (admin) headers.authorization = `Bearer ${adminToken.get() || ''}`;
  await wait(LATENCY_MS, signal);
  const { status, body: data } = await handle(method, path, body, headers);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (status >= 400) {
    if (status === 401 && admin) {
      adminToken.clear();
      window.dispatchEvent(new Event('admin-logout'));
    }
    throw new ApiError(data?.error || `Request failed (${status})`, status, data);
  }
  return data;
}

export const api = {
  get: (p, o) => request('GET', p, undefined, o),
  post: (p, b, o) => request('POST', p, b, o),
  put: (p, b, o) => request('PUT', p, b, o),
  patch: (p, b, o) => request('PATCH', p, b, o),
  del: (p, o) => request('DELETE', p, undefined, o),
};

export const qs = (obj) => {
  const s = new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return s ? `?${s}` : '';
};
