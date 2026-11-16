import { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, PackageSearch, Wrench, MapPin, Store, Car, Calendar, MessageCircle, Search } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { inr, fmtDate, fmtDateTime, STATUS_LABEL, PAYMENT_LABEL, waLink } from '../lib/format';
import { Img, Spinner, StatusChip } from '../components/ui';

const FLOW = {
  delivery: ['placed', 'confirmed', 'shipped', 'completed'],
  pickup: ['placed', 'confirmed', 'ready', 'completed'],
  'studio-install': ['placed', 'confirmed', 'ready', 'completed'],
};
const FLOW_LABEL = { placed: 'Placed', confirmed: 'Confirmed', shipped: 'Shipped', ready: 'Ready', completed: 'Delivered' };

export function OrderView({ order }) {
  const steps = FLOW[order.fulfilment] || FLOW.delivery;
  const cancelled = order.status === 'cancelled';
  const reached = steps.indexOf(order.status);

  return (
    <div className="order-view">
      <div className="card card-pad">
        <div className="row-between" style={{ flexWrap: 'wrap' }}>
          <div>
            <span className="muted tiny">Order ID</span>
            <h3 className="order-id">{order.orderId}</h3>
            <span className="muted tiny">Placed {fmtDateTime(order.createdAt)}</span>
          </div>
          <StatusChip status={order.status} label={STATUS_LABEL[order.status]} />
        </div>

        {!cancelled && (
          <ol className="progress">
            {steps.map((s, i) => (
              <li key={s} className={i <= reached ? 'done' : ''}>
                <span className="progress-dot">{i <= reached ? <CheckCircle2 size={16} /> : i + 1}</span>
                <span>{s === 'completed' && order.fulfilment !== 'delivery' ? 'Completed' : FLOW_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="order-meta">
          {order.fulfilment === 'studio-install' && order.installation && (
            <div><Wrench size={18} /><span><strong>Studio fitment</strong>{fmtDate(order.installation.date, { weekday: 'short', day: 'numeric', month: 'short' })} at {order.installation.slot}</span></div>
          )}
          {order.fulfilment === 'delivery' && order.address && (
            <div><MapPin size={18} /><span><strong>Delivering to</strong>{order.address.line1}, {order.address.city} - {order.address.pincode}</span></div>
          )}
          {order.fulfilment === 'pickup' && (
            <div><Store size={18} /><span><strong>Store pickup</strong>We'll call when it's ready</span></div>
          )}
          {order.vehicle && (
            <div><Car size={18} /><span><strong>Vehicle</strong>{order.vehicle.make} {order.vehicle.model} {order.vehicle.regNo}</span></div>
          )}
          <div><Calendar size={18} /><span><strong>Payment</strong>{PAYMENT_LABEL[order.payment.method]} ({order.payment.status})</span></div>
        </div>
      </div>

      <div className="card card-pad">
        <h4 style={{ marginBottom: 12 }}>Items</h4>
        {order.items.map((i) => (
          <div key={i.productId} className="sum-item">
            <span className="sum-thumb"><Img src={i.image} alt="" /><em>{i.qty}</em></span>
            <span className="grow"><Link to={`/product/${i.slug}`}>{i.name}</Link>{i.install && <small><Wrench size={11} /> with fitment</small>}</span>
            <strong>{inr(i.lineTotal)}</strong>
          </div>
        ))}
        <dl className="totals" style={{ marginTop: 12 }}>
          <div><dt>Subtotal</dt><dd>{inr(order.totals.subtotal)}</dd></div>
          {order.totals.discount > 0 && <div className="green"><dt>Coupon {order.coupon?.code}</dt><dd>-{inr(order.totals.discount)}</dd></div>}
          {order.totals.installation > 0 && <div><dt>Fitment</dt><dd>{inr(order.totals.installation)}</dd></div>}
          <div><dt>Delivery</dt><dd>{order.totals.shipping ? inr(order.totals.shipping) : 'FREE'}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{inr(order.totals.total)}</dd></div>
        </dl>
      </div>

      {order.timeline?.length > 0 && (
        <div className="card card-pad">
          <h4 style={{ marginBottom: 12 }}>Updates</h4>
          <ul className="timeline">
            {[...order.timeline].reverse().map((t, i) => (
              <li key={i}>
                <strong>{STATUS_LABEL[t.status] || t.status}</strong>
                <span className="muted tiny">{fmtDateTime(t.at)}</span>
                {t.note && <p className="muted">{t.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function OrderSuccess() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const { settings } = useStore();
  const order = state?.order;

  return (
    <div className="container section success">
      <div className="success-head">
        <span className="success-icon"><CheckCircle2 size={44} /></span>
        <h1 className="display">Order placed!</h1>
        <p className="muted">
          Thank you{order ? `, ${order.customer.name.split(' ')[0]}` : ''}. Your order <strong>{orderId}</strong> is confirmed.
          We'll call you shortly{order?.payment.method === 'emi' ? ' to set up your EMI' : ''}.
        </p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/track-order?orderId=${orderId}${order ? `&phone=${order.customer.phone}` : ''}`} className="btn btn-dark"><PackageSearch size={17} /> Track order</Link>
          <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
          {settings?.whatsapp && (
            <a className="btn btn-green" target="_blank" rel="noreferrer" href={waLink(settings.whatsapp, `Hi! I just placed order ${orderId}.`)}><MessageCircle size={17} /> WhatsApp us</a>
          )}
        </div>
      </div>
      {order && <OrderView order={order} />}
    </div>
  );
}

export function TrackOrder() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ orderId: params.get('orderId') || '', phone: params.get('phone') || '' });
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    setOrder(null);
    try {
      setOrder(await api.get(`/orders/track${qs(form)}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="slash-tag">Order status</span>
          <h1 className="display">Track your order</h1>
          <p>Enter the Order ID from your confirmation and the mobile number you ordered with.</p>
        </div>
      </section>
      <div className="container section-sm narrow">
        <form className="card card-pad track-form" onSubmit={submit}>
          <label className="field"><span>Order ID</span><input className="input" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} placeholder="AA2611161234" required /></label>
          <label className="field"><span>Mobile number</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" required /></label>
          <button className="btn btn-red" disabled={busy}>{busy ? <Spinner /> : <Search size={17} />} Track</button>
        </form>
        {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
        {order && <div style={{ marginTop: 24 }}><OrderView order={order} /></div>}
      </div>
    </>
  );
}
