import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (s) => new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Call log for one referral partner. Each call counts towards "Phone calls done" in the KPI dashboard.
export default function PartnerCalls({ partnerId, onToast }) {
  const [open, setOpen] = useState(false);
  const [calls, setCalls] = useState(null);
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(`/referral-partners/${partnerId}/calls`);
      setCalls(res.data || []);
    } catch {
      onToast?.('Could not load the call log.');
    }
  }, [partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const add = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(`/referral-partners/${partnerId}/calls`, { calledOn: date, notes });
      setNotes('');
      onToast?.('Call logged.');
      await load();
    } catch (err) {
      onToast?.(err?.response?.data?.message || 'Could not log the call.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    try {
      await apiClient.delete(`/referral-partners/${partnerId}/calls/${c.id}`);
      await load();
    } catch {
      onToast?.('Could not remove the call.');
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" className="btn small" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide call log' : '📞 Call log'}
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          <form onSubmit={add} className="leads-pipeline__activity-form">
            <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            <input placeholder="What was discussed? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button type="submit" className="btn primary small" disabled={saving}>Log call</button>
          </form>
          <ul className="leads-pipeline__activity-list">
            {calls === null ? (
              <li className="muted">Loading…</li>
            ) : calls.length === 0 ? (
              <li className="muted">No calls logged yet.</li>
            ) : (
              calls.map((c) => (
                <li key={c.id}>
                  <b>{fmt(c.calledOn)}</b>{c.by && ` · ${c.by}`}
                  {c.notes && <div className="muted">{c.notes}</div>}
                  <button type="button" className="btn danger small" onClick={() => remove(c)}>Remove</button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
