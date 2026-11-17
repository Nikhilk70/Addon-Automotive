import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Store, Wrench, Tag, X, Lock, ShoppingBag, Banknote, CreditCard, Building2, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { inr } from '../lib/format';
import { Img, QtyStepper, Spinner } from '../components/ui';
import SlotPicker from '../components/SlotPicker';

const STATES = ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Goa', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Odisha', 'Bihar', 'Other'];

/** Server-priced summary used by both the cart page and checkout. */
function useQuote(payload, coupon, fulfilment) {
  const [quote, setQuote] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [error, setError] = useState('');
  const key = JSON.stringify([payload, coupon, fulfilment]);

  useEffect(() => {
    if (!payload.length) {
      setQuote(null);
      return undefined;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setQuote(await api.post('/cart/quote', { items: payload, coupon, fulfilment }, { signal: ctrl.signal }));
        setCouponError('');
        setError('');
      } catch (e) {
        if (e.name === 'AbortError') return;
        if (e.data?.field === 'coupon') {
          setCouponError(e.message);
          // Re-price without the coupon so the summary stays useful.
          api.post('/cart/quote', { items: payload, fulfilment }).then(setQuote).catch(() => {});
        } else setError(e.message);
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, couponError, error };
}

export function Summary({ quote, couponState, children }) {
  const { coupon, setCoupon } = useCart();
  const [code, setCode] = useState(coupon);
  useEffect(() => { setCode(coupon); }, [coupon]);
  const t = quote?.totals;
  const applied = quote?.coupon;

  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      {couponState && (
        <div className="coupon-box">
          {applied ? (
            <div className="coupon-applied">
              <Tag size={16} />
              <span className="grow"><strong>{applied.code}</strong> applied<small>{applied.title}</small></span>
              <button className="icon-btn" onClick={() => setCoupon('')} aria-label="Remove coupon"><X size={16} /></button>
            </div>
          ) : (
            <form className="row" onSubmit={(e) => { e.preventDefault(); setCoupon(code.trim().toUpperCase()); }}>
              <input className="input" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" />
              <button className="btn btn-dark" type="submit">Apply</button>
            </form>
          )}
          {couponState.couponError && coupon && <p className="coupon-err">{couponState.couponError}</p>}
          {!applied && <Link to="/offers" className="link tiny">See available coupons</Link>}
        </div>
      )}
      {!t ? (
        <div className="stack"><div className="skeleton" style={{ height: 120 }} /></div>
      ) : (
        <dl className="totals">
          <div><dt>MRP total</dt><dd>{inr(t.mrpTotal)}</dd></div>
          <div className="green"><dt>Product discount</dt><dd>-{inr(t.mrpTotal - t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="green"><dt>Coupon ({applied?.code})</dt><dd>-{inr(t.discount)}</dd></div>}
          {t.installation > 0 && <div><dt>Studio fitment</dt><dd>{inr(t.installation)}</dd></div>}
          <div><dt>{quote.fulfilment === 'delivery' ? 'Delivery' : quote.fulfilment === 'pickup' ? 'Store pickup' : 'Fitment at studio'}</dt><dd>{t.shipping ? inr(t.shipping) : 'FREE'}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{inr(t.total)}</dd></div>
          <p className="saving">You save {inr(t.savings)} on this order</p>
        </dl>
      )}
      {children}
    </aside>
  );
}

export function CartPage() {
  const { items, update, remove, payload, coupon } = useCart();
  const navigate = useNavigate();
  const q = useQuote(payload, coupon, 'delivery');

  if (!items.length) {
    return (
      <div className="container section">
        <div className="empty card">
          <ShoppingBag size={48} />
          <h3>Your cart is empty</h3>
          <p className="muted">Browse stereos, lights, seat covers and more.</p>
          <Link to="/shop" className="btn btn-red">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="page-hero"><div className="container"><h1 className="display">Your cart</h1></div></section>
      <div className="container checkout">
        <div className="card">
          {items.map((i) => (
            <div className="cart-row" key={i.productId}>
              <Link to={`/product/${i.slug}`} className="citem-img"><Img src={i.image} alt={i.name} /></Link>
              <div className="grow stack" style={{ minWidth: 0 }}>
                <Link to={`/product/${i.slug}`} className="citem-name">{i.name}</Link>
                <span className="muted tiny">{i.brand} | {inr(i.price)} each</span>
                {i.installAvailable && (
                  <label className="check install-toggle">
                    <input type="checkbox" checked={i.install} onChange={(e) => update(i.productId, { install: e.target.checked })} />
                    <Wrench size={13} /> Studio fitment {i.installCharge ? `+${inr(i.installCharge)} each` : '(free)'}
                  </label>
                )}
              </div>
              <QtyStepper small value={i.qty} max={Math.min(10, i.stock ?? 10)} onChange={(qty) => update(i.productId, { qty })} />
              <strong className="cart-line-total">{inr(i.price * i.qty)}</strong>
              <button className="icon-btn citem-remove" onClick={() => remove(i.productId)} aria-label={`Remove ${i.name}`}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <Summary quote={q.quote} couponState={q}>
          {q.error && <div className="form-error">{q.error}</div>}
          <button className="btn btn-red btn-lg btn-block" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </Summary>
      </div>
    </>
  );
}

export default function Checkout() {
  const { items, payload, coupon, clear } = useCart();
  const { garage, vehicles, settings } = useStore();
  const navigate = useNavigate();
  const needsInstall = items.some((i) => i.install);

  const [fulfilment, setFulfilment] = useState('delivery');
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: 'Kerala', pincode: '',
    make: garage?.make || '', model: garage?.model || '', regNo: '',
    paymentMethod: 'cod', notes: '',
  });
  const [slot, setSlot] = useState({ date: '', slot: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const q = useQuote(payload, coupon, fulfilment);
  const mode = needsInstall ? 'studio-install' : fulfilment;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const models = vehicles.find((v) => v.make === form.make)?.models || [];

  if (!items.length) {
    return (
      <div className="container section">
        <div className="empty card">
          <ShoppingBag size={48} />
          <h3>Nothing to check out yet</h3>
          <Link to="/shop" className="btn btn-red">Go shopping</Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (needsInstall && (!slot.date || !slot.slot)) return setError('Please choose a date and time for your fitment.');
    setBusy(true);
    try {
      const order = await api.post('/orders', {
        items: payload,
        coupon: q.couponError ? '' : coupon,
        fulfilment,
        customer: { name: form.name, phone: form.phone, email: form.email },
        address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        vehicle: form.make && form.model ? { make: form.make, model: form.model, regNo: form.regNo } : null,
        installation: needsInstall ? slot : null,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      clear();
      navigate(`/order/${order.orderId}`, { state: { order } });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  };

  const payOptions = [
    { id: 'cod', icon: Banknote, title: mode === 'delivery' ? 'Cash / UPI on delivery' : 'Cash / UPI at the studio', text: 'Pay when you receive your order' },
    { id: 'pay-at-store', icon: Building2, title: 'Pay at studio by card', text: 'Credit / debit cards accepted in store' },
    { id: 'emi', icon: CreditCard, title: `EMI with ${settings?.emiPartner || 'Bajaj Finserv'}`, text: 'Our team will call to set up your EMI' },
  ];

  return (
    <>
      <section className="page-hero"><div className="container"><h1 className="display">Checkout</h1><p>Secure checkout. No payment taken online - pay on delivery, at the studio, or on EMI.</p></div></section>
      <form className="container checkout" onSubmit={submit}>
        <div className="stack" style={{ gap: 20 }}>
          {error && <div className="form-error">{error}</div>}

          <fieldset className="card card-pad co-step">
            <legend><span>1</span> Contact details</legend>
            <div className="form-grid">
              <label className="field"><span>Full name</span><input className="input" value={form.name} onChange={set('name')} required autoComplete="name" /></label>
              <label className="field"><span>Mobile number</span><input className="input" value={form.phone} onChange={set('phone')} required inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" /></label>
              <label className="field full"><span>Email (optional)</span><input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
            </div>
          </fieldset>

          <fieldset className="card card-pad co-step">
            <legend><span>2</span> Your car {needsInstall ? '' : <em>(optional)</em>}</legend>
            <div className="form-grid">
              <label className="field"><span>Brand</span>
                <select className="select" value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value, model: '' }))} required={needsInstall}>
                  <option value="">Select brand</option>
                  {vehicles.map((v) => <option key={v.make}>{v.make}</option>)}
                </select>
              </label>
              <label className="field"><span>Model</span>
                <select className="select" value={form.model} onChange={set('model')} disabled={!form.make} required={needsInstall}>
                  <option value="">Select model</option>
                  {models.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label className="field full"><span>Registration number (optional)</span><input className="input" value={form.regNo} onChange={set('regNo')} placeholder="KL 07 AB 1234" /></label>
            </div>
          </fieldset>

          <fieldset className="card card-pad co-step">
            <legend><span>3</span> {needsInstall ? 'Fitment slot' : 'Delivery or pickup'}</legend>
            {needsInstall ? (
              <>
                <p className="muted" style={{ marginBottom: 16 }}>
                  <Wrench size={15} style={{ verticalAlign: -2 }} /> You've added studio fitment, so bring your car to our studio at the time you choose.
                </p>
                <SlotPicker date={slot.date} slot={slot.slot} onChange={setSlot} />
              </>
            ) : (
              <>
                <div className="choice-grid">
                  <label className={`choice ${fulfilment === 'delivery' ? 'on' : ''}`}>
                    <input type="radio" name="ful" checked={fulfilment === 'delivery'} onChange={() => setFulfilment('delivery')} />
                    <Truck size={22} />
                    <span><strong>Home delivery</strong><small>Free above {inr(settings?.freeShippingAbove || 0)}</small></span>
                  </label>
                  <label className={`choice ${fulfilment === 'pickup' ? 'on' : ''}`}>
                    <input type="radio" name="ful" checked={fulfilment === 'pickup'} onChange={() => setFulfilment('pickup')} />
                    <Store size={22} />
                    <span><strong>Pick up from studio</strong><small>Free, ready in 24 hrs</small></span>
                  </label>
                </div>
                {fulfilment === 'delivery' && (
                  <div className="form-grid" style={{ marginTop: 18 }}>
                    <label className="field full"><span>Address</span><input className="input" value={form.line1} onChange={set('line1')} required autoComplete="street-address" placeholder="House no, street, area" /></label>
                    <label className="field full"><span>Landmark (optional)</span><input className="input" value={form.line2} onChange={set('line2')} /></label>
                    <label className="field"><span>City</span><input className="input" value={form.city} onChange={set('city')} required autoComplete="address-level2" /></label>
                    <label className="field"><span>Pincode</span><input className="input" value={form.pincode} onChange={set('pincode')} required inputMode="numeric" maxLength={6} autoComplete="postal-code" /></label>
                    <label className="field full"><span>State</span>
                      <select className="select" value={form.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>
                  </div>
                )}
              </>
            )}
          </fieldset>

          <fieldset className="card card-pad co-step">
            <legend><span>4</span> Payment</legend>
            <div className="choice-list">
              {payOptions.map(({ id, icon: Icon, title, text }) => (
                <label key={id} className={`choice ${form.paymentMethod === id ? 'on' : ''}`}>
                  <input type="radio" name="pay" checked={form.paymentMethod === id} onChange={() => setForm((f) => ({ ...f, paymentMethod: id }))} />
                  <Icon size={22} />
                  <span><strong>{title}</strong><small>{text}</small></span>
                </label>
              ))}
            </div>
            <label className="field" style={{ marginTop: 18 }}>
              <span>Order notes (optional)</span>
              <textarea className="textarea" value={form.notes} onChange={set('notes')} placeholder="Colour preference, best time to call, etc." />
            </label>
          </fieldset>
        </div>

        <Summary quote={q.quote} couponState={q}>
          <div className="sum-items">
            {items.map((i) => (
              <div key={i.productId} className="sum-item">
                <span className="sum-thumb"><Img src={i.image} alt="" /><em>{i.qty}</em></span>
                <span className="grow">{i.name}{i.install && <small><Wrench size={11} /> with fitment</small>}</span>
                <strong>{inr(i.price * i.qty)}</strong>
              </div>
            ))}
          </div>
          {q.error && <div className="form-error">{q.error}</div>}
          <button className="btn btn-red btn-lg btn-block" disabled={busy || !q.quote}>
            {busy ? <Spinner /> : <Lock size={17} />} Place order {q.quote && `- ${inr(q.quote.totals.total)}`}
          </button>
          <p className="muted tiny" style={{ textAlign: 'center' }}>We'll call you on your mobile to confirm.</p>
        </Summary>
      </form>
    </>
  );
}
