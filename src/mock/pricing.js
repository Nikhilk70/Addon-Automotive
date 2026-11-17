import { collection, getSettings } from './store.js';
import { HttpError, int } from './http.js';

const today = () => new Date().toISOString().slice(0, 10);

export function fitsVehicle(product, make, model) {
  if (!make || !model) return null;
  if (product.fitment === 'universal') return true;
  return (product.fitment || []).some((f) => f.make === make && f.models.includes(model));
}

/** Returns { discount, offer } or throws a 400 explaining why the code can't be used. */
export async function applyCoupon(code, lines) {
  if (!code) return { discount: 0, offer: null };
  const offer = await collection('offers').findOne((o) => o.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!offer || !offer.active) throw new HttpError(400, 'This coupon code is not valid', { field: 'coupon' });
  if (offer.validTill && offer.validTill < today()) throw new HttpError(400, 'This coupon has expired', { field: 'coupon' });

  const eligible = lines
    .filter((l) => !offer.categoryIds?.length || offer.categoryIds.includes(l.categoryId))
    .reduce((s, l) => s + l.lineTotal, 0);
  if (eligible === 0) throw new HttpError(400, 'This coupon does not apply to the items in your cart', { field: 'coupon' });
  if (eligible < (offer.minOrder || 0)) {
    throw new HttpError(400, `Add items worth Rs. ${(offer.minOrder - eligible).toLocaleString('en-IN')} more to use ${offer.code}`, { field: 'coupon' });
  }
  let discount = offer.type === 'percent' ? Math.round((eligible * offer.value) / 100) : offer.value;
  if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount);
  return { discount: Math.min(discount, eligible), offer };
}

/**
 * Prices a cart from the catalogue - never trusts prices sent by the browser.
 * items: [{ productId, qty, install }]
 */
export async function quote({ items, coupon, fulfilment = 'delivery' }) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your cart is empty');
  if (items.length > 30) throw new HttpError(400, 'Too many items in one order');
  const settings = await getSettings();
  const products = collection('products');

  const lines = [];
  for (const item of items) {
    const p = await products.findOne({ id: String(item.productId) });
    if (!p || !p.active) throw new HttpError(400, 'A product in your cart is no longer available', { productId: item.productId });
    const qty = int(item.qty, 'Quantity', { min: 1, max: 10 });
    if (qty > p.stock) throw new HttpError(400, `Only ${p.stock} left of "${p.name}"`, { productId: p.id });
    const install = Boolean(item.install) && p.installation?.available;
    lines.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images?.[0] || '',
      categoryId: p.categoryId,
      price: p.price,
      mrp: p.mrp,
      qty,
      install,
      installCharge: install ? p.installation.charge * qty : 0,
      lineTotal: p.price * qty,
    });
  }

  const needsInstall = lines.some((l) => l.install);
  const effectiveFulfilment = needsInstall ? 'studio-install' : fulfilment;
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.mrp * l.qty, 0);
  const installationTotal = lines.reduce((s, l) => s + l.installCharge, 0);
  const { discount, offer } = await applyCoupon(coupon, lines);
  const shipping =
    effectiveFulfilment === 'delivery' && subtotal - discount < settings.freeShippingAbove ? settings.shippingFee : 0;

  return {
    lines,
    needsInstall,
    fulfilment: effectiveFulfilment,
    coupon: offer ? { code: offer.code, title: offer.title } : null,
    totals: {
      mrpTotal,
      subtotal,
      savings: mrpTotal - subtotal + discount,
      discount,
      installation: installationTotal,
      shipping,
      total: subtotal - discount + installationTotal + shipping,
    },
  };
}
