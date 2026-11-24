import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

export function DashboardHome({ refreshKey, onNavigate, onPostMachine }) {
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    Promise.all([apiClient.get('/machines/admin/all'), apiClient.get('/leads')])
      .then(([machinesRes, leadsRes]) => {
        if (cancelled) return;
        const machines = machinesRes.data || [];
        const leads = leadsRes.data || [];
        setStats({
          machines: machines.length,
          live: machines.filter((m) => m.status === 'Live').length,
          sold: machines.filter((m) => m.status === 'Sold').length,
          newLeads: leads.filter((l) => l.status === 'New').length,
          openLeads: leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length,
          won: leads.filter((l) => l.status === 'Won').length,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const num = (v) => (stats ? v : '…');

  return (
    <>
      <div className="hero">
        <div>
          <h2>Welcome back</h2>
          <p>Post new machines, follow up on buyer enquiries and keep the pipeline moving.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={onPostMachine}>📤 Post Machine</button>
          <button className="btn" onClick={() => onNavigate('leads')}>🧭 Open Leads</button>
        </div>
      </div>

      {failed && <div className="notice">Couldn't load the latest numbers. Please refresh the page.</div>}

      <div className="cards">
        <div className="card">
          <div className="label">Machines in Inventory</div>
          <div className="num">{num(stats?.machines)}</div>
        </div>
        <div className="card">
          <div className="label">Live on Website</div>
          <div className="num">{num(stats?.live)}</div>
        </div>
        <div className="card">
          <div className="label">New Leads</div>
          <div className="num">{num(stats?.newLeads)}</div>
        </div>
        <div className="card">
          <div className="label">Open Leads</div>
          <div className="num">{num(stats?.openLeads)}</div>
        </div>
        <div className="card">
          <div className="label">Machines Sold</div>
          <div className="num">{num(stats?.sold)}</div>
        </div>
        <div className="card">
          <div className="label">Deals Won</div>
          <div className="num">{num(stats?.won)}</div>
        </div>
      </div>

      <WhatsAppTemplate />
    </>
  );
}

function WhatsAppTemplate() {
  const [copied, setCopied] = useState(false);

  const whatsappMessage = `📋 *Machine Submission Form* 🏭

Hello,

Please share the following details of your textile machine:

*Seller Information*
👤 Seller/Company Name: _[Your Name]_
📱 Mobile Number: _[Your Mobile]_

*Machine Nameplate Details*
🏢 Brand: _[e.g., Karl Mayer]_
⚙️ Machine Type: _[e.g., HKS 3-M]_
📏 Spacing/Teilung (mm): _[e.g., 0.9071]_
🎯 Gauge/Feinheit: _[e.g., E 28]_
📐 Working Width (mm): _[e.g., 5334]_
📐 Working Width (inches): _[e.g., 210"]_
🔢 MC No.: _[e.g., 91794]_
📅 Construction Year: _[e.g., 2003]_
🌍 Made In: _[e.g., Germany]_

*Location & Pricing*
📍 Location: _[City/Region]_
💰 Expected Price: _[Amount]_

*Condition & Details*
✨ Machine Condition: _[Running/Not Running/Reconditioned]_
📝 Additional Notes: _[Accessories, servicing history, etc.]_

*Media*
📸 Attach nameplate photo
🎬 Attach walkaround video (if available)

Please fill in the details above and reply.

Thank you!`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <h3>📱 WhatsApp Message Template</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Copy this template and send it to sellers via WhatsApp. They can fill in their machine details and reply.
      </p>
      <div style={{
        backgroundColor: 'var(--dark2)',
        border: '1px solid var(--line)',
        color: 'var(--text)',
        borderRadius: 6,
        padding: 12,
        fontFamily: 'monospace',
        fontSize: 11,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxHeight: 300,
        overflowY: 'auto',
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        {whatsappMessage}
      </div>
      <button
        className="btn primary"
        onClick={handleCopy}
        style={{ width: '100%' }}
      >
        {copied ? '✓ Copied to Clipboard' : '📋 Copy WhatsApp Template'}
      </button>
    </div>
  );
}
