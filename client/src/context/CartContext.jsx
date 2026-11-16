import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../lib/storage';
import { useStore } from './StoreContext';

const CartContext = createContext(null);
const MAX_QTY = 10;

export function CartProvider({ children }) {
  const { toast } = useStore();
  const [items, setItems] = useState(() => load('addon_cart', []));
  const [coupon, setCoupon] = useState(() => load('addon_coupon', ''));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { save('addon_cart', items); }, [items]);
  useEffect(() => { save('addon_coupon', coupon); }, [coupon]);

  const add = useCallback(
    (product, qty = 1, install = false, { openDrawer = true } = {}) => {
      setItems((cur) => {
        const existing = cur.find((i) => i.productId === product.id);
        const limit = Math.min(MAX_QTY, product.stock ?? MAX_QTY);
        if (existing) {
          return cur.map((i) =>
            i.productId === product.id ? { ...i, qty: Math.min(limit, i.qty + qty), install: i.install || install } : i,
          );
        }
        return [
          ...cur,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images?.[0],
            price: product.price,
            mrp: product.mrp,
            stock: product.stock,
            installAvailable: product.installation?.available,
            installCharge: product.installation?.charge || 0,
            qty: Math.min(limit, qty),
            install,
          },
        ];
      });
      toast(`Added to cart: ${product.name.slice(0, 40)}${product.name.length > 40 ? '...' : ''}`);
      if (openDrawer) setDrawerOpen(true);
    },
    [toast],
  );

  const update = useCallback((productId, patch) => {
    setItems((cur) =>
      cur.map((i) =>
        i.productId === productId
          ? { ...i, ...patch, qty: Math.max(1, Math.min(patch.qty ?? i.qty, Math.min(MAX_QTY, i.stock ?? MAX_QTY))) }
          : i,
      ),
    );
  }, []);

  const remove = useCallback((productId) => setItems((cur) => cur.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => {
    setItems([]);
    setCoupon('');
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const installTotal = items.reduce((s, i) => s + (i.install ? i.installCharge * i.qty : 0), 0);
    return {
      items, count, subtotal, installTotal,
      add, update, remove, clear,
      coupon, setCoupon,
      drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
      payload: items.map(({ productId, qty, install }) => ({ productId, qty, install })),
    };
  }, [items, add, update, remove, clear, coupon, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
