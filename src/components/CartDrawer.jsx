import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Wrench, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Img, QtyStepper } from './ui';
import { inr } from '../lib/format';

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, update, remove, subtotal, installTotal, count } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const freeAt = settings?.freeShippingAbove || 0;
  const progress = freeAt ? Math.min(100, (subtotal / freeAt) * 100) : 100;

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  const go = (to) => {
    closeDrawer();
    navigate(to);
  };

  return (
    <div className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
      <div className="drawer-backdrop" onClick={closeDrawer} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your cart <span className="muted">({count})</span></h3>
          <button className="icon-btn" onClick={closeDrawer} aria-label="Close cart"><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty grow">
            <ShoppingBag size={44} />
            <h3>Your cart is empty</h3>
            <p className="muted">Find something that makes your car feel new again.</p>
            <button className="btn btn-red" onClick={() => go('/shop')}>Start shopping</button>
          </div>
        ) : (
          <>
            {freeAt > 0 && (
              <div className="ship-meter">
                <div className="row">
                  <Truck size={16} />
                  <span>
                    {subtotal >= freeAt
                      ? 'You unlocked free delivery!'
                      : <>Add <strong>{inr(freeAt - subtotal)}</strong> more for free delivery</>}
                  </span>
                </div>
                <div className="meter"><span style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            <div className="drawer-items">
              {items.map((i) => (
                <div className="citem" key={i.productId}>
                  <Link to={`/product/${i.slug}`} onClick={closeDrawer} className="citem-img"><Img src={i.image} alt={i.name} /></Link>
                  <div className="citem-body">
                    <Link to={`/product/${i.slug}`} onClick={closeDrawer} className="citem-name">{i.name}</Link>
                    <div className="row-between">
                      <QtyStepper small value={i.qty} max={Math.min(10, i.stock ?? 10)} onChange={(qty) => update(i.productId, { qty })} />
                      <strong>{inr(i.price * i.qty)}</strong>
                    </div>
                    {i.installAvailable && (
                      <label className="check install-toggle">
                        <input type="checkbox" checked={i.install} onChange={(e) => update(i.productId, { install: e.target.checked })} />
                        <Wrench size={13} /> Studio fitment {i.installCharge ? `+${inr(i.installCharge * i.qty)}` : '(free)'}
                      </label>
                    )}
                  </div>
                  <button className="icon-btn citem-remove" onClick={() => remove(i.productId)} aria-label={`Remove ${i.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <div className="row-between"><span className="muted">Subtotal</span><strong>{inr(subtotal)}</strong></div>
              {installTotal > 0 && <div className="row-between"><span className="muted">Fitment</span><strong>{inr(installTotal)}</strong></div>}
              <p className="muted tiny">Coupons and delivery are calculated at checkout.</p>
              <button className="btn btn-red btn-lg btn-block" onClick={() => go('/checkout')}>Checkout</button>
              <button className="btn btn-outline btn-block" onClick={() => go('/cart')}>View cart</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
