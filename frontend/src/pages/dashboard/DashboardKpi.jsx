import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function rangeFor(period) {
  const now = new Date();
  if (period === 'this_week') {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  }
  if (period === 'this_quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { start, end };
  }
  if (period === 'this_year') {
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
  }
  // this_month (default)
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
}

const fmtDate = (d) => d.toISOString().slice(0, 10);

const STAT_LABELS = [
  ['machinesReceived', 'Machines Received for Sale'],
  ['queriesReceived', 'Queries Received'],
  ['machinesSold', 'Machines Sold'],
  ['machinesSoldByOtherBroker', 'Sold by Other Broker'],
  ['averageTurnaroundDays', 'Avg. Turnaround (days)'],
  ['phoneCallsDone', 'Phone Calls Done'],
  ['whatsAppBroadcastsDone', 'WhatsApp Broadcasts Done'],
  ['customersAdded', 'Customers Added'],
  ['machineDealersAdded', 'Machine Dealers Added'],
  ['mastersAdded', 'Masters Added'],
];

const CONTACT_TYPES = ['Customer', 'Dealer', 'Master'];

export function KpiDashboard({ onToast }) {
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState(fmtDate(rangeFor('this_month').start));
  const [customEnd, setCustomEnd] = useState(fmtDate(rangeFor('this_month').end));
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ contactType: 'Customer', name: '', phone: '', email: '', location: '' });
  const [savingContact, setSavingContact] = useState(false);

  const load = () => {
    let start, end;
    if (period === 'custom') {
      start = customStart;
      end = customEnd;
    } else {
      const r = rangeFor(period);
      start = fmtDate(r.start);
      end = fmtDate(r.end);
    }
    setLoading(true);
    apiClient
      .get('/kpi', { params: { start, end } })
      .then((res) => setKpi(res.data))
      .catch(() => onToast?.('Could not load KPIs — check the connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyCustomRange = (e) => {
    e.preventDefault();
    load();
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    setSavingContact(true);
    try {
      await apiClient.post('/contacts', contactForm);
      onToast?.(`${contactForm.contactType} added.`);
      setContactForm({ contactType: contactForm.contactType, name: '', phone: '', email: '', location: '' });
      load();
    } catch {
      onToast?.('Could not save this contact.');
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="kpi-dash">
      <div className="kpi-dash__toolbar">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_quarter">This Quarter</option>
          <option value="this_year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>

        {period === 'custom' && (
          <form className="kpi-dash__range-form" onSubmit={applyCustomRange}>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <span>to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            <button type="submit" className="btn primary small">Apply</button>
          </form>
        )}

        {kpi && (
          <span className="muted">
            {kpi.periodStart?.slice(0, 10)} → {kpi.periodEnd?.slice(0, 10)}
          </span>
        )}
      </div>

      {loading || !kpi ? (
        <p className="muted">Loading KPIs…</p>
      ) : (
        <>
          <div className="kpi-dash__grid">
            {STAT_LABELS.map(([key, label]) => (
              <div className="kpi-dash__card" key={key}>
                <div className="kpi-dash__value">
                  {key === 'averageTurnaroundDays'
                    ? (kpi.averageTurnaroundDays != null ? kpi.averageTurnaroundDays.toFixed(1) : '—')
                    : kpi[key]}
                </div>
                <div className="kpi-dash__label">{label}</div>
              </div>
            ))}
          </div>

          <h3 className="kpi-dash__section-title">Referral Partners</h3>
          <div className="kpi-dash__grid kpi-dash__grid--referral">
            <div className="kpi-dash__card">
              <div className="kpi-dash__value">{kpi.referralPartnersActive}</div>
              <div className="kpi-dash__label">Active Partners</div>
            </div>
            <div className="kpi-dash__card">
              <div className="kpi-dash__value">{kpi.referralLeadsProvided}</div>
              <div className="kpi-dash__label">Leads Provided</div>
            </div>
            <div className="kpi-dash__card">
              <div className="kpi-dash__value">{kpi.referralDealsMatured}</div>
              <div className="kpi-dash__label">Deals Matured</div>
            </div>
            <div className="kpi-dash__card">
              <div className="kpi-dash__value">₹{Number(kpi.referralCommissionEarned).toLocaleString('en-IN')}</div>
              <div className="kpi-dash__label">Commission Earned</div>
            </div>
          </div>
        </>
      )}

      <h3 className="kpi-dash__section-title">Add Customer / Dealer / Master</h3>
      <form className="kpi-dash__contact-form" onSubmit={submitContact}>
        <select
          value={contactForm.contactType}
          onChange={(e) => setContactForm((f) => ({ ...f, contactType: e.target.value }))}
        >
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          placeholder="Name"
          value={contactForm.name}
          onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          placeholder="Phone"
          value={contactForm.phone}
          onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <input
          placeholder="Email"
          value={contactForm.email}
          onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          placeholder="Location"
          value={contactForm.location}
          onChange={(e) => setContactForm((f) => ({ ...f, location: e.target.value }))}
        />
        <button type="submit" className="btn primary" disabled={savingContact}>
          {savingContact ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  );
}
