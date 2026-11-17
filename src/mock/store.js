/**
 * In-browser "database" for the static demo.
 *
 * Same interface as the old server/src/db/jsonStore.js, so all business logic
 * in src/mock/ stays identical to a real backend. Data lives in localStorage,
 * which means each visitor's browser has its own copy (orders placed on one
 * device are not visible on another).
 *
 * When a real backend is added later, delete src/mock/ and point
 * src/lib/api.js back at fetch().
 */
import * as seed from './seed.js';

const PREFIX = 'addon_db_v1:';

const SEED = {
  settings: seed.settings,
  categories: seed.categories,
  vehicles: seed.vehicles,
  products: seed.products,
  offers: seed.offers,
  testimonials: seed.testimonials,
  reviews: seed.reviews,
  brands: seed.brands,
  reels: seed.reels,
  orders: [],
  bookings: [],
  enquiries: [],
  subscribers: [],
};

const cache = new Map();
const clone = (v) => structuredClone(v);

function read(name) {
  if (cache.has(name)) return cache.get(name);
  let value;
  try {
    const raw = localStorage.getItem(PREFIX + name);
    value = raw ? JSON.parse(raw) : undefined;
  } catch {
    value = undefined;
  }
  if (value === undefined) value = clone(SEED[name] ?? []);
  cache.set(name, value);
  return value;
}

function persist(name) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(cache.get(name)));
  } catch {
    /* storage full or blocked: data still works for this session */
  }
}

export const uuid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min));

const matches = (row, query) =>
  typeof query === 'function' ? query(row) : Object.entries(query || {}).every(([k, v]) => row[k] === v);

export function collection(name) {
  return {
    async all() {
      return clone(read(name));
    },
    async find(query = {}) {
      return clone(read(name).filter((r) => matches(r, query)));
    },
    async findOne(query) {
      const row = read(name).find((r) => matches(r, query));
      return row ? clone(row) : null;
    },
    async insert(doc) {
      const rows = read(name);
      const now = new Date().toISOString();
      const row = { id: doc.id || uuid(), ...doc, createdAt: now, updatedAt: now };
      rows.push(row);
      persist(name);
      return clone(row);
    },
    async update(query, patch) {
      const rows = read(name);
      const row = rows.find((r) => matches(r, query));
      if (!row) return null;
      const changes = typeof patch === 'function' ? patch(clone(row)) : patch;
      Object.assign(row, changes, { id: row.id, updatedAt: new Date().toISOString() });
      persist(name);
      return clone(row);
    },
    async remove(query) {
      const rows = read(name);
      const idx = rows.findIndex((r) => matches(r, query));
      if (idx === -1) return false;
      rows.splice(idx, 1);
      persist(name);
      return true;
    },
  };
}

export async function getSettings() {
  return clone(read('settings'));
}

/** Wipes everything in this browser back to the starting demo data. */
export function resetDemoData() {
  Object.keys(SEED).forEach((name) => {
    cache.delete(name);
    try {
      localStorage.removeItem(PREFIX + name);
    } catch {
      /* ignore */
    }
  });
}
