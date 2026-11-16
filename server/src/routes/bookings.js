import { Router } from 'express';
import crypto from 'node:crypto';
import { collection, getSettings } from '../db/jsonStore.js';
import { ah, HttpError, str, phone, email } from '../utils/http.js';
import { slotsFor, assertSlotFree } from '../utils/slots.js';

const r = Router();

export const BOOKING_STATUSES = ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];

r.get('/bookings/slots', ah(async (req, res) => {
  res.json({ date: req.query.date, slots: await slotsFor(String(req.query.date || '')) });
}));

r.post('/bookings', ah(async (req, res) => {
  const b = req.body || {};
  const settings = await getSettings();
  const service = settings.services.find((s) => s.id === b.serviceId);
  if (!service) throw new HttpError(400, 'Choose a service', { field: 'serviceId' });

  const date = str(b.date, 'Date', { max: 10 });
  const slot = str(b.slot, 'Time slot', { max: 12 });
  await assertSlotFree(date, slot);

  const booking = await collection('bookings').insert({
    bookingId: `BK${crypto.randomInt(100000, 999999)}`,
    status: 'requested',
    service: { id: service.id, name: service.name, price: service.price },
    date,
    slot,
    customer: {
      name: str(b.name, 'Name', { max: 80, min: 2 }),
      phone: phone(b.phone),
      email: email(b.email),
    },
    vehicle: {
      make: str(b.make, 'Car make', { max: 40 }),
      model: str(b.model, 'Car model', { max: 40 }),
      regNo: str(b.regNo, 'Registration number', { required: false, max: 15 }).toUpperCase(),
    },
    notes: str(b.notes, 'Notes', { required: false, max: 500 }),
  });
  res.status(201).json(booking);
}));

r.post('/enquiries', ah(async (req, res) => {
  const b = req.body || {};
  const enquiry = await collection('enquiries').insert({
    type: ['contact', 'product', 'bulk', 'emi'].includes(b.type) ? b.type : 'contact',
    status: 'new',
    name: str(b.name, 'Name', { max: 80, min: 2 }),
    phone: phone(b.phone),
    email: email(b.email),
    subject: str(b.subject, 'Subject', { required: false, max: 120 }),
    message: str(b.message, 'Message', { max: 1500, min: 5 }),
    productId: b.productId ? str(b.productId, 'Product', { max: 20 }) : null,
  });
  res.status(201).json({ id: enquiry.id, ok: true });
}));

r.post('/newsletter', ah(async (req, res) => {
  const e = email(req.body?.email, { required: true });
  const subs = collection('subscribers');
  if (!(await subs.findOne({ email: e }))) await subs.insert({ email: e });
  res.status(201).json({ ok: true });
}));

export default r;
