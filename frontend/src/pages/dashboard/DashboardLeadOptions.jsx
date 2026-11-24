import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

// Mirrors MachineProjectAPI.Models.OptionStages.
const OPTION_STAGES = [
  'Suggested', 'Sent on WhatsApp', 'Phone call done', 'Visit planned', 'Visit done',
  'Liked', 'Negotiation', 'Rejected', 'Won',
];
const price = (p) => (p ? `₹${Number(p).toLocaleString('en-IN')}` : 'price on request');

// The machines offered to one lead: system suggestions on top, then each offered machine with its own stage.
export default function LeadMachineOptions({ leadId, onToast }) {
  const [options, setOptions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveMachines, setLiveMachines] = useState([]);
  const [pick, setPick] = useState('');

  const load = useCallback(async () => {
    try {
      const [o, m] = await Promise.all([
        apiClient.get(`/leads/${leadId}/options`),
        apiClient.get(`/leads/${leadId}/matches`),
      ]);
      setOptions(o.data || []);
      setMatches(m.data || []);
    } catch {
      onToast?.('Could not load the machines for this lead.');
    }
  }, [leadId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiClient.get('/machines').then((r) => setLiveMachines(r.data || [])).catch(() => {});
  }, []);

  const offer = async (machineId) => {
    try {
      await apiClient.post(`/leads/${leadId}/options`, { machineId });
      setPick('');
      await load();
    } catch (err) {
      onToast?.(err?.response?.data?.message || 'Could not add the machine.');
    }
  };

  const setStage = async (o, stage) => {
    try {
      await apiClient.put(`/leads/${leadId}/options/${o.id}`, { machineId: o.machineId, stage });
      await load();
    } catch {
      onToast?.('Could not update the stage.');
    }
  };

  const remove = async (o) => {
    try {
      await apiClient.delete(`/leads/${leadId}/options/${o.id}`);
      await load();
    } catch {
      onToast?.('Could not remove the machine.');
    }
  };

  const offered = new Set(options.map((o) => o.machineId));
  const suggestions = matches.filter((m) => !offered.has(m.machineId));
  const others = liveMachines.filter((m) => !offered.has(m.id));

  return (
    <div>
      <h4>Machines for this lead</h4>

      {options.length === 0 ? (
        <p className="muted">No machine offered yet. Offer one of the suggestions below, or pick any live machine.</p>
      ) : (
        <ul className="leads-pipeline__activity-list">
          {options.map((o) => (
            <li key={o.id}>
              <b>#{o.machineId} {o.label}</b>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <select value={o.stage} onChange={(e) => setStage(o, e.target.value)}>
                  {OPTION_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button type="button" className="btn danger small" onClick={() => remove(o)}>Remove</button>
              </div>
              {o.by && <div className="muted">updated by {o.by}</div>}
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <>
          <h4>Suggested by the system</h4>
          <ul className="leads-pipeline__activity-list">
            {suggestions.map((m) => (
              <li key={m.machineId}>
                <b>#{m.machineId} {m.label}</b> · {m.location || 'location not given'} · {price(m.price)}
                <div className="muted">Match: {m.reasons.join(', ')}</div>
                <button type="button" className="btn small" onClick={() => offer(m.machineId)}>Offer this machine</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <select value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Add another live machine…</option>
          {others.map((m) => (
            <option key={m.id} value={m.id}>#{m.id} {m.brand} {m.model}</option>
          ))}
        </select>
        <button type="button" className="btn small" disabled={!pick} onClick={() => offer(Number(pick))}>Add</button>
      </div>
    </div>
  );
}
