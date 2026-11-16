import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CalendarCheck, Package, BadgePercent, Clapperboard, Inbox, LogOut, ExternalLink, Lock, Menu } from 'lucide-react';
import { api, adminToken } from '../../lib/api';
import { Spinner } from '../../components/ui';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api.post('/admin/login', { password });
      adminToken.set(token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-login">
      <form className="card card-pad stack" onSubmit={submit}>
        <img src="/images/logo.png" alt="Addon Automotive" style={{ height: 44, margin: '0 auto 8px', mixBlendMode: 'multiply' }} />
        <h2 style={{ textAlign: 'center' }}>Admin panel</h2>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-red btn-block" disabled={busy}>{busy ? <Spinner /> : <Lock size={16} />} Log in</button>
        <Link to="/" className="link tiny" style={{ alignSelf: 'center' }}>Back to store</Link>
      </form>
    </div>
  );
}

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/offers', label: 'Offers', icon: BadgePercent },
  { to: '/admin/reels', label: 'Reels', icon: Clapperboard },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
];

export default function AdminLayout() {
  const [authed, setAuthed] = useState(Boolean(adminToken.get()));
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const out = () => setAuthed(false);
    window.addEventListener('admin-logout', out);
    return () => window.removeEventListener('admin-logout', out);
  }, []);

  useEffect(() => { document.title = 'Admin | Addon Automotive'; }, []);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const logout = () => {
    adminToken.clear();
    setAuthed(false);
    navigate('/admin');
  };

  return (
    <div className={`admin ${navOpen ? 'nav-open' : ''}`}>
      <aside className="admin-side">
        <div className="admin-brand"><img src="/images/logo.png" alt="Addon Automotive" /></div>
        <nav onClick={() => setNavOpen(false)}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" target="_blank"><ExternalLink size={16} /> View store</Link>
          <button onClick={logout}><LogOut size={16} /> Log out</button>
        </div>
      </aside>
      <div className="admin-backdrop" onClick={() => setNavOpen(false)} />
      <div className="admin-main">
        <div className="admin-topbar">
          <button className="icon-btn admin-burger" onClick={() => setNavOpen(true)} aria-label="Menu"><Menu size={20} /></button>
          <span className="muted tiny">Addon Automotive admin</span>
        </div>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
