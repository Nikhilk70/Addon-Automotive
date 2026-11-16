import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Car, PackageX, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api, qs } from '../lib/api';
import { inr } from '../lib/format';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard';

const SORTS = [
  ['popular', 'Most popular'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['discount', 'Biggest discount'],
  ['rating', 'Top rated'],
  ['newest', 'Newest'],
];
const PRICE_BANDS = [
  ['', '1000', 'Under Rs. 1,000'],
  ['1000', '5000', 'Rs. 1,000 - 5,000'],
  ['5000', '15000', 'Rs. 5,000 - 15,000'],
  ['15000', '', 'Above Rs. 15,000'],
];
const TAG_TITLES = { sale: 'On sale', new: 'New arrivals', bestseller: 'Bestsellers', emi: 'Available on EMI' };
const PAGE_SIZE = 12;

export default function Shop() {
  const { categories, garage, setGarage, categoryName } = useStore();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const f = Object.fromEntries(params.entries());
  const page = Number(f.page) || 1;
  const brands = f.brand ? f.brand.split(',') : [];

  useEffect(() => {
    const ctrl = new AbortController();
    setError('');
    api
      .get(`/products${qs({ ...f, limit: PAGE_SIZE })}`, { signal: ctrl.signal })
      .then(setData)
      .catch((e) => e.name !== 'AbortError' && setError(e.message));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const toggleBrand = (b) => set({ brand: (brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]).join(',') });

  const title = f.search
    ? `Results for "${f.search}"`
    : f.category ? categoryName(f.category)
    : f.tag ? TAG_TITLES[f.tag] || 'Shop'
    : 'All products';

  const chips = useMemo(() => {
    const c = [];
    if (f.category) c.push(['category', categoryName(f.category)]);
    if (f.make && f.model) c.push(['make,model', `Fits ${f.make} ${f.model}`]);
    if (f.search) c.push(['search', `"${f.search}"`]);
    if (f.tag) c.push(['tag', TAG_TITLES[f.tag] || f.tag]);
    brands.forEach((b) => c.push([`brand:${b}`, b]));
    if (f.minPrice || f.maxPrice) c.push(['minPrice,maxPrice', `${f.minPrice ? inr(f.minPrice) : 'Rs. 0'} - ${f.maxPrice ? inr(f.maxPrice) : 'any'}`]);
    if (f.inStock) c.push(['inStock', 'In stock']);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString(), categories]);

  const removeChip = (key) => {
    if (key.startsWith('brand:')) return toggleBrand(key.slice(6));
    set(Object.fromEntries(key.split(',').map((k) => [k, ''])));
  };

  const useMyCar = () => garage && set({ make: garage.make, model: garage.model });
  const pages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={14} /> <Link to="/shop">Shop</Link>
            {f.category && <><ChevronRight size={14} /> <span>{categoryName(f.category)}</span></>}
          </nav>
          <h1 className="display">{title}</h1>
          <p>{data ? `${data.total} product${data.total === 1 ? '' : 's'}` : 'Loading products...'}{f.make && f.model ? ` that fit your ${f.make} ${f.model}` : ''}</p>
        </div>
      </section>

      <div className="container shop">
        <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
          <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />
          <div className="filters-panel">
            <div className="row-between filters-mobile-head">
              <h3>Filters</h3>
              <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button>
            </div>

            <div className="fblock fblock-car">
              <h4><Car size={16} /> My car</h4>
              {f.make && f.model ? (
                <div className="car-pill">
                  <span>{f.make} {f.model}</span>
                  <button onClick={() => set({ make: '', model: '' })} aria-label="Show all cars"><X size={14} /></button>
                </div>
              ) : garage ? (
                <button className="btn btn-dark btn-sm btn-block" onClick={useMyCar}>Show parts for {garage.model}</button>
              ) : (
                <p className="muted tiny">Use "Add your car" at the top to filter by fitment.</p>
              )}
              {garage && f.make && f.model && (f.make !== garage.make || f.model !== garage.model) && (
                <button className="link tiny" onClick={() => setGarage({ make: f.make, model: f.model })}>Save as my car</button>
              )}
            </div>

            <div className="fblock">
              <h4>Category</h4>
              <ul className="flist">
                <li><button className={!f.category ? 'on' : ''} onClick={() => set({ category: '' })}>All categories</button></li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button className={f.category === c.id ? 'on' : ''} onClick={() => set({ category: c.id })}>
                      {c.name} <span>{c.productCount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fblock">
              <h4>Price</h4>
              <div className="flist">
                {PRICE_BANDS.map(([min, max, label]) => {
                  const on = (f.minPrice || '') === min && (f.maxPrice || '') === max;
                  return (
                    <label key={label} className="check">
                      <input type="radio" name="price" checked={on} onChange={() => set({ minPrice: min, maxPrice: max })} />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            {data?.facets?.brands?.length > 0 && (
              <div className="fblock">
                <h4>Brand</h4>
                <div className="flist">
                  {data.facets.brands.map((b) => (
                    <label key={b} className="check">
                      <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} /> {b}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="fblock">
              <h4>Availability</h4>
              <label className="check">
                <input type="checkbox" checked={f.inStock === '1'} onChange={(e) => set({ inStock: e.target.checked ? '1' : '' })} /> In stock only
              </label>
              <label className="check" style={{ marginTop: 10 }}>
                <input type="checkbox" checked={f.tag === 'emi'} onChange={(e) => set({ tag: e.target.checked ? 'emi' : '' })} /> EMI available
              </label>
            </div>

            <button className="btn btn-red btn-block filters-apply" onClick={() => setFiltersOpen(false)}>
              Show {data?.total ?? ''} results
            </button>
          </div>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <button className="btn btn-outline btn-sm filters-toggle" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={15} /> Filters {chips.length > 0 && `(${chips.length})`}
            </button>
            <div className="chips">
              {chips.map(([key, label]) => (
                <button key={key} className="chip" onClick={() => removeChip(key)}>
                  {label} <X size={12} />
                </button>
              ))}
              {chips.length > 1 && <button className="link tiny" onClick={() => setParams({})}>Clear all</button>}
            </div>
            <label className="sort">
              <span className="sr-only">Sort by</span>
              <select className="select" value={f.sort || 'popular'} onChange={(e) => set({ sort: e.target.value === 'popular' ? '' : e.target.value })}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}
          {!data && !error && <ProductGridSkeleton count={6} />}
          {data && data.items.length === 0 && (
            <div className="empty card">
              <PackageX size={48} />
              <h3>No products match these filters</h3>
              <p className="muted">Try removing a filter, or ask us on WhatsApp - we can source most parts within days.</p>
              <button className="btn btn-dark" onClick={() => setParams({})}>Clear filters</button>
            </div>
          )}
          {data && data.items.length > 0 && (
            <div className="pgrid pgrid-3">{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}

          {pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === page ? 'on' : ''} onClick={() => { set({ page: n === 1 ? '' : String(n) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-current={n === page ? 'page' : undefined}>
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
