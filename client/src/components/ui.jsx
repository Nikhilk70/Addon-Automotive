import { useEffect, useState } from 'react';
import { Star, Minus, Plus, ImageOff } from 'lucide-react';
import { inr, discountPct } from '../lib/format';

/** Image that degrades to a branded placeholder if the URL fails. */
export function Img({ src, alt, className, ...rest }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => { setFailed(!src); }, [src]);
  if (failed) {
    return (
      <div className={`img-fallback ${className || ''}`} role="img" aria-label={alt}>
        <ImageOff size={28} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}

export function Stars({ value = 0, size = 14, count }) {
  return (
    <span className="stars" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'on' : ''} fill="currentColor" strokeWidth={0} />
      ))}
      {count !== undefined && <span className="stars-count">({count})</span>}
    </span>
  );
}

export function Price({ price, mrp, size = 'md' }) {
  const off = discountPct(price, mrp);
  return (
    <span className={`price price-${size}`}>
      <strong>{inr(price)}</strong>
      {off > 0 && (
        <>
          <s>{inr(mrp)}</s>
          <em>{off}% off</em>
        </>
      )}
    </span>
  );
}

export function QtyStepper({ value, onChange, max = 10, small }) {
  return (
    <div className={`qty ${small ? 'qty-sm' : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={14} />
      </button>
    </div>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function StatusChip({ status, label }) {
  const tone = {
    placed: 'blue', requested: 'blue', new: 'blue',
    confirmed: 'amber', ready: 'amber', shipped: 'amber', 'in-progress': 'amber', contacted: 'amber',
    completed: 'green', paid: 'green', closed: 'green',
    cancelled: 'red', refunded: 'red', pending: '',
  }[status];
  return <span className={`chip ${tone ? `chip-${tone}` : ''}`}>{label || status}</span>;
}

export function Countdown({ to }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, to - now);
  const parts = [
    ['Hrs', Math.floor(diff / 3.6e6)],
    ['Min', Math.floor((diff % 3.6e6) / 6e4)],
    ['Sec', Math.floor((diff % 6e4) / 1000)],
  ];
  return (
    <div className="countdown" role="timer">
      {parts.map(([label, v]) => (
        <div key={label}>
          <strong>{String(v).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
