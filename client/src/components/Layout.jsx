import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CheckCircle2, Info, AlertTriangle, MessageCircle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useStore } from '../context/StoreContext';
import { waLink } from '../lib/format';

export function Toasts() {
  const { toasts } = useStore();
  const icons = { success: CheckCircle2, info: Info, error: AlertTriangle };
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} /> <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

function WhatsAppFab() {
  const { settings } = useStore();
  if (!settings?.whatsapp) return null;
  return (
    <a
      className="wa-fab"
      href={waLink(settings.whatsapp, 'Hi Addon Automotive! I would like to know more about...')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={26} />
      <span>Chat with us</span>
    </a>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { loadError } = useStore();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <Header />
      {loadError && (
        <div className="container" style={{ paddingTop: 16 }}>
          <div className="form-error">{loadError}</div>
        </div>
      )}
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </>
  );
}
