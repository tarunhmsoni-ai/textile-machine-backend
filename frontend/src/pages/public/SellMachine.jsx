import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './SellMachine.css';

const TYPES = ['Knitting', 'Weaving', 'Warping'];
const EMPTY = {
  type: '', brand: '', model: '', year: '', location: '', askingPrice: '', description: '',
  name: '', phone: '', email: '',
  website: '', // honeypot: hidden from people, bots fill it
};

// Sellers use their own token key and client, so they never mix with the office admin login.
const TOKEN_KEY = 'sellerToken';
const NAME_KEY = 'sellerName';
const sellerClient = axios.create({ baseURL: apiClient.defaults.baseURL });
sellerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// What a seller sees for each internal pipeline step.
const sellerStatus = (s) => {
  if (s === 'Live') return 'Live on the website';
  if (s === 'Sold') return 'Sold';
  if (s === 'Archived') return 'Closed';
  return 'Our team is checking it';
};

const msg = (err, fallback) => err?.response?.data?.message || fallback;

export default function SellMachine() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [sellerName, setSellerName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [mode, setMode] = useState('signup'); // signup | login | guest
  const [auth, setAuth] = useState({ fullName: '', phone: '', password: '', website: '' });
  const [form, setForm] = useState(EMPTY);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setA = (k) => (e) => setAuth((f) => ({ ...f, [k]: e.target.value }));

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    setToken(null);
    setMine([]);
  }, []);

  const loadMine = useCallback(async () => {
    try {
      const res = await sellerClient.get('/sell/mine');
      setMine(res.data || []);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) signOut();
    }
  }, [signOut]);

  useEffect(() => {
    if (token) loadMine();
  }, [token, loadMine]);

  const finishAuth = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(NAME_KEY, data.fullName);
    setSellerName(data.fullName);
    setToken(data.token);
    setForm((f) => ({ ...f, name: data.fullName, phone: data.username }));
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        finishAuth((await sellerClient.post('/sell/register', auth)).data);
      } else {
        const res = (await sellerClient.post('/auth/login', { username: auth.phone, password: auth.password })).data;
        if (res.role !== 'Seller') throw new Error('wrong-account');
        finishAuth({ ...res, username: auth.phone });
      }
    } catch (err) {
      setError(err.message === 'wrong-account' ? 'Please log in with your seller phone number.' : msg(err, 'Could not continue. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const submitMachine = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await sellerClient.post('/sell', {
        ...form,
        year: form.year ? Number(form.year) : null,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : null,
      });
      setDone(true);
      setForm((f) => ({ ...EMPTY, name: f.name, phone: f.phone }));
      if (token) loadMine();
    } catch (err) {
      setError(msg(err, 'Could not send your details. Please call us instead.'));
    } finally {
      setBusy(false);
    }
  };

  const showForm = token || mode === 'guest';

  return (
    <div className="sell-page">
      <button type="button" className="sell-page__back" onClick={() => navigate('/')}>← Home</button>
      <div className="sell-page__card">
        <h1>Sell your machine</h1>

        {!token && (
          <div className="sell-page__tabs">
            {[['signup', 'Create account'], ['login', 'Log in'], ['guest', 'Without an account']].map(([id, label]) => (
              <button key={id} type="button" className={mode === id ? 'on' : ''} onClick={() => { setMode(id); setError(''); setDone(false); }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {token && (
          <p className="sell-page__sub">
            Signed in as <b>{sellerName}</b>. <button type="button" className="sell-page__link" onClick={signOut}>Log out</button>
          </p>
        )}

        {!showForm && (
          <form onSubmit={submitAuth}>
            <p className="sell-page__sub">
              {mode === 'signup'
                ? 'Create a free seller account with your phone number. You can then offer machines and see where each one is in our checks.'
                : 'Log in with the phone number and password you signed up with.'}
            </p>
            {mode === 'signup' && (
              <input placeholder="Your name *" value={auth.fullName} onChange={setA('fullName')} required maxLength={100} />
            )}
            <input placeholder="Phone number *" value={auth.phone} onChange={setA('phone')} required inputMode="tel" maxLength={20} />
            <input placeholder={mode === 'signup' ? 'Choose a password (6+ characters) *' : 'Password *'} type="password" value={auth.password} onChange={setA('password')} required minLength={6} />
            <input className="sell-page__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={auth.website} onChange={setA('website')} />
            {error && <div className="sell-page__error">{error}</div>}
            <button type="submit" className="sell-page__btn" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>
        )}

        {showForm && done && (
          <p className="sell-page__ok">
            Thank you! We have your details and will contact you shortly to collect photos and complete the listing.
            {token && ' You can follow its progress below.'}
          </p>
        )}

        {showForm && (
          <form onSubmit={submitMachine}>
            <p className="sell-page__sub">
              Tell us about your knitting, weaving or warping machine. Our team will call you, collect photos and a video,
              and list it after checking. Your contact details are never shown to buyers.
            </p>
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
            <input className="sell-page__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set('website')} />
            {error && <div className="sell-page__error">{error}</div>}
            <button type="submit" className="sell-page__btn" disabled={busy}>{busy ? 'Sending…' : 'Send details'}</button>
          </form>
        )}

        {token && mine.length > 0 && (
          <>
            <h2 className="sell-page__h2">Your machines</h2>
            <ul className="sell-page__list">
              {mine.map((m) => (
                <li key={m.id}>
                  <b>{[m.brand, m.model].filter(Boolean).join(' ') || `${m.type} machine`}</b>
                  <span>{sellerStatus(m.status)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
