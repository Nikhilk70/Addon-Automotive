import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { inr, fmtDate } from '../../lib/format';
import { Img, Spinner, StatusChip } from '../../components/ui';
import { useAdmin, PageHead } from './AdminPages';

const TAGS = ['bestseller', 'new', 'sale', 'emi'];

function Modal({ title, onClose, children }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-body">
        <div className="row-between modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

const specsToText = (specs) => Object.entries(specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
const textToSpecs = (t) => Object.fromEntries(t.split('\n').map((l) => l.split(/:(.*)/s).map((s) => s?.trim())).filter(([k, v]) => k && v));
const fitmentToText = (f) => (f === 'universal' || !f ? '' : f.map((x) => `${x.make}: ${x.models.join(', ')}`).join('\n'));
const textToFitment = (t) => {
  const rows = t.split('\n').map((l) => l.split(/:(.*)/s)).filter(([m, models]) => m?.trim() && models?.trim());
  return rows.length ? rows.map(([make, models]) => ({ make: make.trim(), models: models.split(',').map((s) => s.trim()).filter(Boolean) })) : 'universal';
};

function ProductForm({ product, onClose, onSaved }) {
  const { categories, vehicles, toast } = useStore();
  const [f, setF] = useState(() => ({
    name: product?.name || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    brand: product?.brand || '',
    price: product?.price ?? '',
    mrp: product?.mrp ?? '',
    stock: product?.stock ?? 10,
    images: (product?.images || []).join('\n'),
    description: product?.description || '',
    highlights: (product?.highlights || []).join('\n'),
    specs: specsToText(product?.specs),
    fitment: fitmentToText(product?.fitment),
    tags: product?.tags || [],
    installAvailable: product?.installation?.available ?? true,
    installCharge: product?.installation?.charge ?? 0,
    active: product?.active ?? true,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const firstImage = f.images.split('\n').map((s) => s.trim()).find(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      name: f.name, categoryId: f.categoryId, brand: f.brand,
      price: Number(f.price), mrp: Number(f.mrp || f.price), stock: Number(f.stock),
      images: f.images, description: f.description, highlights: f.highlights,
      specs: textToSpecs(f.specs), fitment: textToFitment(f.fitment), tags: f.tags,
      installation: { available: f.installAvailable, charge: Number(f.installCharge) || 0 },
      active: f.active,
    };
    try {
      const saved = product
        ? await api.put(`/admin/products/${product.id}`, body, { admin: true })
        : await api.post('/admin/products', body, { admin: true });
      toast(product ? 'Product updated' : 'Product added');
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <label className="field full"><span>Product name</span><input className="input" value={f.name} onChange={set('name')} required /></label>
          <label className="field"><span>Category</span>
            <select className="select" value={f.categoryId} onChange={set('categoryId')}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
          <label className="field"><span>Brand</span><input className="input" value={f.brand} onChange={set('brand')} required /></label>
          <label className="field"><span>Selling price (Rs.)</span><input className="input" type="number" min="0" value={f.price} onChange={set('price')} required /></label>
          <label className="field"><span>MRP (Rs.)</span><input className="input" type="number" min="0" value={f.mrp} onChange={set('mrp')} /></label>
          <label className="field"><span>Stock</span><input className="input" type="number" min="0" value={f.stock} onChange={set('stock')} required /></label>
          <div className="field"><span>Tags</span>
            <div className="row" style={{ flexWrap: 'wrap', minHeight: 46 }}>
              {TAGS.map((t) => (
                <label key={t} className="check"><input type="checkbox" checked={f.tags.includes(t)} onChange={(e) => setF((x) => ({ ...x, tags: e.target.checked ? [...x.tags, t] : x.tags.filter((y) => y !== t) }))} /> {t}</label>
              ))}
            </div>
          </div>
          <label className="field full"><span>Image URLs (one per line)</span>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <textarea className="textarea grow" value={f.images} onChange={set('images')} placeholder="https://... or /images/my-photo.jpg" />
              <div className="img-preview"><Img src={firstImage} alt="Preview" /></div>
            </div>
            <small>Put your own photos in client/public/images and use /images/filename.jpg</small>
          </label>
          <label className="field full"><span>Description</span><textarea className="textarea" value={f.description} onChange={set('description')} /></label>
          <label className="field"><span>Highlights (one per line)</span><textarea className="textarea" value={f.highlights} onChange={set('highlights')} /></label>
          <label className="field"><span>Specifications ("Key: Value" per line)</span><textarea className="textarea" value={f.specs} onChange={set('specs')} placeholder={'Screen: 9 inch\nWarranty: 1 Year'} /></label>
          <label className="field full"><span>Fits these cars (leave empty for universal)</span>
            <textarea className="textarea" value={f.fitment} onChange={set('fitment')} placeholder={'Maruti Suzuki: Swift, Baleno\nHyundai: Creta'} />
            <small>Format "Brand: Model, Model". Brands: {vehicles.map((v) => v.make).join(', ')}</small>
          </label>
          <label className="check"><input type="checkbox" checked={f.installAvailable} onChange={set('installAvailable')} /> Studio fitment available</label>
          <label className="field"><span>Fitment charge per unit (Rs.)</span><input className="input" type="number" min="0" value={f.installCharge} onChange={set('installCharge')} disabled={!f.installAvailable} /></label>
          <label className="check full"><input type="checkbox" checked={f.active} onChange={set('active')} /> Visible in store</label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-red" disabled={busy}>{busy && <Spinner />} Save product</button>
        </div>
      </form>
    </Modal>
  );
}

export function ProductsAdmin() {
  const { data, setData, error } = useAdmin('/admin/products');
  const { categoryName, toast } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [q, setQ] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  const rows = (data || []).filter((p) => (showHidden || p.active) && `${p.name} ${p.brand} ${p.id}`.toLowerCase().includes(q.toLowerCase()));

  const hide = async (p) => {
    if (!window.confirm(`Hide "${p.name}" from the store?`)) return;
    try {
      await api.del(`/admin/products/${p.id}`, { admin: true });
      setData((d) => d.map((x) => (x.id === p.id ? { ...x, active: false } : x)));
      toast('Product hidden');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <PageHead title="Products">
        <button className="btn btn-red btn-sm" onClick={() => setEditing('new')}><Plus size={16} /> Add product</button>
      </PageHead>
      <div className="row" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search" style={{ maxWidth: 360, height: 42, flex: 1 }}>
          <Search size={17} className="search-icon" />
          <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </div>
        <label className="check"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /> Show hidden</label>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="card">
        {!data ? <div className="card-pad"><Spinner /></div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="row">
                        <span className="sum-thumb"><Img src={p.images?.[0]} alt="" /></span>
                        <span><strong className="clamp1">{p.name}</strong><span className="muted tiny">{p.id} | {p.brand}</span></span>
                      </div>
                    </td>
                    <td className="tiny">{categoryName(p.categoryId)}</td>
                    <td><strong>{inr(p.price)}</strong><br /><s className="muted tiny">{inr(p.mrp)}</s></td>
                    <td><StatusChip status={p.stock === 0 ? 'cancelled' : p.stock <= 5 ? 'ready' : 'completed'} label={String(p.stock)} /></td>
                    <td><StatusChip status={p.active ? 'completed' : 'pending'} label={p.active ? 'Live' : 'Hidden'} /></td>
                    <td>
                      <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                        <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={16} /></button>
                        {p.active && <button className="icon-btn" onClick={() => hide(p)} aria-label={`Hide ${p.name}`}><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setData((d) => (d.some((x) => x.id === saved.id) ? d.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...d]));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function OfferForm({ offer, onClose, onSaved }) {
  const { categories, toast } = useStore();
  const [f, setF] = useState(() => ({
    code: offer?.code || '', title: offer?.title || '', description: offer?.description || '',
    type: offer?.type || 'percent', value: offer?.value ?? 10, minOrder: offer?.minOrder ?? 0,
    maxDiscount: offer?.maxDiscount ?? '', validTill: offer?.validTill || '',
    categoryIds: offer?.categoryIds || [], active: offer?.active ?? true, accent: offer?.accent || 'red',
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = { ...f, value: Number(f.value), minOrder: Number(f.minOrder) || 0, maxDiscount: f.maxDiscount ? Number(f.maxDiscount) : null };
    try {
      const saved = offer ? await api.put(`/admin/offers/${offer.id}`, body, { admin: true }) : await api.post('/admin/offers', body, { admin: true });
      toast('Offer saved');
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={offer ? 'Edit offer' : 'New offer'} onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <label className="field"><span>Coupon code</span><input className="input" value={f.code} onChange={set('code')} required style={{ textTransform: 'uppercase' }} /></label>
          <label className="field"><span>Title</span><input className="input" value={f.title} onChange={set('title')} required placeholder="Flat 10% off" /></label>
          <label className="field full"><span>Description</span><input className="input" value={f.description} onChange={set('description')} /></label>
          <label className="field"><span>Type</span>
            <select className="select" value={f.type} onChange={set('type')}><option value="percent">Percent off</option><option value="flat">Flat Rs. off</option></select>
          </label>
          <label className="field"><span>{f.type === 'percent' ? 'Percent' : 'Amount (Rs.)'}</span><input className="input" type="number" min="1" value={f.value} onChange={set('value')} required /></label>
          <label className="field"><span>Minimum order (Rs.)</span><input className="input" type="number" min="0" value={f.minOrder} onChange={set('minOrder')} /></label>
          <label className="field"><span>Max discount (Rs., optional)</span><input className="input" type="number" min="0" value={f.maxDiscount} onChange={set('maxDiscount')} /></label>
          <label className="field"><span>Valid till</span><input className="input" type="date" value={f.validTill} onChange={set('validTill')} /></label>
          <label className="field"><span>Card colour</span>
            <select className="select" value={f.accent} onChange={set('accent')}><option value="red">Red</option><option value="dark">Black</option><option value="steel">Steel</option></select>
          </label>
          <div className="field full"><span>Only for categories (none = whole store)</span>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <label key={c.id} className="check"><input type="checkbox" checked={f.categoryIds.includes(c.id)} onChange={(e) => setF((x) => ({ ...x, categoryIds: e.target.checked ? [...x.categoryIds, c.id] : x.categoryIds.filter((y) => y !== c.id) }))} /> {c.name}</label>
              ))}
            </div>
          </div>
          <label className="check full"><input type="checkbox" checked={f.active} onChange={set('active')} /> Active</label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-red" disabled={busy}>{busy && <Spinner />} Save offer</button>
        </div>
      </form>
    </Modal>
  );
}

export function OffersAdmin() {
  const { data, setData, error } = useAdmin('/admin/offers');
  const { toast } = useStore();
  const [editing, setEditing] = useState(null);
  const remove = async (o) => {
    if (!window.confirm(`Delete coupon ${o.code}?`)) return;
    try {
      await api.del(`/admin/offers/${o.id}`, { admin: true });
      setData((d) => d.filter((x) => x.id !== o.id));
      toast('Offer deleted');
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  return (
    <>
      <PageHead title="Offers & coupons"><button className="btn btn-red btn-sm" onClick={() => setEditing('new')}><Plus size={16} /> New offer</button></PageHead>
      {error && <div className="form-error">{error}</div>}
      <div className="card">
        {!data ? <div className="card-pad"><Spinner /></div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Code</th><th>Offer</th><th>Rule</th><th>Valid till</th><th>Status</th><th /></tr></thead>
              <tbody>
                {data.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.code}</strong></td>
                    <td>{o.title}<br /><span className="muted tiny">{o.description}</span></td>
                    <td className="tiny">{o.type === 'percent' ? `${o.value}%` : inr(o.value)} off{o.minOrder ? `, min ${inr(o.minOrder)}` : ''}{o.maxDiscount ? `, max ${inr(o.maxDiscount)}` : ''}</td>
                    <td className="tiny">{o.validTill ? fmtDate(o.validTill) : 'No expiry'}</td>
                    <td><StatusChip status={o.active ? 'completed' : 'pending'} label={o.active ? 'Active' : 'Off'} /></td>
                    <td>
                      <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                        <button className="icon-btn" onClick={() => setEditing(o)} aria-label={`Edit ${o.code}`}><Pencil size={16} /></button>
                        <button className="icon-btn" onClick={() => remove(o)} aria-label={`Delete ${o.code}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editing && (
        <OfferForm
          offer={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setData((d) => (d.some((x) => x.id === saved.id) ? d.map((x) => (x.id === saved.id ? saved : x)) : [...d, saved]));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
