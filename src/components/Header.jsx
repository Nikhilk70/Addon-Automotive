import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Car, ChevronDown, Phone, Instagram, BadgePercent, Wrench, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { api, qs } from '../lib/api';
import { inr, asset } from '../lib/format';
import { Img } from './ui';
import VehicleSelector from './VehicleSelector';

const ANNOUNCEMENTS = [
  'Flat 10% - 30% off on car accessories',
  'EMI available with Bajaj Finserv',
  'Free fitment on Android stereo combos',
  'Use code FIRSTRIDE for Rs. 500 off your first order',
];

function SearchBox({ onDone }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (term.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api.get(`/products${qs({ search: term.trim(), limit: 5 })}`, { signal: ctrl.signal })
        .then((d) => setResults(d.items))
        .catch(() => {});
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [term]);

  useEffect(() => {
    const close = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    onDone?.();
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  return (
    <form className="search" onSubmit={submit} ref={boxRef} role="search">
      <Search size={18} className="search-icon" />
      <input
        type="search"
        placeholder="Search stereos, speakers, seat covers..."
        value={term}
        onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-label="Search products"
      />
      <button className="btn btn-red btn-sm" type="submit">Search</button>
      {open && results.length > 0 && (
        <div className="search-pop">
          {results.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setOpen(false); setTerm(''); onDone?.(); }}>
              <Img src={p.images?.[0]} alt="" />
              <span className="grow">{p.name}</span>
              <strong>{inr(p.price)}</strong>
            </Link>
          ))}
          <button type="submit" className="search-all">See all results for "{term}"</button>
        </div>
      )}
    </form>
  );
}

export default function Header() {
  const { settings, categories, garage, wishlist } = useStore();
  const { count, openDrawer } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [garageOpen, setGarageOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [annIdx, setAnnIdx] = useState(0);
  const garageRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setGarageOpen(false);
    setMegaOpen(false);
    setMobileSearch(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const t = setInterval(() => setAnnIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const close = (e) => !garageRef.current?.contains(e.target) && setGarageOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const links = [
    { to: '/shop', label: 'Shop All' },
    { to: '/offers', label: 'Offers', icon: BadgePercent },
    { to: '/book-installation', label: 'Book Installation', icon: Wrench },
    { to: '/track-order', label: 'Track Order', icon: PackageSearch },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <p key={annIdx} className="topbar-msg">{ANNOUNCEMENTS[annIdx]}</p>
          <div className="topbar-links">
            {settings?.phones?.[0] && (
              <a href={`tel:${settings.phones[0].replace(/\s/g, '')}`}><Phone size={13} /> {settings.phones[0]}</a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer"><Instagram size={13} /> {settings.instagramHandle}</a>
            )}
          </div>
        </div>
      </div>

      <div className="mainbar">
        <div className="container mainbar-inner">
          <button className="icon-btn only-mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="logo" aria-label="Addon Automotive home">
            <img src={asset("images/logo.png")} alt="Addon Automotive" />
          </Link>
          <div className="only-desktop grow"><SearchBox /></div>

          <div className="mainbar-actions">
            <button className="icon-btn only-mobile" onClick={() => setMobileSearch((v) => !v)} aria-label="Search">
              <Search size={21} />
            </button>
            <div className="garage" ref={garageRef}>
              <button className={`garage-btn ${garage ? 'set' : ''}`} onClick={() => setGarageOpen((v) => !v)} aria-expanded={garageOpen}>
                <Car size={19} />
                <span className="garage-label">
                  <small>{garage ? 'My car' : 'Add your car'}</small>
                  <strong>{garage ? `${garage.model}` : 'For exact fit'}</strong>
                </span>
                <ChevronDown size={15} className="only-desktop-inline" />
              </button>
              {garageOpen && (
                <div className="garage-pop">
                  <VehicleSelector variant="card" onDone={() => setGarageOpen(false)} />
                </div>
              )}
            </div>
            <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist (${wishlist.length})`}>
              <Heart size={21} />
              {wishlist.length > 0 && <span className="dot-count">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={openDrawer} aria-label={`Cart (${count} items)`}>
              <ShoppingBag size={21} />
              {count > 0 && <span className="dot-count red">{count}</span>}
            </button>
          </div>
        </div>
        {mobileSearch && <div className="container only-mobile mobile-search"><SearchBox onDone={() => setMobileSearch(false)} /></div>}
      </div>

      <nav className="navbar only-desktop" aria-label="Main">
        <div className="container navbar-inner">
          <div className="mega" onMouseLeave={() => setMegaOpen(false)}>
            <button className="mega-btn" onClick={() => setMegaOpen((v) => !v)} onMouseEnter={() => setMegaOpen(true)} aria-expanded={megaOpen}>
              <Menu size={17} /> All Categories <ChevronDown size={15} />
            </button>
            {megaOpen && (
              <div className="mega-pop">
                {categories.map((c) => (
                  <Link key={c.id} to={`/shop?category=${c.id}`} className="mega-item">
                    <Img src={c.image} alt="" />
                    <span>
                      <strong>{c.name}</strong>
                      <small>{c.productCount} products</small>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
              {l.icon && <l.icon size={15} />} {l.label}
            </NavLink>
          ))}
          <span className="grow" />
          {settings?.emiPartner && <span className="nav-emi">EMI via {settings.emiPartner}</span>}
        </div>
      </nav>

      {mobileOpen && (
        <div className="mnav" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mnav-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="mnav-panel">
            <div className="row-between mnav-head">
              <img src={asset("images/logo.png")} alt="Addon Automotive" className="mnav-logo" />
              <button className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button>
            </div>
            <div className="mnav-links">
              <NavLink to="/" end>Home</NavLink>
              {links.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
              <NavLink to="/wishlist">Wishlist</NavLink>
            </div>
            <p className="mnav-sub">Categories</p>
            <div className="mnav-cats">
              {categories.map((c) => (
                <Link key={c.id} to={`/shop?category=${c.id}`}>{c.name}</Link>
              ))}
            </div>
            {settings?.phones && (
              <a className="btn btn-dark btn-block" href={`tel:${settings.phones[0].replace(/\s/g, '')}`}>
                <Phone size={16} /> Call {settings.phones[0]}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
