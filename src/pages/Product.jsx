import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, Heart, ShoppingBag, Zap, Wrench, CheckCircle2, AlertCircle, Car, Truck, Store,
  ShieldCheck, MessageCircle, CreditCard, Check, Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { inr, emiFrom, fitsVehicle, waLink, fmtDate } from '../lib/format';
import { Img, Stars, Price, QtyStepper, Spinner } from '../components/ui';
import ProductCard from '../components/ProductCard';
import VehicleSelector from '../components/VehicleSelector';

function ReviewForm({ productId, onAdded }) {
  const { toast } = useStore();
  const [form, setForm] = useState({ name: '', rating: 5, title: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.post(`/products/${productId}/reviews`, form);
      onAdded(r);
      setForm({ name: '', rating: 5, title: '', text: '' });
      toast('Thanks for your review!');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="card card-pad stack" onSubmit={submit}>
      <h4>Write a review</h4>
      <div className="rate-pick" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={form.rating === n} onClick={() => setForm({ ...form, rating: n })} className={n <= form.rating ? 'on' : ''} aria-label={`${n} stars`}>
            <Star size={24} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <div className="form-grid">
        <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="textarea full" placeholder="How was the product and the fitment?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button className="btn btn-dark" disabled={busy}>{busy && <Spinner />} Submit review</button>
    </form>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { garage, settings, toggleWishlist, inWishlist, categoryName } = useStore();
  const { add } = useCart();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [install, setInstall] = useState(false);
  const [tab, setTab] = useState('details');
  const [showCarPicker, setShowCarPicker] = useState(false);

  useEffect(() => {
    setData(null);
    setError('');
    setImgIdx(0);
    setQty(1);
    setInstall(false);
    api.get(`/products/${slug}`).then(setData).catch((e) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (data?.product) document.title = `${data.product.name} | Addon Automotive`;
    return () => { document.title = 'Addon Automotive | Car Accessories, Audio & Fitment Studio'; };
  }, [data]);

  if (error) {
    return (
      <div className="container section">
        <div className="empty card">
          <AlertCircle size={44} />
          <h3>{error}</h3>
          <Link to="/shop" className="btn btn-dark">Back to shop</Link>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container section pdp">
        <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
        <div className="stack">
          <div className="skeleton" style={{ height: 40 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  const { product: p, reviews, related } = data;
  const fits = fitsVehicle(p, garage);
  const saved = inWishlist(p.id);
  const soldOut = p.stock <= 0;
  const installCharge = p.installation?.charge || 0;
  const total = p.price * qty + (install ? installCharge * qty : 0);

  const buyNow = () => {
    add(p, qty, install, { openDrawer: false });
    navigate('/checkout');
  };

  return (
    <>
      <div className="container">
        <nav className="crumbs crumbs-light" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to={`/shop?category=${p.categoryId}`}>{categoryName(p.categoryId)}</Link> <ChevronRight size={14} />
          <span>{p.name}</span>
        </nav>
      </div>

      <section className="container pdp">
        <div className="pdp-gallery">
          <div className="pdp-main">
            {p.discount > 0 && <span className="badge-off" style={{ fontSize: 18 }}>-{p.discount}%</span>}
            <Img src={p.images[imgIdx]} alt={p.name} />
          </div>
          {p.images.length > 1 && (
            <div className="pdp-thumbs">
              {p.images.map((src, i) => (
                <button key={src} className={i === imgIdx ? 'on' : ''} onClick={() => setImgIdx(i)} aria-label={`Image ${i + 1}`}>
                  <Img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <span className="pcard-brand">{p.brand}</span>
            {p.tags?.includes('bestseller') && <span className="chip chip-dark">Bestseller</span>}
            {p.tags?.includes('new') && <span className="chip chip-red">New</span>}
          </div>
          <h1 className="pdp-title">{p.name}</h1>
          <div className="row">
            <Stars value={p.rating} count={p.reviewCount} />
            <button className="link tiny" onClick={() => { setTab('reviews'); document.getElementById('pdp-tabs')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Read reviews
            </button>
          </div>

          <div className="pdp-price">
            <Price price={p.price} mrp={p.mrp} size="lg" />
            <p className="muted tiny">Inclusive of all taxes. You save {inr(p.mrp - p.price)}.</p>
            {p.price >= 3000 && (
              <p className="emi-line"><CreditCard size={15} /> EMI from <strong>{inr(emiFrom(p.price))}/month</strong> with {settings?.emiPartner || 'Bajaj Finserv'}</p>
            )}
          </div>

          <div className={`fitbox ${fits === true ? 'yes' : fits === false ? 'no' : ''}`}>
            {fits === null && (
              <>
                <div className="row"><Car size={18} /><strong>Will this fit my car?</strong></div>
                {!showCarPicker ? (
                  <button className="btn btn-outline btn-sm" onClick={() => setShowCarPicker(true)}>Check fitment</button>
                ) : (
                  <VehicleSelector variant="inline" onDone={() => setShowCarPicker(false)} />
                )}
              </>
            )}
            {fits === true && (
              <div className="row"><CheckCircle2 size={18} /><span><strong>Fits your {garage.make} {garage.model}</strong>{p.fitment === 'universal' ? ' (universal fit)' : ''}</span></div>
            )}
            {fits === false && (
              <div className="stack" style={{ width: '100%' }}>
                <div className="row"><AlertCircle size={18} /><span><strong>Not listed for your {garage.make} {garage.model}.</strong> Ask us - we may have a custom kit.</span></div>
              </div>
            )}
          </div>

          {p.installation?.available && (
            <label className={`install-card ${install ? 'on' : ''}`}>
              <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} />
              <span className="install-icon"><Wrench size={20} /></span>
              <span className="grow">
                <strong>Add studio fitment</strong>
                <small>Pick a slot at checkout. Professional installation and testing.</small>
              </span>
              <strong className="nowrap">{installCharge ? `+${inr(installCharge)}` : 'FREE'}</strong>
            </label>
          )}

          <div className="pdp-buy">
            <QtyStepper value={qty} onChange={setQty} max={Math.min(10, p.stock)} />
            <button className="btn btn-dark btn-lg grow" disabled={soldOut} onClick={() => add(p, qty, install)}>
              <ShoppingBag size={18} /> {soldOut ? 'Sold out' : 'Add to cart'}
            </button>
            <button className={`icon-btn wish-lg ${saved ? 'on' : ''}`} onClick={() => toggleWishlist(p)} aria-label="Wishlist" aria-pressed={saved}>
              <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <button className="btn btn-red btn-lg btn-block" disabled={soldOut} onClick={buyNow}>
            <Zap size={18} /> Buy now - {inr(total)}
          </button>
          {settings?.whatsapp && (
            <a className="btn btn-green btn-block" target="_blank" rel="noreferrer"
              href={waLink(settings.whatsapp, `Hi! I'm interested in "${p.name}" (${inr(p.price)}).${garage ? ` My car: ${garage.make} ${garage.model}.` : ''} ${window.location.href}`)}>
              <MessageCircle size={18} /> Ask on WhatsApp
            </a>
          )}
          <p className={`stock-line ${p.stock <= 5 ? 'low' : ''}`}>
            {soldOut ? 'Out of stock - ask us for restock dates' : p.stock <= 5 ? `Only ${p.stock} left in stock` : 'In stock, ready to ship or fit'}
          </p>

          <ul className="perks">
            <li><Truck size={18} /><span><strong>Delivery</strong> free above {inr(settings?.freeShippingAbove || 0)}</span></li>
            <li><Store size={18} /><span><strong>Store pickup</strong> ready in 24 hrs</span></li>
            <li><ShieldCheck size={18} /><span><strong>Warranty</strong> {p.specs?.Warranty || 'as per brand'}</span></li>
          </ul>
        </div>
      </section>

      <section className="container pdp-tabs" id="pdp-tabs">
        <div className="tabs" role="tablist">
          {[['details', 'Details'], ['specs', 'Specifications'], ['fitment', 'Compatibility'], ['reviews', `Reviews (${reviews.length})`]].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <div className="card card-pad tab-panel">
          {tab === 'details' && (
            <div className="stack">
              <p>{p.description}</p>
              <ul className="highlights">{p.highlights?.map((h) => <li key={h}><Check size={16} /> {h}</li>)}</ul>
            </div>
          )}
          {tab === 'specs' && (
            <table className="spec-table">
              <tbody>
                <tr><th>Brand</th><td>{p.brand}</td></tr>
                {Object.entries(p.specs || {}).map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
              </tbody>
            </table>
          )}
          {tab === 'fitment' && (
            p.fitment === 'universal' ? (
              <p><strong>Universal fit.</strong> Works with most cars. If you're unsure, message us your car model and year.</p>
            ) : (
              <div className="fit-list">
                {p.fitment.map((f) => (
                  <div key={f.make}><strong>{f.make}</strong><span>{f.models.join(', ')}</span></div>
                ))}
              </div>
            )
          )}
          {tab === 'reviews' && (
            <div className="reviews">
              <div className="stack">
                {reviews.length === 0 && <p className="muted">No reviews yet. Be the first!</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="review">
                    <div className="row-between">
                      <Stars value={r.rating} />
                      <span className="muted tiny">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.title && <strong>{r.title}</strong>}
                    <p>{r.text}</p>
                    <span className="muted tiny">{r.name}{r.verified && <span className="chip chip-green" style={{ marginLeft: 8, height: 22 }}>Verified buyer</span>}</span>
                  </div>
                ))}
              </div>
              <ReviewForm productId={p.id} onAdded={(r) => setData((d) => ({ ...d, reviews: [r, ...d.reviews] }))} />
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head"><div><span className="slash-tag">Complete the build</span><h2 className="display">You may also like</h2></div></div>
            <div className="pgrid">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
