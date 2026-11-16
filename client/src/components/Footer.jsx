import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin, Clock, Mail, Send, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { waLink } from '../lib/format';
import { Spinner } from './ui';

export function Newsletter({ compact }) {
  const { toast } = useStore();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/newsletter', { email });
      setDone(true);
      setEmail('');
      toast("You're subscribed. Watch your inbox for deals!");
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`newsletter ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <input
        className="input"
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <button className="btn btn-red" disabled={busy}>
        {busy ? <Spinner /> : <Send size={16} />} {done ? 'Subscribed' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function Footer() {
  const { settings, categories } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <div className="container footer-cta-inner">
          <div>
            <p className="slash-tag">Stay in the fast lane</p>
            <h3 className="display">Get offers before anyone else</h3>
          </div>
          <Newsletter />
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo"><img src="/images/logo.png" alt="Addon Automotive" /></div>
          <p>Car accessories, audio and styling, fitted by people who love cars. Upgrade your ride and elevate your style.</p>
          <div className="row footer-social">
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="social"><Instagram size={18} /></a>
            )}
            {settings?.whatsapp && (
              <a href={waLink(settings.whatsapp, 'Hi Addon Automotive!')} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="social"><MessageCircle size={18} /></a>
            )}
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}><Link to={`/shop?category=${c.id}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Help</h4>
          <ul>
            <li><Link to="/track-order">Track your order</Link></li>
            <li><Link to="/book-installation">Book installation</Link></li>
            <li><Link to="/offers">Offers & coupons</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
            <li><Link to="/contact#policies">Shipping, returns & warranty</Link></li>
          </ul>
        </div>

        <div>
          <h4>Visit the studio</h4>
          <ul className="footer-contact">
            {settings?.phones?.map((p) => (
              <li key={p}><Phone size={15} /><a href={`tel:${p.replace(/\s/g, '')}`}>{p}</a></li>
            ))}
            {settings?.email && <li><Mail size={15} /><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
            {settings?.address && <li><MapPin size={15} /><span>{settings.address}</span></li>}
            {settings?.hours && <li><Clock size={15} /><span>{settings.hours}</span></li>}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container row-between">
          <span>&copy; {year} Addon Automotive. All rights reserved.</span>
          <span className="pay-methods">
            <span>UPI</span><span>Cash</span><span>Cards at store</span><span>EMI</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
