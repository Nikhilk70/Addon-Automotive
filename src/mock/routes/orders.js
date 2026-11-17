import { Router } from '../router.js';
import { randomInt } from '../store.js';
import { collection } from '../store.js';
import { ah, HttpError, str, phone, email, pincode, oneOf, normalisePhone } from '../http.js';
import { quote } from '../pricing.js';
import { assertSlotFree } from '../slots.js';

const r = Router();

export const ORDER_STATUSES = ['placed', 'confirmed', 'ready', 'shipped', 'completed', 'cancelled'];
const PAYMENT_METHODS = ['cod', 'pay-at-store', 'emi'];

async function newOrderId() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  for (;;) {
    const id = `AA${stamp}${randomInt(1000, 9999)}`;
    if (!(await collection('orders').findOne({ orderId: id }))) return id;
  }
}

/** Live cart pricing for the cart drawer / checkout (coupon, shipping, installation). */
r.post('/cart/quote', ah(async (req, res) => {
  res.json(await quote(req.body || {}));
}));

r.post('/orders', ah(async (req, res) => {
  const b = req.body || {};
  const priced = await quote({ items: b.items, coupon: b.coupon, fulfilment: oneOf(b.fulfilment || 'delivery', ['delivery', 'pickup'], 'Fulfilment') });

  const customer = {
    name: str(b.customer?.name, 'Name', { max: 80, min: 2 }),
    phone: phone(b.customer?.phone),
    email: email(b.customer?.email),
  };

  let address = null;
  if (priced.fulfilment === 'delivery') {
    address = {
      line1: str(b.address?.line1, 'Address', { max: 200, min: 5 }),
      line2: str(b.address?.line2, 'Landmark', { required: false, max: 200 }),
      city: str(b.address?.city, 'City', { max: 60 }),
      state: str(b.address?.state, 'State', { max: 60 }),
      pincode: pincode(b.address?.pincode),
    };
  }

  const vehicle = b.vehicle?.make
    ? { make: str(b.vehicle.make, 'Car make', { max: 40 }), model: str(b.vehicle.model, 'Car model', { max: 40 }), regNo: str(b.vehicle.regNo, 'Registration number', { required: false, max: 15 }).toUpperCase() }
    : null;

  let installation = null;
  if (priced.needsInstall) {
    if (!vehicle) throw new HttpError(400, 'Tell us your car so we can prepare for the fitment', { field: 'vehicle' });
    const date = str(b.installation?.date, 'Installation date', { max: 10 });
    const slot = str(b.installation?.slot, 'Installation slot', { max: 12 });
    await assertSlotFree(date, slot);
    installation = { date, slot };
  }

  const paymentMethod = oneOf(b.paymentMethod || 'cod', PAYMENT_METHODS, 'Payment method');

  // Reserve stock.
  const products = collection('products');
  for (const line of priced.lines) {
    await products.update({ id: line.productId }, (p) => ({ stock: Math.max(0, p.stock - line.qty) }));
  }

  const order = await collection('orders').insert({
    orderId: await newOrderId(),
    status: 'placed',
    timeline: [{ status: 'placed', at: new Date().toISOString(), note: 'Order received' }],
    items: priced.lines,
    totals: priced.totals,
    coupon: priced.coupon,
    fulfilment: priced.fulfilment,
    customer,
    address,
    vehicle,
    installation,
    payment: { method: paymentMethod, status: 'pending' },
    notes: str(b.notes, 'Notes', { required: false, max: 500 }),
  });
  res.status(201).json(order);
}));

r.get('/orders/track', ah(async (req, res) => {
  const orderId = str(req.query.orderId, 'Order ID', { max: 20 }).toUpperCase();
  const ph = normalisePhone(req.query.phone);
  const order = await collection('orders').findOne((o) => o.orderId === orderId && o.customer.phone === ph);
  if (!order) throw new HttpError(404, 'No order found with that Order ID and phone number');
  res.json(order);
}));

export default r;
