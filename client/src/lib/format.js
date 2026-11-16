const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const inr = (n) => inrFmt.format(Number(n) || 0);

export const discountPct = (price, mrp) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('en-IN', opts);

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const emiFrom = (price, months = 9) => Math.ceil(price / months);

export const isoDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fitsVehicle = (product, garage) => {
  if (!garage?.make || !garage?.model) return null;
  if (product.fitment === 'universal') return true;
  return (product.fitment || []).some((f) => f.make === garage.make && f.models.includes(garage.model));
};

export const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const STATUS_LABEL = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  ready: 'Ready for pickup / fitment',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  requested: 'Requested',
  'in-progress': 'In progress',
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

export const PAYMENT_LABEL = { cod: 'Cash / UPI on delivery', 'pay-at-store': 'Pay at studio', emi: 'EMI (Bajaj Finserv)' };
