import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { isoDate } from '../lib/format';
import { Spinner } from './ui';

const DAYS = 14;

/** Horizontal date strip + time-slot grid backed by /api/bookings/slots. */
export default function SlotPicker({ date, slot, onChange }) {
  const dates = useMemo(() => Array.from({ length: DAYS }, (_, i) => isoDate(i)), []);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api
      .get(`/bookings/slots?date=${date}`, { signal: ctrl.signal })
      .then((d) => setSlots(d.slots))
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [date]);

  return (
    <div className="slotpicker">
      <div className="datestrip" role="listbox" aria-label="Choose a date">
        {dates.map((d) => {
          const dt = new Date(`${d}T00:00:00`);
          return (
            <button
              type="button"
              key={d}
              role="option"
              aria-selected={d === date}
              className={`datechip ${d === date ? 'on' : ''}`}
              onClick={() => onChange({ date: d, slot: '' })}
            >
              <span>{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              <strong>{dt.getDate()}</strong>
              <span>{dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
            </button>
          );
        })}
      </div>

      {!date && <p className="muted small-note">Pick a date to see open slots.</p>}
      {date && loading && <div className="row muted"><Spinner /> Checking availability...</div>}
      {error && <div className="form-error">{error}</div>}
      {date && !loading && !error && (
        <div className="slots" role="listbox" aria-label="Choose a time">
          {slots.map((s) => (
            <button
              type="button"
              key={s.slot}
              role="option"
              aria-selected={s.slot === slot}
              disabled={!s.available}
              className={`slot ${s.slot === slot ? 'on' : ''}`}
              onClick={() => onChange({ date, slot: s.slot })}
              title={s.reason === 'full' ? 'Fully booked' : s.reason === 'closed' ? 'Closed' : s.reason === 'past' ? 'Too soon' : ''}
            >
              {s.slot}
              {!s.available && <small>{s.reason === 'full' ? 'Full' : s.reason === 'closed' ? 'Closed' : 'Unavailable'}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
