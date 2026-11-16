import { Router } from 'express';
import { collection } from '../db/jsonStore.js';
import { ah, HttpError, str, int, oneOf } from '../utils/http.js';
import { requireAdmin, issueToken, checkPassword } from '../middleware/auth.js';
import { ORDER_STATUSES } from './orders.js';
import { BOOKING_STATUSES } from './bookings.js';

const r = Router();

// Simple in-memory brute-force guard for the login endpoint.
const attempts = new Map();
r.post('/admin/login', ah(async (req, res) => {
  const key = req.ip;
  const a = attempts.get(key) || { n: 0, until: 0 };
  if (a.until > Date.now()) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  if (!checkPassword(req.body?.password)) {
    a.n += 1;
    if (a.n >= 5) Object.assign(a, { n: 0, until: Date.now() + 5 * 60 * 1000 });
    attempts.set(key, a);
    throw new HttpError(401, 'Wrong password');
  }
  attempts.delete(key);
  res.json({ token: issueToken() });
}));

r.use('/admin', requireAdmin);

r.get('/admin/stats', ah(async (_req, res) => {
  const [orders, bookings, products, enquiries, subscribers] = await Promise.all([
    collection('orders').all(),
    collection('bookings').all(),
    collection('products').all(),
    collection('enquiries').all(),
    collection('subscribers').all(),
  ]);
  const live = orders.filter((o) => o.status !== 'cancelled');
  const today = new Date().toISOString().slice(0, 10);
  const days = [...Array(7)].map((_, i) => new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10));
  res.json({
    revenue: live.reduce((s, o) => s + o.totals.total, 0),
    orders: orders.length,
    openOrders: orders.filter((o) => ['placed', 'confirmed', 'ready', 'shipped'].includes(o.status)).length,
    upcomingBookings: bookings.filter((b) => b.date >= today && !['cancelled', 'completed'].includes(b.status)).length,
    newEnquiries: enquiries.filter((e) => e.status === 'new').length,
    subscribers: subscribers.length,
    lowStock: products.filter((p) => p.active && p.stock <= 5).map(({ id, name, stock }) => ({ id, name, stock })),
    salesByDay: days.map((d) => ({
      date: d,
      total: live.filter((o) => o.createdAt.slice(0, 10) === d).reduce((s, o) => s + o.totals.total, 0),
      count: live.filter((o) => o.createdAt.slice(0, 10) === d).length,
    })),
    recentOrders: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  });
}));

const newestFirst = (rows) => rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// ---- Orders
r.get('/admin/orders', ah(async (req, res) => {
  const { status } = req.query;
  res.json(newestFirst(await collection('orders').find((o) => !status || o.status === status)));
}));

r.patch('/admin/orders/:id', ah(async (req, res) => {
  const orders = collection('orders');
  const order = await orders.findOne({ id: req.params.id });
  if (!order) throw new HttpError(404, 'Order not found');
  const patch = {};
  if (req.body.status && req.body.status !== order.status) {
    const status = oneOf(req.body.status, ORDER_STATUSES, 'Status');
    if (order.status === 'cancelled') throw new HttpError(400, 'Cancelled orders cannot be reopened');
    if (status === 'cancelled') {
      for (const line of order.items) {
        await collection('products').update({ id: line.productId }, (p) => ({ stock: p.stock + line.qty }));
      }
    }
    patch.status = status;
    patch.timeline = [...order.timeline, { status, at: new Date().toISOString(), note: str(req.body.note, 'Note', { required: false, max: 200 }) }];
  }
  if (req.body.paymentStatus) {
    patch.payment = { ...order.payment, status: oneOf(req.body.paymentStatus, ['pending', 'paid', 'refunded'], 'Payment status') };
  }
  res.json(await orders.update({ id: order.id }, patch));
}));

