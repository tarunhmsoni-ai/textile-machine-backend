import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const formatDate = (iso) =>
  new Date(iso.endsWith('Z') ? iso : `${iso}Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Subscribers({ onToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiClient.get('/subscribers');
      setItems(res.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email || s.whatsApp} from the list?`)) return;
    try {
      await apiClient.delete(`/subscribers/${s.id}`);
      setItems((prev) => prev.filter((x) => x.id !== s.id));
    } catch {
      onToast?.('Could not remove this subscriber.');
    }
  };

  const copyEmails = () => {
    const emails = items.map((s) => s.email).filter(Boolean).join(', ');
    navigator.clipboard?.writeText(emails);
    onToast?.(emails ? 'All emails copied.' : 'No emails to copy yet.');
  };

  const downloadCsv = () => {
    const rows = [['Email', 'WhatsApp', 'Date added'], ...items.map((s) => [s.email, s.whatsApp, formatDate(s.dateAdded)])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="card muted">Loading subscribers…</div>;
  if (loadError) {
    return (
      <div className="card">
        <p>Couldn't load the subscribers right now.</p>
        <button className="btn primary" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="toolbar">
        <span className="grow muted">
          {items.length} visitor{items.length === 1 ? '' : 's'} asked for special offers on the website.
        </span>
        <button className="btn" onClick={copyEmails}>Copy all emails</button>
        <button className="btn primary" onClick={downloadCsv} disabled={items.length === 0}>Download CSV</button>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">No sign-ups yet. They appear here when a visitor uses "Get special offers" on the website.</td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td>{s.email || '—'}</td>
                  <td>{s.whatsApp || '—'}</td>
                  <td>{formatDate(s.dateAdded)}</td>
                  <td>
                    <button type="button" className="btn danger small" onClick={() => remove(s)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
