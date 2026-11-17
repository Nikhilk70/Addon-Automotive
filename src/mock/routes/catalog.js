import { Router } from '../router.js';
import { collection, getSettings } from '../store.js';
import { ah, HttpError, str, int } from '../http.js';
import { fitsVehicle } from '../pricing.js';

const r = Router();

const discountPct = (p) => (p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
const publicProduct = (p) => ({ ...p, discount: discountPct(p) });

r.get('/settings', ah(async (_req, res) => res.json(await getSettings())));
r.get('/categories', ah(async (_req, res) => {
  const [cats, products] = await Promise.all([collection('categories').all(), collection('products').find({ active: true })]);
  res.json(cats.map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length })));
}));
r.get('/vehicles', ah(async (_req, res) => res.json(await collection('vehicles').all())));
r.get('/brands', ah(async (_req, res) => res.json(await collection('brands').all())));
r.get('/testimonials', ah(async (_req, res) => res.json(await collection('testimonials').all())));

/** Everything the homepage needs in one request. */
r.get('/home', ah(async (_req, res) => {
  const products = (await collection('products').find({ active: true })).map(publicProduct);
  const byTag = (tag) => products.filter((p) => p.tags?.includes(tag));
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    bestsellers: byTag('bestseller').slice(0, 8),
    newArrivals: byTag('new').slice(0, 8),
    onSale: [...byTag('sale')].sort((a, b) => b.discount - a.discount).slice(0, 8),
    dealOfTheDay: [...products].filter((p) => p.stock > 0).sort((a, b) => b.discount - a.discount)[0] || null,
    offers: (await collection('offers').find((o) => o.active && (!o.validTill || o.validTill >= today))),
    testimonials: await collection('testimonials').all(),
    brands: await collection('brands').all(),
    reels: await activeReels(),
  });
}));

async function activeReels() {
  const rows = await collection('reels').find({ active: true });
  return rows.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}
r.get('/reels', ah(async (_req, res) => res.json(await activeReels())));

r.get('/products', ah(async (req, res) => {
  const q = req.query;
  let items = (await collection('products').find({ active: true })).map(publicProduct);

  if (q.category) items = items.filter((p) => p.categoryId === q.category);
  if (q.tag) items = items.filter((p) => p.tags?.includes(q.tag));
  if (q.search) {
    const terms = String(q.search).toLowerCase().split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.categoryId} ${p.tags?.join(' ')}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  if (q.make && q.model) items = items.filter((p) => fitsVehicle(p, q.make, q.model));

  // Facets are computed before brand/price filters so the sidebar doesn't collapse.
  const facets = {
    brands: [...new Set(items.map((p) => p.brand))].sort(),
    price: items.length
      ? { min: Math.min(...items.map((p) => p.price)), max: Math.max(...items.map((p) => p.price)) }
      : { min: 0, max: 0 },
  };

  if (q.brand) {
    const brands = String(q.brand).split(',');
    items = items.filter((p) => brands.includes(p.brand));
  }
  if (q.minPrice) items = items.filter((p) => p.price >= Number(q.minPrice));
  if (q.maxPrice) items = items.filter((p) => p.price <= Number(q.maxPrice));
  if (q.inStock === '1') items = items.filter((p) => p.stock > 0);

  const sorters = {
    popular: (a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => b.discount - a.discount,
    newest: (a, b) => (b.tags?.includes('new') ? 1 : 0) - (a.tags?.includes('new') ? 1 : 0),
  };
  items.sort(sorters[q.sort] || sorters.popular);

  const limit = Math.min(Number(q.limit) || 24, 60);
  const page = Math.max(Number(q.page) || 1, 1);
  res.json({ items: items.slice((page - 1) * limit, page * limit), total: items.length, page, limit, facets });
}));

r.get('/products/:slug', ah(async (req, res) => {
  const products = collection('products');
  const p = await products.findOne((x) => (x.slug === req.params.slug || x.id === req.params.slug) && x.active);
  if (!p) throw new HttpError(404, 'Product not found');
  const [reviews, related, category] = await Promise.all([
    collection('reviews').find({ productId: p.id }),
    products.find((x) => x.active && x.categoryId === p.categoryId && x.id !== p.id),
    collection('categories').findOne({ id: p.categoryId }),
  ]);
  reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ product: publicProduct(p), category, reviews, related: related.slice(0, 4).map(publicProduct) });
}));

r.post('/products/:id/reviews', ah(async (req, res) => {
  const products = collection('products');
  const p = await products.findOne({ id: req.params.id });
  if (!p) throw new HttpError(404, 'Product not found');
  const review = await collection('reviews').insert({
    productId: p.id,
    name: str(req.body.name, 'Name', { max: 60 }),
    rating: int(req.body.rating, 'Rating', { min: 1, max: 5 }),
    title: str(req.body.title, 'Title', { required: false, max: 80 }),
    text: str(req.body.text, 'Review', { max: 1000, min: 5 }),
    verified: false,
  });
  // Keep the product's running average up to date.
  const total = p.rating * p.reviewCount + review.rating;
  await products.update({ id: p.id }, { reviewCount: p.reviewCount + 1, rating: Math.round((total / (p.reviewCount + 1)) * 10) / 10 });
  res.status(201).json(review);
}));

r.get('/offers', ah(async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json(await collection('offers').find((o) => o.active && (!o.validTill || o.validTill >= today)));
}));

export default r;
