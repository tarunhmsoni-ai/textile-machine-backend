import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

// Mirrors MachineProjectAPI.Models.ReferralPartnerTypes.
const PARTNER_TYPES = ['Tea Vendor', 'Building Contractor', 'Supervisor', 'Field Staff', 'Other'];

const EMPTY_FORM = {
  name: '', partnerType: 'Tea Vendor', phone: '', whatsApp: '', email: '', location: '',
  description: '', commissionType: 'Percentage', commissionPercentage: 5,
};

export function ReferralPartners({ onToast }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [payAmounts, setPayAmounts] = useState({});

  const load = () => {
    setLoading(true);
    apiClient
      .get('/referral-partners', { params: { includeInactive: showInactive } })
      .then((res) => setPartners(res.data || []))
      .catch(() => onToast?.('Could not load referral partners.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [showInactive]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      partnerType: p.partnerType,
      phone: p.phone,
      whatsApp: p.whatsApp,
      email: p.email,
      location: p.location,
      description: p.description,
      commissionType: p.commissionType,
      commissionPercentage: p.commissionPercentage,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/referral-partners/${editingId}`, form);
        onToast?.('Partner updated.');
      } else {
        await apiClient.post('/referral-partners', form);
        onToast?.('Partner added.');
      }
      cancelEdit();
      load();
    } catch {
      onToast?.('Could not save this partner.');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (p) => {
    if (!window.confirm(`Deactivate ${p.name}? Their lead/commission history is kept.`)) return;
    try {
      await apiClient.delete(`/referral-partners/${p.id}`);
      onToast?.('Partner deactivated.');
      load();
    } catch {
      onToast?.('Could not deactivate this partner.');
    }
  };

  const recordPayment = async (p) => {
    const amount = Number(payAmounts[p.id]);
    if (!amount || amount <= 0) {
      onToast?.('Enter a payment amount first.');
      return;
    }
    try {
      await apiClient.post(`/referral-partners/${p.id}/record-payment`, { amount });
      onToast?.(`₹${amount.toLocaleString('en-IN')} payment recorded for ${p.name}.`);
      setPayAmounts((prev) => ({ ...prev, [p.id]: '' }));
      load();
    } catch {
      onToast?.('Could not record this payment.');
    }
  };

  return (
    <div className="ref-partners">
      <form className="ref-partners__form" onSubmit={submitForm}>
        <h3>{editingId ? 'Edit Partner' : 'Add Referral Partner'}</h3>
        <div className="ref-partners__form-grid">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <select
            value={form.partnerType}
            onChange={(e) => setForm((f) => ({ ...f, partnerType: e.target.value }))}
          >
            {PARTNER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            placeholder="WhatsApp"
            value={form.whatsApp}
            onChange={(e) => setForm((f) => ({ ...f, whatsApp: e.target.value }))}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            value={form.commissionType}
            onChange={(e) => setForm((f) => ({ ...f, commissionType: e.target.value }))}
          >
            <option value="Percentage">Commission: % of sale</option>
            <option value="Fixed Amount">Commission: Fixed amount</option>
          </select>
          <input
            type="number"
            placeholder={form.commissionType === 'Fixed Amount' ? 'Amount (₹)' : 'Percentage (%)'}
            value={form.commissionPercentage}
            onChange={(e) => setForm((f) => ({ ...f, commissionPercentage: e.target.value }))}
            min="0"
          />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows="2"
        />
        <div className="ref-partners__form-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Partner'}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      <div className="ref-partners__toolbar">
        <h3>Partners</h3>
        <label className="ref-partners__toggle">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Show deactivated
        </label>
      </div>

      {loading ? (
        <p className="muted">Loading partners…</p>
      ) : partners.length === 0 ? (
        <p className="muted">No referral partners yet — add tea vendors, contractors, supervisors or field staff above.</p>
      ) : (
        <div className="ref-partners__list">
          {partners.map((p) => (
            <div className={`ref-partners__card ${!p.isActive ? 'ref-partners__card--inactive' : ''}`} key={p.id}>
              <div className="ref-partners__card-head">
                <div>
                  <b>{p.name}</b>
                  <span className="ref-partners__type">{p.partnerType}</span>
                  {!p.isActive && <span className="ref-partners__type">Deactivated</span>}
                </div>
                <div className="ref-partners__card-actions">
                  <button className="btn small" onClick={() => startEdit(p)}>Edit</button>
                  {p.isActive && (
                    <button className="btn small danger" onClick={() => deactivate(p)}>Deactivate</button>
                  )}
                </div>
              </div>

              <div className="muted">
                {[p.phone, p.whatsApp && `WhatsApp: ${p.whatsApp}`, p.email, p.location].filter(Boolean).join(' · ') || '—'}
              </div>
              {p.description && <p className="muted ref-partners__desc">{p.description}</p>}

              <div className="ref-partners__stats">
                <span>📋 {p.leadsProvided} leads</span>
                <span>🤝 {p.dealsMatured} deals matured</span>
                <span>
                  💰 Commission: {p.commissionType === 'Fixed Amount' ? `₹${p.commissionPercentage}` : `${p.commissionPercentage}%`}
                </span>
              </div>

              <div className="ref-partners__commission-row">
                <span>Earned: ₹{Number(p.totalCommissionEarned).toLocaleString('en-IN')}</span>
                <span>Paid: ₹{Number(p.totalCommissionPaid).toLocaleString('en-IN')}</span>
                <span className={p.commissionOwed > 0 ? 'ref-partners__owed' : ''}>
                  Owed: ₹{Number(p.commissionOwed).toLocaleString('en-IN')}
                </span>
              </div>

              {p.commissionOwed > 0 && (
                <div className="ref-partners__pay-row">
                  <input
                    type="number"
                    placeholder="Amount paid"
                    value={payAmounts[p.id] || ''}
                    onChange={(e) => setPayAmounts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    min="0"
                  />
                  <button className="btn small primary" onClick={() => recordPayment(p)}>Record Payment</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
