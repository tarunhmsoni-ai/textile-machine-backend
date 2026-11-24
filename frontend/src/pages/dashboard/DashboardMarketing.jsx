import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => iso(new Date(Date.now() - n * 86400000));
const fmt = (s) => new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export default function MarketingTracker({ onToast }) {
  const [machines, setMachines] = useState([]);
  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(iso(new Date()));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState({ machineId: '', date: iso(new Date()), notes: '', picked: [] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const [m, c, p] = await Promise.all([
        apiClient.get('/machines/admin/all'),
        apiClient.get('/marketing/channels'),
        apiClient.get('/marketing', { params: { from, to } }),
      ]);
      setMachines((m.data || []).filter((x) => x.status === 'Live'));
      setChannels(c.data || []);
      setPosts(p.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (ch) =>
    setForm((f) => ({ ...f, picked: f.picked.includes(ch) ? f.picked.filter((x) => x !== ch) : [...f.picked, ch] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.machineId || form.picked.length === 0) {
      onToast?.('Choose a machine and at least one channel.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/marketing', {
        machineId: Number(form.machineId),
        channels: form.picked,
        postedOn: form.date,
        notes: form.notes,
      });
      onToast?.('Marketing activity saved.');
      setForm((f) => ({ ...f, notes: '', picked: [] }));
      await load();
    } catch (err) {
      onToast?.(err?.response?.data?.message || 'Could not save — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm('Remove this entry?')) return;
    try {
      await apiClient.delete(`/marketing/${p.id}`);
      setPosts((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      onToast?.('Could not remove the entry.');
    }
  };

  if (loading) return <div className="card muted">Loading marketing tracker…</div>;
  if (loadError) {
    return (
      <div className="card">
        <p>Couldn't load the marketing tracker right now.</p>
        <button className="btn primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const count = (machineId, ch) => posts.filter((p) => p.machineId === machineId && p.channel === ch).length;
  const last = (machineId) => {
    const mine = posts.filter((p) => p.machineId === machineId);
    return mine.length ? fmt(mine[0].postedOn) : null;
  };
  const label = (id) => {
    const m = machines.find((x) => x.id === id);
    return m ? `${m.brand} ${m.model}` : `Machine #${id}`;
  };

  return (
    <>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Log marketing done</h3>
        <form onSubmit={submit} className="leads-pipeline__activity-form" style={{ flexDirection: 'column' }}>
          <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })}>
            <option value="">Select a live machine…</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>#{m.id} {m.brand} {m.model}</option>
            ))}
          </select>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {channels.map((ch) => (
              <label key={ch} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={form.picked.includes(ch)} onChange={() => toggle(ch)} /> {ch}
              </label>
            ))}
          </div>
          <input type="date" value={form.date} max={iso(new Date())} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input placeholder="Note (optional) — e.g. group name, broadcast list" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </form>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="grow muted">Times each live machine was promoted on each channel.</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                {channels.map((ch) => <th key={ch}>{ch}</th>)}
                <th>Last done</th>
              </tr>
            </thead>
            <tbody>
              {machines.length === 0 ? (
                <tr><td colSpan={channels.length + 2} className="muted">No live machines yet.</td></tr>
              ) : (
                machines.map((m) => (
                  <tr key={m.id}>
                    <td>#{m.id} {m.brand} {m.model}</td>
                    {channels.map((ch) => {
                      const n = count(m.id, ch);
                      return <td key={ch}>{n || <span className="muted">—</span>}</td>;
                    })}
                    <td>{last(m.id) || <b style={{ color: '#c0392b' }}>Not marketed</b>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Entries in this period ({posts.length})</h3>
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Machine</th><th>Channel</th><th>Note</th><th>By</th><th></th></tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} className="muted">Nothing logged in this period.</td></tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id}>
                    <td>{fmt(p.postedOn)}</td>
                    <td>{label(p.machineId)}</td>
                    <td>{p.channel}</td>
                    <td>{p.notes || '—'}</td>
                    <td>{p.by || '—'}</td>
                    <td><button type="button" className="btn danger small" onClick={() => remove(p)}>Remove</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
