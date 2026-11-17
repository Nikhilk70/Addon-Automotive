import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart, Phone, Instagram, MapPin, Clock, MessageCircle, Send, CheckCircle2, Wrench, CalendarCheck,
  Truck, RotateCcw, ShieldCheck, CreditCard, Mail, Compass,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { inr, waLink, fmtDate, asset } from '../lib/format';
import ProductCard from '../components/ProductCard';
import SlotPicker from '../components/SlotPicker';
import { Spinner } from '../components/ui';
import { CouponCard } from './Home';

export function Offers() {
  const [offers, setOffers] = useState(null);
  useEffect(() => { api.get('/offers').then(setOffers).catch(() => setOffers([])); }, []);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="slash-tag">Save on every upgrade</span>
          <h1 className="display">Offers & coupons</h1>
          <p>Tap a code to copy it. It'll be applied automatically at checkout.</p>
        </div>
      </section>
      <div className="container section-sm">
        <div className="coupon-grid">
          {!offers && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 130 }} />)}
          {offers?.map((o) => <CouponCard key={o.id} offer={o} />)}
        </div>
        <div className="offer-banner">
          <img src={asset("images/offer-poster.jpg")} alt="Addon Automotive offer: up to 10% to 30% off, EMI options available" />
          <div>
            <span className="slash-tag">Store-wide sale</span>
            <h2 className="display">Up to 10% - 30% off</h2>
            <p className="muted">Android stereos, car speakers, subwoofers, seat covers, sun films, fog lamps, spoilers, alloy wheels, wheel cups, and aftermarket head and tail lamps.</p>
            <div className="row" style={{ flexWrap: 'wrap', marginTop: 8 }}>
              <Link to="/shop?tag=sale" className="btn btn-red">Shop the sale</Link>
              <Link to="/shop?tag=emi" className="btn btn-outline"><CreditCard size={16} /> EMI products</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function BookInstallation() {
  const { settings, vehicles, garage, toast } = useStore();
  const [form, setForm] = useState({ serviceId: 'consult', name: '', phone: '', email: '', make: garage?.make || '', model: garage?.model || '', regNo: '', notes: '' });
  const [slot, setSlot] = useState({ date: '', slot: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const models = vehicles.find((v) => v.make === form.make)?.models || [];

  const submit = async (e) => {
    e.preventDefault();
    if (!slot.date || !slot.slot) return setError('Please choose a date and time.');
    setBusy(true);
    setError('');
    try {
      const b = await api.post('/bookings', { ...form, ...slot });
      setDone(b);
      toast('Booking received!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <span className="slash-tag">Fitment studio</span>
          <h1 className="display">Book installation</h1>
          <p>Bought from us or bringing your own part, book a slot and our technicians will be ready for you.</p>
        </div>
      </section>
      <div className="container section-sm">
        {done ? (
          <div className="card card-pad success-head" style={{ maxWidth: 640, margin: '0 auto' }}>
            <span className="success-icon"><CheckCircle2 size={40} /></span>
            <h2 className="display">You're booked in</h2>
            <p className="muted">
              Booking <strong>{done.bookingId}</strong>: {done.service.name} on <strong>{fmtDate(done.date, { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at <strong>{done.slot}</strong>.
              We'll call {done.customer.phone} to confirm.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => { setDone(null); setSlot({ date: '', slot: '' }); }}>Book another</button>
              <Link to="/shop" className="btn btn-dark">Shop accessories</Link>
            </div>
          </div>
        ) : (
          <form className="checkout" onSubmit={submit}>
            <div className="stack" style={{ gap: 20 }}>
              {error && <div className="form-error">{error}</div>}
              <fieldset className="card card-pad co-step">
                <legend><span>1</span> Choose a service</legend>
                <div className="service-grid">
                  {settings?.services.map((s) => (
                    <label key={s.id} className={`choice ${form.serviceId === s.id ? 'on' : ''}`}>
                      <input type="radio" name="svc" checked={form.serviceId === s.id} onChange={() => setForm((f) => ({ ...f, serviceId: s.id }))} />
                      <Wrench size={20} />
                      <span><strong>{s.name}</strong><small>{s.price ? `From ${inr(s.price)}` : 'Free / quote'} | ~{s.durationMins} min</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="card card-pad co-step">
                <legend><span>2</span> Pick a date and time</legend>
                <SlotPicker date={slot.date} slot={slot.slot} onChange={setSlot} />
              </fieldset>
              <fieldset className="card card-pad co-step">
                <legend><span>3</span> Your details</legend>
                <div className="form-grid">
                  <label className="field"><span>Name</span><input className="input" value={form.name} onChange={set('name')} required /></label>
                  <label className="field"><span>Mobile</span><input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" required /></label>
                  <label className="field"><span>Car brand</span>
                    <select className="select" value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value, model: '' }))} required>
                      <option value="">Select</option>{vehicles.map((v) => <option key={v.make}>{v.make}</option>)}
                    </select>
                  </label>
                  <label className="field"><span>Model</span>
                    <select className="select" value={form.model} onChange={set('model')} disabled={!form.make} required>
                      <option value="">Select</option>{models.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="field"><span>Registration no. (optional)</span><input className="input" value={form.regNo} onChange={set('regNo')} /></label>
                  <label className="field"><span>Email (optional)</span><input className="input" type="email" value={form.email} onChange={set('email')} /></label>
                  <label className="field full"><span>What do you need? (optional)</span><textarea className="textarea" value={form.notes} onChange={set('notes')} placeholder="e.g. Fit my own 9 inch stereo + reverse camera" /></label>
                </div>
              </fieldset>
            </div>
            <aside className="summary card">
              <h3>Your booking</h3>
              <ul className="book-sum">
                <li><Wrench size={16} /><span>{settings?.services.find((s) => s.id === form.serviceId)?.name}</span></li>
                <li><CalendarCheck size={16} /><span>{slot.date ? `${fmtDate(slot.date, { weekday: 'short', day: 'numeric', month: 'short' })}${slot.slot ? `, ${slot.slot}` : ''}` : 'No date chosen'}</span></li>
                <li><Clock size={16} /><span>{settings?.hours}</span></li>
              </ul>
              <button className="btn btn-red btn-lg btn-block" disabled={busy}>{busy && <Spinner />} Confirm booking</button>
              <p className="muted tiny" style={{ textAlign: 'center' }}>No payment needed to book.</p>
            </aside>
          </form>
        )}
      </div>
    </>
  );
}

export function Wishlist() {
  const { wishlist } = useStore();
  const [live, setLive] = useState({});
  useEffect(() => {
    // Refresh price / stock for saved items from the catalogue.
    api.get('/products?limit=60').then((d) => setLive(Object.fromEntries(d.items.map((p) => [p.id, p])))).catch(() => {});
  }, []);
  return (
    <>
      <section className="page-hero"><div className="container"><h1 className="display">Wishlist</h1><p>{wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}</p></div></section>
      <div className="container section-sm">
        {wishlist.length === 0 ? (
          <div className="empty card">
            <Heart size={44} />
            <h3>No saved items yet</h3>
            <p className="muted">Tap the heart on any product to save it for later.</p>
            <Link to="/shop" className="btn btn-red">Browse products</Link>
          </div>
        ) : (
          <div className="pgrid">
            {wishlist.map((w) => (
              <ProductCard key={w.id} product={live[w.id] || { ...w, images: [w.image], stock: 0, rating: 0 }} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function Contact() {
  const { settings, toast } = useStore();
  const { hash } = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '', type: 'contact' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [hash]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/enquiries', form);
      setSent(true);
      toast("Message sent. We'll get back to you soon.");
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
          <span className="slash-tag">We're here to help</span>
          <h1 className="display">Contact us</h1>
          <p>Questions about fitment, EMI, or a part you can't find? Call, WhatsApp, or send us a message.</p>
        </div>
      </section>
      <div className="container section-sm contact">
        <div className="stack" style={{ gap: 16 }}>
          {settings?.phones?.map((p) => (
            <a key={p} className="contact-tile" href={`tel:${p.replace(/\s/g, '')}`}><Phone size={20} /><span><small>Call us</small><strong>{p}</strong></span></a>
          ))}
          {settings?.whatsapp && (
            <a className="contact-tile wa" href={waLink(settings.whatsapp, 'Hi Addon Automotive!')} target="_blank" rel="noreferrer"><MessageCircle size={20} /><span><small>WhatsApp</small><strong>Chat with our team</strong></span></a>
          )}
          {settings?.instagram && (
            <a className="contact-tile" href={settings.instagram} target="_blank" rel="noreferrer"><Instagram size={20} /><span><small>Instagram</small><strong>{settings.instagramHandle}</strong></span></a>
          )}
          {settings?.email && (
            <a className="contact-tile" href={`mailto:${settings.email}`}><Mail size={20} /><span><small>Email</small><strong>{settings.email}</strong></span></a>
          )}
          {settings?.address && <div className="contact-tile static"><MapPin size={20} /><span><small>Studio</small><strong>{settings.address}</strong></span></div>}
          <div className="contact-tile static"><Clock size={20} /><span><small>Hours</small><strong>{settings?.hours}</strong></span></div>
        </div>

        <form className="card card-pad stack" onSubmit={submit}>
          <h3>Send a message</h3>
          {sent ? (
            <div className="empty"><CheckCircle2 size={40} color="var(--green)" /><h3>Thanks, {form.name.split(' ')[0]}!</h3><p className="muted">We'll reply within one working day.</p></div>
          ) : (
            <>
              <div className="form-grid">
                <label className="field"><span>Name</span><input className="input" value={form.name} onChange={set('name')} required /></label>
                <label className="field"><span>Mobile</span><input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" required /></label>
                <label className="field"><span>Email (optional)</span><input className="input" type="email" value={form.email} onChange={set('email')} /></label>
                <label className="field"><span>Topic</span>
                  <select className="select" value={form.type} onChange={set('type')}>
                    <option value="contact">General question</option>
                    <option value="product">Product / fitment</option>
                    <option value="emi">EMI enquiry</option>
                    <option value="bulk">Bulk / dealer order</option>
                  </select>
                </label>
                <label className="field full"><span>Message</span><textarea className="textarea" value={form.message} onChange={set('message')} required placeholder="Tell us your car model and what you're looking for" /></label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <button className="btn btn-red btn-lg" disabled={busy}>{busy ? <Spinner /> : <Send size={17} />} Send message</button>
            </>
          )}
        </form>
      </div>

      <section className="container section-sm" id="policies">
        <div className="section-head"><div><span className="slash-tag">Good to know</span><h2 className="display">Shipping, returns & warranty</h2></div></div>
        <div className="policy-grid">
          <div className="card card-pad"><Truck size={24} className="red" /><h4>Shipping</h4><p className="muted">Free delivery above {inr(settings?.freeShippingAbove || 0)}; otherwise {inr(settings?.shippingFee || 0)}. Dispatch within 1-2 working days.</p></div>
          <div className="card card-pad"><RotateCcw size={24} className="red" /><h4>Returns</h4><p className="muted">Unused items in original packing can be returned within 7 days. Fitted or custom items cannot be returned.</p></div>
          <div className="card card-pad"><ShieldCheck size={24} className="red" /><h4>Warranty</h4><p className="muted">Brand warranty applies. Bring the product and invoice to the studio and we'll handle the claim.</p></div>
          <div className="card card-pad"><CreditCard size={24} className="red" /><h4>Payments & EMI</h4><p className="muted">Cash, UPI and cards accepted. EMI available via {settings?.emiPartner || 'Bajaj Finserv'}, subject to approval.</p></div>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <div className="container section">
      <div className="empty card">
        <Compass size={48} />
        <h3 className="display" style={{ fontSize: 48 }}>Wrong turn</h3>
        <p className="muted">We couldn't find that page.</p>
        <Link to="/" className="btn btn-red">Back to home</Link>
      </div>
    </div>
  );
}
