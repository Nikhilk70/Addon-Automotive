import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

/** "My Garage": choose make + model once, every product page shows whether it fits. */
export default function VehicleSelector({ variant = 'card', onDone }) {
  const { vehicles, garage, setGarage } = useStore();
  const navigate = useNavigate();
  const [make, setMake] = useState(garage?.make || '');
  const [model, setModel] = useState(garage?.model || '');

  useEffect(() => {
    setMake(garage?.make || '');
    setModel(garage?.model || '');
  }, [garage]);

  const models = vehicles.find((v) => v.make === make)?.models || [];

  const submit = (e) => {
    e.preventDefault();
    if (!make || !model) return;
    setGarage({ make, model });
    onDone?.();
    navigate(`/shop?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  };

  return (
    <form className={`vsel vsel-${variant}`} onSubmit={submit}>
      {variant === 'card' && (
        <div className="vsel-head">
          <span className="vsel-icon"><Car size={20} /></span>
          <div>
            <strong>Shop by your car</strong>
            <span>See only the parts that fit</span>
          </div>
        </div>
      )}
      <label className="field">
        <span className={variant === 'inline' ? 'sr-only' : ''}>Car brand</span>
        <select className="select" value={make} onChange={(e) => { setMake(e.target.value); setModel(''); }} required>
          <option value="">Select brand</option>
          {vehicles.map((v) => <option key={v.make}>{v.make}</option>)}
        </select>
      </label>
      <label className="field">
        <span className={variant === 'inline' ? 'sr-only' : ''}>Model</span>
        <select className="select" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make} required>
          <option value="">{make ? 'Select model' : 'Pick brand first'}</option>
          {models.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <button className="btn btn-red" type="submit" disabled={!make || !model}>
        <Search size={17} /> Find parts
      </button>
      {garage && variant === 'card' && (
        <button type="button" className="vsel-clear" onClick={() => setGarage(null)}>
          <X size={13} /> Clear saved car ({garage.make} {garage.model})
        </button>
      )}
    </form>
  );
}
