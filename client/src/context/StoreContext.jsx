import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { load, save } from '../lib/storage';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [garage, setGarageState] = useState(() => load('addon_garage', null));
  const [wishlist, setWishlist] = useState(() => load('addon_wishlist', []));
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => {
    Promise.all([api.get('/settings'), api.get('/categories'), api.get('/vehicles')])
      .then(([s, c, v]) => {
        setSettings(s);
        setCategories(c);
        setVehicles(v);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => { save('addon_wishlist', wishlist); }, [wishlist]);

  const setGarage = useCallback((g) => {
    setGarageState(g);
    save('addon_garage', g);
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const toggleWishlist = useCallback(
    (product) => {
      const has = wishlist.some((x) => x.id === product.id);
      toast(has ? 'Removed from wishlist' : 'Saved to wishlist', has ? 'info' : 'success');
      setWishlist((w) =>
        has
          ? w.filter((x) => x.id !== product.id)
          : [...w.filter((x) => x.id !== product.id), { id: product.id, slug: product.slug, name: product.name, price: product.price, mrp: product.mrp, image: product.images?.[0], brand: product.brand }],
      );
    },
    [toast, wishlist],
  );

  const value = useMemo(
    () => ({
      settings, categories, vehicles, loadError,
      garage, setGarage,
      wishlist, toggleWishlist, inWishlist: (id) => wishlist.some((x) => x.id === id),
      toasts, toast,
      categoryName: (id) => categories.find((c) => c.id === id)?.name || id,
    }),
    [settings, categories, vehicles, loadError, garage, setGarage, wishlist, toggleWishlist, toasts, toast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
