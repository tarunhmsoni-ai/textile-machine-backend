import React, { useState } from 'react';

export function DashboardHome({ pendingCount, machineTotal, openInquiries, dealsClosed, onOpenSellerForm }) {
  return (
    <>
      <div className="hero">
        <div>
          <h2>New Seller Submission Workflow</h2>
          <p>
            Owner shares a form link. Seller enters machine details and pastes Google Drive / YouTube
            media links. Owner reviews and approves the entry before it becomes searchable inventory.
          </p>
        </div>
        <button className="btn primary" onClick={onOpenSellerForm}>Preview Seller Form</button>
      </div>

      <div className="cards">
        <div className="card">
          <div className="label">Pending Approvals</div>
          <div className="num">{pendingCount}</div>
        </div>
        <div className="card">
          <div className="label">Total Machines</div>
          <div className="num">{machineTotal}</div>
        </div>
        <div className="card">
          <div className="label">Open Inquiries</div>
          <div className="num">{openInquiries}</div>
        </div>
        <div className="card">
          <div className="label">Deals Closed</div>
          <div className="num">{dealsClosed}</div>
        </div>
      </div>

      <div className="row2">
        <div className="card">
          <h3>Complete Flow</h3>
          <div className="flow">
            <span className="stage done">Share Link</span>
            <span className="stage done">Seller Fills Form</span>
            <span className="stage done">Paste Media Links</span>
            <span className="stage current">Owner Review</span>
            <span className="stage">Approve</span>
            <span className="stage">Inventory</span>
          </div>
          <div className="notice" style={{ marginTop: 14 }}>
            <b>No WhatsApp and no video storage inside the software.</b>
            <br />
            <span className="muted">Only external Google Drive / YouTube / OneDrive links are saved.</span>
          </div>
        </div>
        <div className="card">
          <h3>Seller Form Link</h3>
          <div className="linkbox">
            <div className="linktext">https://machtrack.demo/seller/add-machine/MT-9281</div>
            <button className="btn" onClick={() => navigator.clipboard?.writeText('https://machtrack.demo/seller/add-machine/MT-9281')}>
              Copy
            </button>
          </div>
          <button className="btn primary" style={{ marginTop: 10 }} onClick={onOpenSellerForm}>Open Form</button>
        </div>
      </div>

      <WhatsAppTemplate />
    </>
  );
}

