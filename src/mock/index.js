import { dispatch } from './router.js';
import catalog from './routes/catalog.js';
import orders from './routes/orders.js';
import bookings from './routes/bookings.js';
import admin from './routes/admin.js';

const routers = [catalog, orders, bookings, admin];

/** Handles an "API" call entirely in the browser. Mirrors the old Express API. */
export function handle(method, url, body, headers) {
  const [path, search = ''] = url.split('?');
  const query = Object.fromEntries(new URLSearchParams(search));
  if (path === '/health') return Promise.resolve({ status: 200, body: { ok: true } });
  // Clone the body so handlers can never mutate the caller's objects.
  return dispatch(routers, { method, path, query, body: body === undefined ? undefined : structuredClone(body), headers });
}

export { resetDemoData } from './store.js';
