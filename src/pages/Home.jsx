import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Wrench, CreditCard, BadgeCheck, ChevronLeft, ChevronRight,
  Copy, Check, CalendarCheck, Car, Sparkles, Quote, Instagram, ShoppingBag, Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { waLink, fmtDate, asset } from '../lib/format';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard';
import VehicleSelector from '../components/VehicleSelector';
import Reels from '../components/Reels';
import { Img, Stars, Price, Countdown } from '../components/ui';

function Hero() {
  const { settings } = useStore();
  const navigate = useNavigate();
  const slides = settings?.heroSlides || [];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearTimeout(t);
  }, [idx, paused, slides.length]);

  if (!slides.length) return <section className="hero skeleton" style={{ borderRadius: 0 }} />;

  const go = (to) => (to === 'whatsapp' ? window.open(waLink(settings.whatsapp, 'Hi! I want parts for my car.'), '_blank') : navigate(to));
  const step = (d) => setIdx((i) => (i + d + slides.length) % slides.length);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
      {slides.map((s, i) => (
        <div key={s.id} className={`hero-bg ${i === idx ? 'on' : ''}`} style={{ backgroundImage: `url(${s.image})` }} aria-hidden="true" />
      ))}
      <div className="hero-shade" />
      <div className="hero-stripes" aria-hidden="true"><span /><span /><span /></div>

      <div className="container hero-inner">
        <div className="hero-copy" key={slides[idx].id}>
          <span className="hero-eyebrow"><Zap size={14} /> {slides[idx].eyebrow}</span>
          <h1 className="display">
            {slides[idx].title.split('\n').map((line, i) => (
              <span key={i} className={i === 1 ? 'red' : ''}>{line}<br /></span>
            ))}
          </h1>
          <p>{slides[idx].text}</p>
          <div className="row hero-ctas">
            <button className="btn btn-red btn-lg" onClick={() => go(slides[idx].cta.to)}>
              {slides[idx].cta.label} <ArrowRight size={18} />
            </button>
            {slides[idx].secondary && (
              <button className="btn btn-ghost-light btn-lg" onClick={() => go(slides[idx].secondary.to)}>
                {slides[idx].secondary.label}
              </button>
            )}
          </div>
          <div className="hero-nav">
            <button className="icon-btn" onClick={() => step(-1)} aria-label="Previous slide"><ChevronLeft size={20} /></button>
            <div className="hero-bars">
              {slides.map((s, i) => (
                <button key={s.id} className={`hero-bar ${i === idx ? 'on' : ''} ${paused ? 'paused' : ''}`} onClick={() => setIdx(i)} aria-label={`Go to slide ${i + 1}`}>
                  <span />
                </button>
              ))}
            </div>
            <button className="icon-btn" onClick={() => step(1)} aria-label="Next slide"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="hero-side">
          <VehicleSelector variant="card" />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Wrench, title: 'Expert studio fitment', text: 'Clean wiring, no rattles' },
    { icon: CreditCard, title: 'Easy EMI', text: 'With Bajaj Finserv' },
    { icon: BadgeCheck, title: 'Genuine brands', text: 'JBL, Pioneer, Philips, 3M' },
    { icon: ShieldCheck, title: 'Warranty support', text: 'We handle claims for you' },
  ];
  return (
    <div className="container">
      <div className="trust">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="trust-item">
            <span className="trust-icon"><Icon size={22} /></span>
            <div><strong>{title}</strong><span>{text}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Categories() {
  const { categories } = useStore();
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="slash-tag">Explore</span>
            <h2 className="display">Shop by category</h2>
          </div>
          <Link to="/shop" className="link">View all products <ArrowRight size={16} /></Link>
        </div>
        <div className="cat-grid">
          {categories.length === 0 && Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 210 }} />)}
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className="cat-card">
              <div className="cat-img"><Img src={c.image} alt={c.name} /></div>
              <div className="cat-body">
                <strong>{c.name}</strong>
                <span>{c.productCount} products</span>
              </div>
              <span className="cat-arrow"><ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoTiles() {
  return (
    <section className="section-sm" style={{ paddingTop: 0 }}>
      <div className="container promo-grid">
        <Link to="/offers" className="promo promo-poster">
          <img src={asset("images/offer-poster.jpg")} alt="Addon Automotive: Up to 10% to 30% off, EMI options available" />
        </Link>
        <div className="promo-col">
          <Link to="/shop?tag=emi" className="promo promo-dark">
            <span className="slash-tag">Bajaj Finserv</span>
            <h3 className="display">No-cost EMI<br />on big upgrades</h3>
            <p>Stereos, alloys and audio packages on easy monthly payments. Ask at checkout.</p>
            <span className="btn btn-white btn-sm">Shop EMI products <ArrowRight size={15} /></span>
            <CreditCard className="promo-bg-icon" size={160} strokeWidth={1} />
          </Link>
          <Link to="/book-installation" className="promo promo-red">
            <span className="slash-tag" style={{ color: '#fff' }}>Fitment studio</span>
            <h3 className="display">Book your<br />install slot</h3>
            <p>Pick a date and time online. We'll be ready when you arrive.</p>
            <span className="btn btn-dark btn-sm">Book now <ArrowRight size={15} /></span>
            <CalendarCheck className="promo-bg-icon" size={160} strokeWidth={1} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function DealOfTheDay({ product }) {
  const { add } = useCart();
  if (!product) return null;
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return (
    <section className="deal">
      <div className="container deal-inner">
        <div className="deal-media">
          <span className="badge-off" style={{ fontSize: 22 }}>-{product.discount}%</span>
          <Img src={product.images?.[0]} alt={product.name} />
        </div>
        <div className="deal-copy">
          <span className="slash-tag">Deal of the day</span>
          <h2 className="display">{product.name}</h2>
          <div className="row" style={{ gap: 10 }}>
            <Stars value={product.rating} count={product.reviewCount} />
            <span className="muted">by {product.brand}</span>
          </div>
          <Price price={product.price} mrp={product.mrp} size="lg" />
          <div>
            <p className="deal-ends">Offer ends in</p>
            <Countdown to={midnight.getTime()} />
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-red btn-lg" onClick={() => add(product, 1, false)} disabled={product.stock <= 0}>
              <ShoppingBag size={18} /> Add to cart
            </button>
            <Link to={`/product/${product.slug}`} className="btn btn-ghost-light btn-lg">View details</Link>
          </div>
          {product.stock > 0 && product.stock <= 15 && <p className="deal-stock">Hurry! Only {product.stock} left in stock</p>}
        </div>
      </div>
    </section>
  );
}

function ProductTabs({ data }) {
  const tabs = [
    { id: 'bestsellers', label: 'Bestsellers' },
    { id: 'newArrivals', label: 'New arrivals' },
    { id: 'onSale', label: 'Biggest discounts' },
  ];
  const [tab, setTab] = useState('bestsellers');
  const items = data?.[tab] || [];
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="slash-tag">Trending now</span>
            <h2 className="display">Popular upgrades</h2>
          </div>
          <div className="tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {!data ? <ProductGridSkeleton /> : (
          <div className="pgrid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/shop" className="btn btn-outline btn-lg">Browse all products <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>
  );
}

export function CouponCard({ offer }) {
  const [copied, setCopied] = useState(false);
  const { setCoupon } = useCart();
  const { toast } = useStore();
  const copy = async () => {
    try { await navigator.clipboard.writeText(offer.code); } catch { /* clipboard blocked */ }
    setCoupon(offer.code);
    setCopied(true);
    toast(`${offer.code} copied and will be applied at checkout`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`coupon coupon-${offer.accent || 'red'}`}>
      <div className="coupon-main">
        <strong className="display">{offer.title}</strong>
        <p>{offer.description}</p>
        {offer.validTill && <small>Valid till {fmtDate(offer.validTill)}</small>}
      </div>
      <div className="coupon-cut" aria-hidden="true" />
      <button className="coupon-code" onClick={copy} aria-label={`Copy code ${offer.code}`}>
        <span>{offer.code}</span>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function Offers({ offers }) {
  if (!offers?.length) return null;
  return (
    <section className="section-sm">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="slash-tag">Save more</span>
            <h2 className="display">Coupons for you</h2>
          </div>
          <Link to="/offers" className="link">All offers <ArrowRight size={16} /></Link>
        </div>
        <div className="coupon-grid">{offers.slice(0, 4).map((o) => <CouponCard key={o.id} offer={o} />)}</div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Car, title: 'Pick your car', text: 'Save your make and model to see parts that fit.' },
    { icon: ShoppingBag, title: 'Choose your upgrade', text: 'Add products and tick "Studio fitment".' },
    { icon: CalendarCheck, title: 'Book a slot', text: 'Choose a date and time that suits you.' },
    { icon: Sparkles, title: 'Drive out upgraded', text: 'We fit it and test it, then hand it over.' },
  ];
  return (
    <section className="section how">
      <div className="container how-inner">
        <div className="how-media">
          <img src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1100&q=80" alt="Car being prepared at the studio" loading="lazy" />
          <div className="how-badge">
            <strong className="display">2 hrs</strong>
            <span>average stereo + speaker install</span>
          </div>
        </div>
        <div>
          <span className="slash-tag">Fitment studio</span>
          <h2 className="display how-title">Order online.<br />Fitted by pros.</h2>
          <p className="muted" style={{ maxWidth: 520, marginTop: 12 }}>
            Every product can be fitted at our studio by technicians who do this every day. No cut wires, no rattles, and no guesswork.
          </p>
          <ol className="steps">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="step-icon"><Icon size={20} /></span>
                <div><strong>{title}</strong><p>{text}</p></div>
              </li>
            ))}
          </ol>
          <Link to="/book-installation" className="btn btn-red btn-lg">Book installation <ArrowRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}