export function Submissions({ submissions, onReview }) {
  return (
    <div className="card">
      <h3>Pending Seller Submissions</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Submission</th>
              <th>Seller</th>
              <th>Brand</th>
              <th>Type</th>
              <th>MC No.</th>
              <th>Year</th>
              <th>Location</th>
              <th>Media</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={10} className="muted">No pending submissions.</td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.seller}</td>
                  <td>{s.brand || '—'}</td>
                  <td>{s.type || '—'}</td>
                  <td>{s.mcNo || '—'}</td>
                  <td>{s.constructionYear || '—'}</td>
                  <td>{s.location}</td>
                  <td>{s.media}</td>
                  <td><span className="badge pending">Pending</span></td>
                  <td><button className="btn" onClick={() => onReview(s)}>Review</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Machines({ machines }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');

  const filtered = machines.filter((m) => {
    const text = `${m.id} ${m.brand} ${m.type} ${m.mcNo} ${m.constructionYear} ${m.seller} ${m.location} ${m.price} ${m.status} ${m.media}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesYear = !year || m.constructionYear === year;
    return matchesQuery && matchesYear;
  });

  const years = [...new Set(machines.map((m) => m.constructionYear))].sort().reverse();

  return (
    <div className="card">
      <div className="toolbar">
        <input
          className="grow"
          placeholder="Search brand, type, seller, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Brand</th>
              <th>Type</th>
              <th>MC No.</th>
              <th>Year</th>
              <th>Seller</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="muted">No machines match your search.</td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.brand || '—'}</td>
                  <td>{m.type || '—'}</td>
                  <td>{m.mcNo || '—'}</td>
                  <td>{m.constructionYear || '—'}</td>
                  <td>{m.seller}</td>
                  <td>{m.location}</td>
                  <td>{m.price}</td>
                  <td>
                    <span className={`badge ${m.status === 'Available' ? 'available' : 'reserved'}`}>
                      {m.status}
                    </span>
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

export function Inquiries({ onFindMatch, onTrack, onNewInquiry }) {
  return (
    <div className="card">
      <div className="toolbar">
        <button className="btn primary" onClick={onNewInquiry}>+ New Inquiry</button>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Buyer</th>
              <th>Requirement</th>
              <th>Year</th>
              <th>Budget</th>
              <th>Stage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>INQ2301</td>
              <td>Mahavir Tools</td>
              <td>VMC Haas / Similar</td>
              <td>2018+</td>
              <td>₹25L</td>
              <td><span className="badge info">Machine Found</span></td>
              <td><button className="btn green" onClick={onFindMatch}>Find Match</button></td>
            </tr>
            <tr>
              <td>INQ2302</td>
              <td>Prime Auto</td>
              <td>CNC Turning</td>
              <td>2020+</td>
              <td>₹20L</td>
              <td><span className="badge pending">Negotiation</span></td>
              <td><button className="btn" onClick={() => onTrack('Inquiry tracking opened')}>Track</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Matching({ onSelectMatch }) {
  const [showMatches, setShowMatches] = useState(false);

  return (
    <div className="card">
      <h3>Machine Matching</h3>
      <div className="toolbar">
        <select>
          <option>INQ2301 - Mahavir Tools - VMC</option>
          <option>INQ2302 - Prime Auto - CNC</option>
        </select>
        <input placeholder="Brand / Model" />
        <input placeholder="Year From" />
        <input placeholder="Max Budget" />
        <button className="btn primary" onClick={() => setShowMatches(true)}>Search Inventory</button>
      </div>
      {showMatches && (
        <div className="list">
          <div className="item">
            <div>
              <b>Haas VF-2 VMC • 2018</b>
              <div className="muted">Ahmedabad • ₹22L • Drive + YouTube links</div>
            </div>
            <button className="btn green" onClick={onSelectMatch}>Select & Track</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Clients({ onToast }) {
  return (
    <div className="row2">
      <div className="card">
        <h3>Sellers</h3>
        <div className="item">
          <div>
            <b>Shakti Engineering</b>
            <div className="muted">9 approved machines</div>
          </div>
          <button className="btn" onClick={() => onToast('Seller history opened')}>View History</button>
        </div>
      </div>
      <div className="card">
        <h3>Buyers</h3>
        <div className="item">
          <div>
            <b>Mahavir Tools</b>
            <div className="muted">5 inquiries • 2 active</div>
          </div>
          <button className="btn" onClick={() => onToast('Buyer history opened')}>View History</button>
        </div>
      </div>
    </div>
  );
}

export function Deals({ onOpenDealModal }) {
  return (
    <div className="card">
      <button className="btn primary" onClick={onOpenDealModal}>+ Create Deal</button>
      <div className="tablewrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Deal</th>
              <th>Machine</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Final Price</th>
              <th>Brokerage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>D501</td>
              <td>Bodor P3015</td>
              <td>Nova Fab</td>
              <td>RK Fabrication</td>
              <td>₹29.5L</td>
              <td>₹59,000</td>
              <td><span className="badge available">Closed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Followups({ onToast }) {
  const [completed, setCompleted] = useState(false);

  return (
    <>
      <div className="cards">
        <div className="card">
          <div className="label">Due Today</div>
          <div className="num">4</div>
        </div>
        <div className="card">
          <div className="label">Overdue</div>
          <div className="num">2</div>
        </div>
        <div className="card">
          <div className="label">Completed</div>
          <div className="num">11</div>
        </div>
        <div className="card">
          <div className="label">Upcoming</div>
          <div className="num">8</div>
        </div>
      </div>
      <div className="card">
        <div className="item">
          <div>
            <b>Prime Auto</b>
            <div className="muted">Negotiation follow-up</div>
          </div>
          <button
            className="btn green"
            disabled={completed}
            onClick={() => {
              setCompleted(true);
              onToast('Follow-up completed');
            }}
          >
            {completed ? 'Completed' : 'Complete'}
          </button>
        </div>
      </div>
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
      <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
        Copy this template and send it to sellers via WhatsApp. They can fill in their machine details and reply.
      </p>
      <div style={{
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
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
