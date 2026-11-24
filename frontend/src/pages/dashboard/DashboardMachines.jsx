import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

// Same list the backend accepts at PUT /api/machines/{id}/status.
const STATUSES = ['Draft', 'Verified', 'Live', 'Sold', 'Archived'];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const formatPrice = (p) => (p ? `₹${Number(p).toLocaleString('en-IN')}` : 'On request');

const EMPTY_FORM = {
  brand: '', model: '', year: '', location: '', price: '', quantity: '', description: '',
  condition: '', sellerName: '', sellerPhone: '', sellerEmail: '', sellerWhatsApp: '',
};

export default function MachineInventory({ onToast, onChanged }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiClient.get('/machines/admin/all');
      setMachines(res.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshAll = async () => {
    await load();
    onChanged?.();
  };

  const filtered = machines.filter((m) => {
    const text = `${m.id} ${m.brand} ${m.model} ${m.type} ${m.subtype} ${m.year} ${m.seller?.name} ${m.location} ${m.status}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!statusFilter || m.status === statusFilter);
  });

  const changeStatus = async (m, status) => {
    try {
      await apiClient.put(`/machines/${m.id}/status`, { status });
      onToast?.(`${m.brand} ${m.model} is now ${status}.`);
      await refreshAll();
    } catch {
      onToast?.('Could not change the status — please try again.');
    }
  };

  const soldElsewhere = async (m) => {
    if (!window.confirm(`Record ${m.brand} ${m.model} as sold by another broker? It will be taken off the website.`)) return;
    try {
      await apiClient.post(`/machines/${m.id}/mark-sold-elsewhere`);
      onToast?.('Recorded as sold by another broker.');
      await refreshAll();
    } catch {
      onToast?.('Could not update this machine — please try again.');
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.brand} ${m.model} from the inventory? It will disappear from the website.`)) return;
    try {
      await apiClient.delete(`/machines/${m.id}`);
      onToast?.('Machine removed from inventory.');
      await refreshAll();
    } catch {
      onToast?.('Could not remove this machine — please try again.');
    }
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      brand: m.brand || '',
      model: m.model || '',
      year: m.year ? String(m.year) : '',
      location: m.location || '',
      price: m.price ? String(Math.round(m.price)) : '',
      quantity: m.quantity ? String(m.quantity) : '1',
      description: m.description || '',
      condition: m.condition || 'Good',
      sellerName: m.seller?.name || '',
      sellerPhone: m.seller?.phone || '',
      sellerEmail: m.seller?.email || '',
      sellerWhatsApp: m.seller?.whatsapp || '',
    });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.sellerName.trim() || !form.sellerPhone.trim()) {
      onToast?.('Seller name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('Type', capitalize(editing.type));
      fd.append('SubType', editing.subtype || '');
      fd.append('Brand', form.brand);
      fd.append('Model', form.model);
      if (form.year) fd.append('Year', form.year);
      fd.append('Location', form.location);
      if (form.price !== '') fd.append('AskingPrice', form.price);
      if (form.quantity) fd.append('Quantity', form.quantity);
      fd.append('Description', form.description);
      fd.append('Condition', form.condition);
      fd.append('SellerName', form.sellerName);
      fd.append('SellerPhone', form.sellerPhone);
      fd.append('SellerEmail', form.sellerEmail);
      fd.append('SellerWhatsApp', form.sellerWhatsApp);
      await apiClient.put(`/machines/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onToast?.('Machine updated.');
      setEditing(null);
      await refreshAll();
    } catch (err) {
      onToast?.(err?.response?.data?.message || 'Could not save the changes — please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && machines.length === 0) return <div className="card muted">Loading machines…</div>;
  if (loadError) {
    return (
      <div className="card">
        <p>Couldn't load the machines right now.</p>
        <button className="btn primary" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="toolbar">
        <input
          className="grow"
          placeholder="Search brand, model, seller, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Machine</th>
              <th>Type</th>
              <th>Year</th>
              <th>Qty</th>
              <th>Seller</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="muted">
                  {machines.length === 0 ? 'No machines yet. Use "Post Machine" to add the first one.' : 'No machines match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.brand} {m.model}</td>
                  <td>{capitalize(m.type)} · {m.subtype}</td>
                  <td>{m.year || '—'}</td>
                  <td>{m.quantity}</td>
                  <td>{m.seller?.name || '—'}<div className="muted">{m.seller?.phone}</div></td>
                  <td>{m.location}</td>
                  <td>{formatPrice(m.price)}</td>
                  <td>
                    <select value={m.status} onChange={(e) => changeStatus(m, e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn small" onClick={() => openEdit(m)}>Edit</button>{' '}
                    <button type="button" className="btn small" onClick={() => soldElsewhere(m)}>Sold elsewhere</button>{' '}
                    <button type="button" className="btn danger small" onClick={() => remove(m)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="leads-pipeline__detail-overlay" onClick={() => setEditing(null)}>
          <div className="leads-pipeline__detail" onClick={(e) => e.stopPropagation()}>
            <button className="leads-pipeline__close" onClick={() => setEditing(null)}>✕</button>
            <h3>Edit {editing.brand} {editing.model}</h3>
            <p className="muted">
              {capitalize(editing.type)} · {editing.subtype}. Photos, video and technical specifications stay as they are.
            </p>
            <form onSubmit={save} className="leads-pipeline__activity-form" style={{ flexDirection: 'column' }}>
              <input placeholder="Brand *" value={form.brand} onChange={set('brand')} required />
              <input placeholder="Model *" value={form.model} onChange={set('model')} required />
              <input placeholder="Year" type="number" value={form.year} onChange={set('year')} />
              <input placeholder="Location" value={form.location} onChange={set('location')} />
              <input placeholder="Asking price (₹) — leave empty for 'on request'" type="number" value={form.price} onChange={set('price')} />
              <input placeholder="Number of machines" type="number" min="1" value={form.quantity} onChange={set('quantity')} />
              <select value={form.condition} onChange={set('condition')}>
                {['Excellent', 'Good', 'Fair', 'Poor'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <textarea placeholder="Description" rows="3" value={form.description} onChange={set('description')} />
              <input placeholder="Seller name *" value={form.sellerName} onChange={set('sellerName')} required />
              <input placeholder="Seller phone *" value={form.sellerPhone} onChange={set('sellerPhone')} required />
              <input placeholder="Seller WhatsApp" value={form.sellerWhatsApp} onChange={set('sellerWhatsApp')} />
              <input placeholder="Seller email" value={form.sellerEmail} onChange={set('sellerEmail')} />
              <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
