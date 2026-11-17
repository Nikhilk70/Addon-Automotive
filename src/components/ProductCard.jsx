import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Img, Stars, Price } from './ui';
import { discountPct, fitsVehicle } from '../lib/format';

export default function ProductCard({ product }) {
  const { garage, toggleWishlist, inWishlist } = useStore();
  const { add } = useCart();
  const off = discountPct(product.price, product.mrp);
  const fits = fitsVehicle(product, garage);
  const saved = inWishlist(product.id);
  const soldOut = product.stock <= 0;

  return (
    <article className="pcard">
      <Link to={`/product/${product.slug}`} className="pcard-media" aria-label={product.name}>
        {off > 0 && <span className="badge-off">-{off}%</span>}
        <Img src={product.images?.[0]} alt={product.name} />
        <div className="pcard-tags">
          {product.tags?.includes('bestseller') && <span className="chip chip-dark">Bestseller</span>}
          {product.tags?.includes('new') && <span className="chip chip-red">New</span>}
        </div>
      </Link>
      <button
        type="button"
        className={`pcard-wish ${saved ? 'on' : ''}`}
        onClick={() => toggleWishlist(product)}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={saved}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="pcard-body">
        <div className="row-between">
          <span className="pcard-brand">{product.brand}</span>
          {product.rating > 0 && <Stars value={product.rating} size={12} count={product.reviewCount} />}
        </div>
        <Link to={`/product/${product.slug}`} className="pcard-title">{product.name}</Link>

        {fits === true && (
          <span className="fit fit-yes"><CheckCircle2 size={14} /> Fits your {garage.model}</span>
        )}
        {fits === false && (
          <span className="fit fit-no"><AlertCircle size={14} /> Not listed for {garage.model}</span>
        )}
        {fits === null && product.installation?.available && (
          <span className="fit fit-neutral"><Wrench size={13} /> Studio fitment available</span>
        )}

        <div className="pcard-foot">
          <Price price={product.price} mrp={product.mrp} />
          <button
            type="button"
            className="btn btn-dark btn-sm pcard-add"
            disabled={soldOut}
            onClick={() => add(product, 1, false)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={15} />
            <span>{soldOut ? 'Sold out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="pgrid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 400 }} />
      ))}
    </div>
  );
}
