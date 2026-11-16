import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, CalendarCheck, Inbox, AlertTriangle, Users, X, Phone, MessageCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { inr, fmtDate, fmtDateTime, STATUS_LABEL, PAYMENT_LABEL, waLink } from '../../lib/format';
import { Img, StatusChip, Spinner } from '../../components/ui';

/** Small data hook for admin screens. */
export function useAdmin(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setError('');
    api.get(path, { admin: true }).then(setData).catch((e) => setError(e.message));
  }, [path]);
  useEffect(() => { reload(); }, [reload]);
  return { data, setData, error, reload };
}

export function PageHead({ title, children }) {
  return (
    <div className="admin-head">
      <h1>{title}</h1>
      <div className="row">{children}</div>
    </div>
  );
}

export function Dashboard() {
  const { data: s, error, reload } = useAdmin('/admin/stats');
  if (error) return <div className="form-error">{error}</div>;
  if (!s) return <Spinner />;
  const max = Math.max(1, ...s.salesByDay.map((d) => d.total));

  const cards = [
    { icon: IndianRupee, label: 'Revenue (all time)', value: inr(s.revenue) },
    { icon: ShoppingCart, label: 'Open orders', value: s.openOrders, sub: `${s.orders} total`, to: '/admin/orders' },
    { icon: CalendarCheck, label: 'Upcoming bookings', value: s.upcomingBookings, to: '/admin/bookings' },
    { icon: Inbox, label: 'New enquiries', value: s.newEnquiries, to: '/admin/enquiries' },
    { icon: Users, label: 'Subscribers', value: s.subscribers },
  ];

  return (
    <>
      <PageHead title="Dashboard"><button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /> Refresh</button></PageHead>
      <div className="stat-grid">
        {cards.map(({ icon: Icon, label, value, sub, to }) => {
          const inner = (<><span className="stat-icon"><Icon size={20} /></span><div><small>{label}</small><strong>{value}</strong>{sub && <em>{sub}</em>}</div></>);
          return to ? <Link key={label} to={to} className="stat card">{inner}</Link> : <div key={label} className="stat card">{inner}</div>;
        })}
      </div>

      <div className="admin-two">
        <div className="card card-pad">
          <h3 className="admin-h3">Sales - last 7 days</h3>
          <div className="bars" role="img" aria-label="Sales by day for the last 7 days">
            {s.salesByDay.map((d) => (
              <div key={d.date} className="bar-col">
                <span className="bar-val">{d.total ? inr(d.total) : ''}</span>
                <div className="bar" style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} title={`${d.count} orders, ${inr(d.total)}`} />
                <span className="bar-label">{fmtDate(d.date, { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="admin-h3"><AlertTriangle size={17} className="red" /> Low stock</h3>
          {s.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : (
            <ul className="mini-list">
              {s.lowStock.map((p) => <li key={p.id}><span>{p.name}</span><StatusChip status={p.stock === 0 ? 'cancelled' : 'ready'} label={`${p.stock} left`} /></li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <div className="row-between"><h3 className="admin-h3">Recent orders</h3><Link to="/admin/orders" className="link tiny">View all</Link></div>
        {s.recentOrders.length === 0 ? <p className="muted">No orders yet. Place a test order from the store to see it here.</p> : (
          <OrdersTable orders={s.recentOrders} />
        )}
      </div>
    </>
  );
}

function OrdersTable({ orders, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Order</th><th>Customer</th><th>Type</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} onClick={() => onOpen?.(o)} className={onOpen ? 'clickable' : ''}>
              <td><strong>{o.orderId}</strong></td>
              <td>{o.customer.name}<br /><span className="muted tiny">{o.customer.phone}</span></td>
              <td>{o.fulfilment === 'studio-install' ? `Fitment ${o.installation ? fmtDate(o.installation.date, { day: 'numeric', month: 'short' }) : ''}` : o.fulfilment}</td>
              <td><strong>{inr(o.totals.total)}</strong></td>
              <td><span className="tiny">{PAYMENT_LABEL[o.payment.method]}</span><br /><StatusChip status={o.payment.status} /></td>
              <td><StatusChip status={o.status} label={STATUS_LABEL[o.status]} /></td>
              <td className="muted tiny">{fmtDateTime(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ORDER_STATUSES = ['placed', 'confirmed', 'ready', 'shipped', 'completed', 'cancelled'];

function OrderPanel({ order, onClose, onSaved }) {
  const { toast, settings } = useStore();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (patch) => {
    setBusy(true);
    try {
      const updated = await api.patch(`/admin/orders/${order.id}`, patch, { admin: true });
      onSaved(updated);
      setNote('');
      toast('Order updated');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="side-panel">
      <div className="side-panel-backdrop" onClick={onClose} />
      <aside className="side-panel-body">
        <div className="row-between"><h3>{order.orderId}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="stack">
          <div className="kv"><span>Customer</span><strong>{order.customer.name}</strong></div>
          <div className="kv"><span>Phone</span>
            <span className="row" style={{ gap: 8 }}>
              <a className="link" href={`tel:${order.customer.phone}`}><Phone size={14} /> {order.customer.phone}</a>
              <a className="link" target="_blank" rel="noreferrer" href={waLink(`91${order.customer.phone}`, `Hi ${order.customer.name}, this is ${settings?.storeName || 'Addon Automotive'} about your order ${order.orderId}.`)}><MessageCircle size={14} /> WhatsApp</a>
            </span>
          </div>
          {order.customer.email && <div className="kv"><span>Email</span><span>{order.customer.email}</span></div>}
          {order.vehicle && <div className="kv"><span>Vehicle</span><span>{order.vehicle.make} {order.vehicle.model} {order.vehicle.regNo}</span></div>}
          {order.installation && <div className="kv"><span>Fitment slot</span><strong>{fmtDate(order.installation.date, { weekday: 'short', day: 'numeric', month: 'short' })} {order.installation.slot}</strong></div>}
          {order.address && <div className="kv"><span>Address</span><span>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}</span></div>}
          {order.notes && <div className="kv"><span>Notes</span><span>{order.notes}</span></div>}
        </div>
        <div className="panel-items">
          {order.items.map((i) => (
            <div key={i.productId} className="sum-item">
              <span className="sum-thumb"><Img src={i.image} alt="" /><em>{i.qty}</em></span>
              <span className="grow">{i.name}{i.install && <small>+ fitment</small>}</span>
              <strong>{inr(i.lineTotal)}</strong>
            </div>
          ))}
          <div className="row-between" style={{ marginTop: 8 }}><span className="muted">Total{order.coupon ? ` (coupon ${order.coupon.code})` : ''}</span><strong>{inr(order.totals.total)}</strong></div>
        </div>

        <div className="card card-pad stack">
          <label className="field"><span>Order status</span>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={order.status === 'cancelled'}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <input className="input" placeholder="Note for customer (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-dark" disabled={busy || status === order.status} onClick={() => save({ status, note })}>Update status</button>
          {status === 'cancelled' && order.status !== 'cancelled' && <p className="muted tiny">Cancelling returns the items to stock.</p>}
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className="muted tiny">Payment: {PAYMENT_LABEL[order.payment.method]}</span>
          {['pending', 'paid', 'refunded'].map((p) => (
            <button key={p} className={`btn btn-sm ${order.payment.status === p ? 'btn-dark' : 'btn-outline'}`} disabled={busy} onClick={() => save({ paymentStatus: p })}>{p}</button>
          ))}
        </div>
        <ul className="timeline">
          {[...order.timeline].reverse().map((t, i) => (
            <li key={i}><strong>{STATUS_LABEL[t.status]}</strong><span className="muted tiny">{fmtDateTime(t.at)}</span>{t.note && <span className="muted">{t.note}</span>}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export function OrdersAdmin() {
  const [status, setStatus] = useState('');
  const { data, setData, error, reload } = useAdmin(`/admin/orders${status ? `?status=${status}` : ''}`);
  const [open, setOpen] = useState(null);
  return (
    <>
      <PageHead title="Orders"><button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /> Refresh</button></PageHead>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {['', ...ORDER_STATUSES].map((s) => (
          <button key={s} className={`tab ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>{s ? STATUS_LABEL[s] : 'All'}</button>
        ))}
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="card">
        {!data ? <div className="card-pad"><Spinner /></div> : data.length === 0 ? <p className="card-pad muted">No orders here yet.</p> : (
          <OrdersTable orders={data} onOpen={setOpen} />
        )}
      </div>
      {open && (
        <OrderPanel
          key={open.id + open.updatedAt}
          order={open}
          onClose={() => setOpen(null)}
          onSaved={(u) => { setOpen(u); setData((rows) => rows.map((r) => (r.id === u.id ? u : r))); }}
        />
      )}
    </>
  );
}

const BOOKING_STATUSES = ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];

export function BookingsAdmin() {
  const { data, setData, error, reload } = useAdmin('/admin/bookings');
  const { toast } = useStore();
  const [showPast, setShowPast] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const setStatus = async (b, status) => {
    try {
      const u = await api.patch(`/admin/bookings/${b.id}`, { status }, { admin: true });
      setData((rows) => rows.map((r) => (r.id === u.id ? u : r)));
      toast('Booking updated');
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  const rows = (data || []).filter((b) => showPast || b.date >= today);

  return (
    <>
      <PageHead title="Installation bookings">
        <label className="check"><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> Show past</label>
        <button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /> Refresh</button>
      </PageHead>
      <p className="muted tiny" style={{ marginBottom: 12 }}>Orders with studio fitment appear under Orders. This list holds service-only bookings.</p>
      {error && <div className="form-error">{error}</div>}
      <div className="card">
        {!data ? <div className="card-pad"><Spinner /></div> : rows.length === 0 ? <p className="card-pad muted">No bookings yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>When</th><th>Service</th><th>Customer</th><th>Vehicle</th><th>Notes</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })}</strong><br /><span className="muted tiny">{b.slot}</span></td>
                    <td>{b.service.name}<br /><span className="muted tiny">{b.bookingId}</span></td>
                    <td>{b.customer.name}<br /><a className="link tiny" href={`tel:${b.customer.phone}`}>{b.customer.phone}</a></td>
                    <td>{b.vehicle.make} {b.vehicle.model}<br /><span className="muted tiny">{b.vehicle.regNo}</span></td>
                    <td className="tiny" style={{ maxWidth: 220 }}>{b.notes || '-'}</td>
                    <td>
                      <select className="select select-sm" value={b.status} onChange={(e) => setStatus(b, e.target.value)}>
                        {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export function EnquiriesAdmin() {
  const { data, setData, error } = useAdmin('/admin/enquiries');
  const subs = useAdmin('/admin/subscribers');
  const { toast } = useStore();
  const setStatus = async (e, status) => {
    try {
      const u = await api.patch(`/admin/enquiries/${e.id}`, { status }, { admin: true });
      setData((rows) => rows.map((r) => (r.id === u.id ? u : r)));
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  return (
    <>
      <PageHead title="Enquiries" />
      {error && <div className="form-error">{error}</div>}
      <div className="enq-list">
        {!data ? <Spinner /> : data.length === 0 ? <div className="card card-pad muted">No enquiries yet.</div> : data.map((e) => (
          <div key={e.id} className="card card-pad enq">
            <div className="row-between" style={{ flexWrap: 'wrap' }}>
              <div className="row"><strong>{e.name}</strong><span className="chip">{e.type}</span><StatusChip status={e.status} label={STATUS_LABEL[e.status]} /></div>
              <span className="muted tiny">{fmtDateTime(e.createdAt)}</span>
            </div>
            <p>{e.message}</p>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <a className="link tiny" href={`tel:${e.phone}`}><Phone size={13} /> {e.phone}</a>
              {e.email && <a className="link tiny" href={`mailto:${e.email}`}>{e.email}</a>}
              <span className="grow" />
              {['new', 'contacted', 'closed'].map((s) => (
                <button key={s} className={`btn btn-sm ${e.status === s ? 'btn-dark' : 'btn-outline'}`} onClick={() => setStatus(e, s)}>{STATUS_LABEL[s]}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="card card-pad" style={{ marginTop: 24 }}>
        <h3 className="admin-h3">Newsletter subscribers ({subs.data?.length ?? 0})</h3>
        <p className="tiny muted" style={{ wordBreak: 'break-all' }}>{subs.data?.map((s) => s.email).join(', ') || 'None yet.'}</p>
      </div>
    </>
  );
}
