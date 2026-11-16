// Writes the seed data into /data. Called on first start, or manually with
// `npm run reset-data` (this WIPES orders, bookings and enquiries).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from './jsonStore.js';
import * as seed from './seedData.js';

const files = {
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

export async function seedData({ force = false } = {}) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const written = [];
  for (const [name, value] of Object.entries(files)) {
    const file = path.join(DATA_DIR, `${name}.json`);
    const exists = await fs.access(file).then(() => true, () => false);
    if (exists && !force) continue;
    await fs.writeFile(file, JSON.stringify(value, null, 2));
    written.push(name);
  }
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const written = await seedData({ force: true });
  console.log(`Reset ${written.length} data files in ${DATA_DIR}`);
}
