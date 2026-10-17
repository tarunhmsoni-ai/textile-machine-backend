import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

// Mirrors MachineProjectAPI.Models.LeadStatus / ActivityTypes — keep in sync with the backend.
const STAGES = ['New', 'Qualified', 'Contacted', 'Factory Visit', 'Negotiation', 'Won', 'Lost'];
const ACTIVITY_TYPES = [
  'Phone Call', 'WhatsApp', 'Email', 'Factory Visit', 'Direct Meeting', 'Marketing Post', 'Negotiation', 'Deal', 'Other',
];

export function LeadsPipeline({ onToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityForm, setActivityForm] = useState({ activityType: 'Phone Call', channel: '', description: '' });
  const [markSoldMachineId, setMarkSoldMachineId] = useState('');

  const load = () => {
    setLoading(true);
    apiClient
      .get('/leads', { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setLeads(res.data || []))
      .catch(() => onToast?.('Could not load leads — check the connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openLead = (id) => {
    apiClient.get(`/leads/${id}`).then((res) => setSelectedLead(res.data));
  };

  const updateStatus = async (lead, status) => {
    try {
      await apiClient.put(`/leads/${lead.id}`, { ...lead, status });
      onToast?.(`Lead moved to ${status}.`);
      load();
      if (selectedLead?.id === lead.id) openLead(lead.id);
    } catch {
      onToast?.('Could not update the lead status.');
    }
  };

  const submitActivity = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await apiClient.post(`/leads/${selectedLead.id}/activities`, activityForm);
      setActivityForm({ activityType: 'Phone Call', channel: '', description: '' });
      openLead(selectedLead.id);
      load();
      onToast?.('Activity logged.');
    } catch {
      onToast?.('Could not log this activity.');
    }
  };

  const markSold = async () => {
    if (!selectedLead || !markSoldMachineId) return;
    try {
      await apiClient.post(`/leads/${selectedLead.id}/mark-sold?machineId=${markSoldMachineId}`);
      onToast?.('Lead marked Won — machine marked Sold.');
      setMarkSoldMachineId('');
      load();
      openLead(selectedLead.id);
    } catch {
      onToast?.('Could not mark this as sold — check the machine ID.');
    }
  };

  const grouped = STAGES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s);
    return acc;
  }, {});

  return (
    <div className="leads-pipeline">
      <div className="leads-pipeline__toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="muted">{leads.length} lead(s)</span>
      </div>

      {loading ? (
        <p className="muted">Loading leads…</p>
      ) : leads.length === 0 ? (
        <p className="muted">
          No leads yet. Buyer enquiries from the website (machine enquiry form, homepage Contact Us) land here
          automatically — you can also log one manually with the button above once you add machines.
        </p>
      ) : (
        <div className="leads-pipeline__board">
          {STAGES.map((stage) => (
            <div className="leads-pipeline__column" key={stage}>
              <h4>
                {stage} <span className="leads-pipeline__count">{grouped[stage].length}</span>
              </h4>
              {grouped[stage].map((lead) => (
                <div className="leads-pipeline__card" key={lead.id} onClick={() => openLead(lead.id)}>
                  <b>{lead.name || 'Unnamed'}</b>
                  <div className="muted">{lead.phone || lead.email || '—'}</div>
                  <div className="muted">
                    {[lead.requiredMachineType, lead.requiredSubType].filter(Boolean).join(' · ') || lead.sourceDetails}
                  </div>
                  {lead.matchedMachineLabel && <div className="leads-pipeline__tag">→ {lead.matchedMachineLabel}</div>}
                </div>
              ))}
              {grouped[stage].length === 0 && <p className="muted leads-pipeline__empty-col">—</p>}
            </div>
          ))}
        </div>
      )}

      {selectedLead && (
        <div className="leads-pipeline__detail-overlay" onClick={() => setSelectedLead(null)}>
          <div className="leads-pipeline__detail" onClick={(e) => e.stopPropagation()}>
            <button className="leads-pipeline__close" onClick={() => setSelectedLead(null)}>✕</button>
            <h3>{selectedLead.name || 'Unnamed lead'}</h3>
            <p className="muted">
              Source: {selectedLead.source}
              {selectedLead.sourceDetails && ` — ${selectedLead.sourceDetails}`}
            </p>
            <p>
              📞 {selectedLead.phone || '—'}
              {selectedLead.email && ` · 📧 ${selectedLead.email}`}
            </p>
            <p>
              Looking for:{' '}
              {[selectedLead.requiredMachineType, selectedLead.requiredSubType, selectedLead.requiredBrand, selectedLead.requiredModel]
                .filter(Boolean)
                .join(' / ') || '—'}
            </p>
            {selectedLead.additionalRequirements && (
              <p className="muted">"{selectedLead.additionalRequirements}"</p>
            )}

            <div className="leads-pipeline__stage-row">
              <label>Stage:</label>
              <select value={selectedLead.status} onChange={(e) => updateStatus(selectedLead, e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="leads-pipeline__stats">
              <span>📞 {selectedLead.phoneCallCount} calls logged</span>
              <span>🔔 {selectedLead.followUpCount} follow-ups</span>
            </div>

            <h4>Log an activity</h4>
            <form onSubmit={submitActivity} className="leads-pipeline__activity-form">
              <select
                value={activityForm.activityType}
                onChange={(e) => setActivityForm((f) => ({ ...f, activityType: e.target.value }))}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                placeholder="Channel (WhatsApp Broadcast, Facebook Group...)"
                value={activityForm.channel}
                onChange={(e) => setActivityForm((f) => ({ ...f, channel: e.target.value }))}
              />
              <input
                placeholder="Notes"
                value={activityForm.description}
                onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
              />
              <button type="submit" className="btn primary">Log</button>
            </form>

            <h4>Activity history</h4>
            <ul className="leads-pipeline__activity-list">
              {selectedLead.activities?.length ? (
                selectedLead.activities.map((a) => (
                  <li key={a.id}>
                    <b>{a.activityType}</b>
                    {a.channel && ` · ${a.channel}`} — {new Date(a.activityDate).toLocaleString()}
                    {a.description && <div className="muted">{a.description}</div>}
                  </li>
                ))
              ) : (
                <li className="muted">No activity logged yet.</li>
              )}
            </ul>

            {selectedLead.status !== 'Won' && selectedLead.status !== 'Lost' && (
              <>
                <h4>Mark as sold</h4>
                <div className="leads-pipeline__mark-sold">
                  <input
                    placeholder="Machine ID (see Machine Inventory)"
                    value={markSoldMachineId}
                    onChange={(e) => setMarkSoldMachineId(e.target.value)}
                  />
                  <button className="btn primary" onClick={markSold} disabled={!markSoldMachineId}>
                    Mark Won + Sold
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