// ---- Bookings
r.get('/admin/bookings', ah(async (_req, res) => {
  const rows = await collection('bookings').all();
  res.json(rows.sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`)));
}));
r.patch('/admin/bookings/:id', ah(async (req, res) => {
  const row = await collection('bookings').update({ id: req.params.id }, { status: oneOf(req.body.status, BOOKING_STATUSES, 'Status') });
  if (!row) throw new HttpError(404, 'Booking not found');
  res.json(row);
}));

// ---- Enquiries & subscribers
r.get('/admin/enquiries', ah(async (_req, res) => res.json(newestFirst(await collection('enquiries').all()))));
r.patch('/admin/enquiries/:id', ah(async (req, res) => {
  const row = await collection('enquiries').update({ id: req.params.id }, { status: oneOf(req.body.status, ['new', 'contacted', 'closed'], 'Status') });
  if (!row) throw new HttpError(404, 'Enquiry not found');
  res.json(row);
}));
r.get('/admin/subscribers', ah(async (_req, res) => res.json(newestFirst(await collection('subscribers').all()))));

// ---- Products
const slugify = (s) => s.toLowerCase().replace(/["']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function productFromBody(b, existing = {}) {
  const categories = await collection('categories').all();
  const price = int(b.price, 'Price', { min: 0, max: 10_000_000 });
  const mrp = int(b.mrp ?? price, 'MRP', { min: 0, max: 10_000_000 });
  if (mrp < price) throw new HttpError(400, 'MRP cannot be less than the selling price', { field: 'mrp' });
  const name = str(b.name, 'Name', { max: 150, min: 3 });
  const images = (Array.isArray(b.images) ? b.images : String(b.images || '').split('\n'))
    .map((s) => String(s).trim())
    .filter(Boolean);
  if (images.some((u) => !/^(https?:\/\/|\/)/.test(u))) throw new HttpError(400, 'Image URLs must start with http(s):// or /', { field: 'images' });
  return {
    name,
    slug: existing.slug || slugify(name),
    categoryId: oneOf(b.categoryId, categories.map((c) => c.id), 'Category'),
    brand: str(b.brand, 'Brand', { max: 60 }),
    price,
    mrp,
    stock: int(b.stock, 'Stock', { min: 0, max: 100000 }),
    images,
    description: str(b.description, 'Description', { required: false, max: 3000 }),
    highlights: (Array.isArray(b.highlights) ? b.highlights : String(b.highlights || '').split('\n')).map((s) => String(s).trim()).filter(Boolean).slice(0, 10),
    specs: b.specs && typeof b.specs === 'object' && !Array.isArray(b.specs)
      ? Object.fromEntries(Object.entries(b.specs).slice(0, 30).map(([k, v]) => [String(k).slice(0, 60), String(v).slice(0, 200)]))
      : existing.specs || {},
    tags: (Array.isArray(b.tags) ? b.tags : []).filter((t) => ['bestseller', 'new', 'sale', 'emi'].includes(t)),
    fitment: Array.isArray(b.fitment) && b.fitment.length
      ? b.fitment
          .filter((f) => f && typeof f.make === 'string' && Array.isArray(f.models))
          .map((f) => ({ make: f.make.trim().slice(0, 40), models: f.models.map((m) => String(m).trim().slice(0, 40)).filter(Boolean) }))
      : 'universal',
    installation: { available: Boolean(b.installation?.available ?? true), charge: int(b.installation?.charge ?? 0, 'Installation charge', { min: 0, max: 100000 }) },
    active: b.active !== false,
    rating: existing.rating ?? 0,
    reviewCount: existing.reviewCount ?? 0,
  };
}

r.get('/admin/products', ah(async (_req, res) => res.json(await collection('products').all())));
r.post('/admin/products', ah(async (req, res) => {
  const products = collection('products');
  const data = await productFromBody(req.body || {});
  if (await products.findOne({ slug: data.slug })) data.slug = `${data.slug}-${Date.now().toString(36)}`;
  const all = await products.all();
  const nextNum = all.reduce((m, p) => Math.max(m, Number(p.id.replace(/\D/g, '')) || 0), 0) + 1;
  res.status(201).json(await products.insert({ id: `p${String(nextNum).padStart(3, '0')}`, ...data }));
}));
r.put('/admin/products/:id', ah(async (req, res) => {
  const products = collection('products');
  const existing = await products.findOne({ id: req.params.id });
  if (!existing) throw new HttpError(404, 'Product not found');
  res.json(await products.update({ id: existing.id }, await productFromBody(req.body || {}, existing)));
}));
r.delete('/admin/products/:id', ah(async (req, res) => {
  // Soft delete keeps old orders' product links valid.
  const row = await collection('products').update({ id: req.params.id }, { active: false });
  if (!row) throw new HttpError(404, 'Product not found');
  res.json({ ok: true });
}));

// ---- Offers
function offerFromBody(b) {
  return {
    code: str(b.code, 'Code', { max: 20, min: 3 }).toUpperCase().replace(/\s+/g, ''),
    title: str(b.title, 'Title', { max: 80 }),
    description: str(b.description, 'Description', { required: false, max: 200 }),
    type: oneOf(b.type, ['percent', 'flat'], 'Type'),
    value: int(b.value, 'Value', { min: 1, max: 1_000_000 }),
    minOrder: int(b.minOrder ?? 0, 'Minimum order', { min: 0, max: 10_000_000 }),
    maxDiscount: b.maxDiscount ? int(b.maxDiscount, 'Max discount', { min: 1, max: 10_000_000 }) : null,
    categoryIds: Array.isArray(b.categoryIds) ? b.categoryIds : [],
    validTill: str(b.validTill, 'Valid till', { required: false, max: 10 }) || null,
    active: b.active !== false,
    accent: ['red', 'dark', 'steel'].includes(b.accent) ? b.accent : 'red',
  };
}
r.get('/admin/offers', ah(async (_req, res) => res.json(await collection('offers').all())));
r.post('/admin/offers', ah(async (req, res) => {
  const data = offerFromBody(req.body || {});
  if (data.type === 'percent' && data.value > 90) throw new HttpError(400, 'Percent discount must be 90 or less');
  if (await collection('offers').findOne({ code: data.code })) throw new HttpError(409, 'That code already exists');
  res.status(201).json(await collection('offers').insert(data));
}));
r.put('/admin/offers/:id', ah(async (req, res) => {
  const row = await collection('offers').update({ id: req.params.id }, offerFromBody(req.body || {}));
  if (!row) throw new HttpError(404, 'Offer not found');
  res.json(row);
}));
r.delete('/admin/offers/:id', ah(async (req, res) => {
  if (!(await collection('offers').remove({ id: req.params.id }))) throw new HttpError(404, 'Offer not found');
  res.json({ ok: true });
}));

export default r;
