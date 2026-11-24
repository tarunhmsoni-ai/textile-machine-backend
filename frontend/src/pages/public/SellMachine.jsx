import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './SellMachine.css';

const TYPES = ['Knitting', 'Weaving', 'Warping'];
const EMPTY = {
  name: '', phone: '', email: '', type: '', brand: '', model: '', year: '', location: '', askingPrice: '', description: '',
  website: '', // honeypot: hidden from people, bots fill it
};

export default function SellMachine() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiClient.post('/sell', {
        ...form,
        year: form.year ? Number(form.year) : null,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : null,
      });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send your details. Please call us instead.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sell-page">
      <button type="button" className="sell-page__back" onClick={() => navigate('/')}>← Home</button>
      <div className="sell-page__card">
        <h1>Sell your machine</h1>
        {done ? (
          <>
            <p>Thank you! We have your details and will contact you shortly to collect photos and complete the listing.</p>
            <button type="button" className="sell-page__btn" onClick={() => navigate('/')}>Back to home</button>
          </>
        ) : (
          <>
            <p className="sell-page__sub">
              Tell us about your knitting, weaving or warping machine. Our team will call you, collect photos and a video,
              and list it after checking. Your contact details are never shown to buyers.
            </p>
            <form onSubmit={submit}>
              <input placeholder="Your name *" value={form.name} onChange={set('name')} required maxLength={100} />
              <input placeholder="Phone / WhatsApp number *" value={form.phone} onChange={set('phone')} required inputMode="tel" maxLength={20} />
              <input placeholder="Email (optional)" type="email" value={form.email} onChange={set('email')} maxLength={150} />
              <select value={form.type} onChange={set('type')} required>
                <option value="">Machine type *</option>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input placeholder="Brand" value={form.brand} onChange={set('brand')} maxLength={100} />
              <input placeholder="Model" value={form.model} onChange={set('model')} maxLength={100} />
              <input placeholder="Year of manufacture" type="number" value={form.year} onChange={set('year')} />
              <input placeholder="Where is the machine? (city)" value={form.location} onChange={set('location')} maxLength={150} />
              <input placeholder="Expected price in ₹ (optional)" type="number" value={form.askingPrice} onChange={set('askingPrice')} />
              <textarea placeholder="Anything else we should know" rows="3" value={form.description} onChange={set('description')} maxLength={2000} />
              <input
                className="sell-page__trap" tabIndex={-1} autoComplete="off" aria-hidden="true"
                name="website" value={form.website} onChange={set('website')}
              />
              {error && <div className="sell-page__error">{error}</div>}
              <button type="submit" className="sell-page__btn" disabled={busy}>{busy ? 'Sending…' : 'Send details'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
