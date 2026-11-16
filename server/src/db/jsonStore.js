/**
 * JSON file storage.
 *
 * Every route talks to the database ONLY through `collection(name)` below.
 * To move to MongoDB or PostgreSQL later, re-implement this file with the
 * same async methods (all, find, findOne, insert, update, remove) and the
 * rest of the backend keeps working unchanged.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../data');

const cache = new Map();
const writeQueues = new Map();

async function load(name) {
  if (cache.has(name)) return cache.get(name);
  const file = path.join(DATA_DIR, `${name}.json`);
  let rows = [];
  try {
    rows = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  cache.set(name, rows);
  return rows;
}

/** Writes are serialised per collection and done atomically (tmp file + rename). */
function persist(name) {
  const prev = writeQueues.get(name) || Promise.resolve();
  const next = prev.then(async () => {
    const file = path.join(DATA_DIR, `${name}.json`);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(cache.get(name), null, 2));
    await fs.rename(tmp, file);
  });
  writeQueues.set(name, next.catch(() => {}));
  return next;
}

const matches = (row, query) =>
  typeof query === 'function'
    ? query(row)
    : Object.entries(query || {}).every(([k, v]) => row[k] === v);

const clone = (v) => structuredClone(v);

export function collection(name) {
  return {
    async all() {
      return clone(await load(name));
    },
    async find(query = {}) {
      return clone((await load(name)).filter((r) => matches(r, query)));
    },
    async findOne(query) {
      const row = (await load(name)).find((r) => matches(r, query));
      return row ? clone(row) : null;
    },
    async insert(doc) {
      const rows = await load(name);
      const now = new Date().toISOString();
      const row = { id: doc.id || crypto.randomUUID(), ...doc, createdAt: now, updatedAt: now };
      rows.push(row);
      await persist(name);
      return clone(row);
    },
    async update(query, patch) {
      const rows = await load(name);
      const row = rows.find((r) => matches(r, query));
      if (!row) return null;
      const changes = typeof patch === 'function' ? patch(clone(row)) : patch;
      Object.assign(row, changes, { id: row.id, updatedAt: new Date().toISOString() });
      await persist(name);
      return clone(row);
    },
    async remove(query) {
      const rows = await load(name);
      const idx = rows.findIndex((r) => matches(r, query));
      if (idx === -1) return false;
      rows.splice(idx, 1);
      await persist(name);
      return true;
    },
  };
}

/** Settings is a single object, not a list. */
export async function getSettings() {
  const file = path.join(DATA_DIR, 'settings.json');
  return JSON.parse(await fs.readFile(file, 'utf8'));
}