function Brands({ brands }) {
  if (!brands?.length) return null;
  const loop = [...brands, ...brands];
  return (
    <section className="brands" aria-label="Brands we fit">
      <div className="brands-track">
        {loop.map((b, i) => <span key={i} className="display">{b}</span>)}
      </div>
    </section>
  );
}

function Testimonials({ items }) {
  if (!items?.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="slash-tag">Reviews</span>
            <h2 className="display">Drivers love us</h2>
          </div>
          <div className="row">
            <Stars value={4.9} size={18} />
            <strong>4.9/5</strong>
            <span className="muted">from happy customers</span>
          </div>
        </div>
        <div className="testi-grid">
          {items.map((t) => (
            <figure key={t.id} className="testi">
              <Quote className="testi-q" size={34} />
              <Stars value={t.rating} />
              <blockquote>{t.text}</blockquote>
              <figcaption>
                <span className="avatar">{t.name[0]}</span>
                <div><strong>{t.name}</strong><span>{t.car}</span></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstaCta() {
  const { settings } = useStore();
  if (!settings?.instagram) return null;
  return (
    <section className="section-sm" style={{ paddingBottom: 80 }}>
      <div className="container">
        <a href={settings.instagram} target="_blank" rel="noreferrer" className="insta">
          <span className="insta-icon"><Instagram size={30} /></span>
          <div className="grow">
            <strong className="display">Follow {settings.instagramHandle}</strong>
            <p>Fresh builds, before-and-afters and flash deals every week.</p>
          </div>
          <span className="btn btn-white">Follow us <ArrowRight size={16} /></span>
        </a>
      </div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/home').then(setData).catch(() => setData({}));
  }, []);

  return (
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <PromoTiles />
      <DealOfTheDay product={data?.dealOfTheDay} />
      <ProductTabs data={data} />
      <Offers offers={data?.offers} />
      <Brands brands={data?.brands} />
      <HowItWorks />
      <Reels reels={data?.reels} />
      <Testimonials items={data?.testimonials} />
      {!data?.reels?.length && <InstaCta />}
    </>
  );
}
