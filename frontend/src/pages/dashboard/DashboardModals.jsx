import React, { useState } from 'react';

const emptySellerForm = {
  sellerName: '',
  mobile: '',
  brand: '',
  type: '',
  spacingMm: '',
  gaugeFeinheit: '',
  workingWidthMm: '',
  workingWidthInch: '',
  mcNo: '',
  constructionYear: '',
  madeIn: '',
  location: '',
  price: '',
  condition: 'Running Condition',
  spec: '',
  photosFile: null,
  videoFile: null,
};

function SellerFormContent({ form, setForm, onSubmit, onClose }) {
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateFile = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.files?.[0] || null }));

  const handleExtractFromImage = async () => {
    if (!form.photosFile) {
      setExtractionError('Please upload a nameplate photo first');
      return;
    }

    setExtracting(true);
    setExtractionError('');

    try {
      const formData = new FormData();
      formData.append('image', form.photosFile);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/machines/extract-from-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract nameplate data');
      }

      const data = await response.json();

      setForm((f) => ({
        ...f,
        brand: data.brand || f.brand,
        type: data.type || f.type,
        spacingMm: data.spacing || f.spacingMm,
        gaugeFeinheit: data.gauge || f.gaugeFeinheit,
        workingWidthMm: data.workingWidthMm || f.workingWidthMm,
        workingWidthInch: data.workingWidthInch || f.workingWidthInch,
        mcNo: data.mcNo || f.mcNo,
        constructionYear: data.constructionYear || f.constructionYear,
        madeIn: data.madeIn || f.madeIn,
      }));

      setExtractionError('');
    } catch (err) {
      setExtractionError(`Extraction failed: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(form);
    setForm(emptySellerForm);
  };

  return (
    <>
      <div className="form">
        <h3 style={{ marginTop: 0, marginBottom: 8, color: '#2a6b5c', fontSize: 14, fontWeight: 600 }}>Seller Information</h3>
        <input placeholder="Seller / Company Name" value={form.sellerName} onChange={update('sellerName')} />
        <input placeholder="Mobile Number" value={form.mobile} onChange={update('mobile')} />

        <h3 style={{ marginTop: 12, marginBottom: 8, color: '#2a6b5c', fontSize: 14, fontWeight: 600 }}>Machine Nameplate Details</h3>
        <input placeholder="Brand (e.g., Karl Mayer)" value={form.brand} onChange={update('brand')} />
        <input placeholder="Machine Type (e.g., HKS 3-M)" value={form.type} onChange={update('type')} />
        <input placeholder="Spacing / Teilung (mm, e.g., 0.9071)" value={form.spacingMm} onChange={update('spacingMm')} />
        <input placeholder="Gauge / Feinheit (e.g., E 28)" value={form.gaugeFeinheit} onChange={update('gaugeFeinheit')} />
        <input placeholder="Working Width (mm, e.g., 5334)" value={form.workingWidthMm} onChange={update('workingWidthMm')} />
        <input placeholder="Working Width (inches, e.g., 210)" value={form.workingWidthInch} onChange={update('workingWidthInch')} />
        <input placeholder="MC No. (e.g., 91794)" value={form.mcNo} onChange={update('mcNo')} />
        <input placeholder="Construction Year (e.g., 2003)" value={form.constructionYear} onChange={update('constructionYear')} />
        <input placeholder="Made In (country, e.g., Germany)" value={form.madeIn} onChange={update('madeIn')} />

        <h3 style={{ marginTop: 12, marginBottom: 8, color: '#2a6b5c', fontSize: 14, fontWeight: 600 }}>Location & Pricing</h3>
        <input placeholder="Machine Location" value={form.location} onChange={update('location')} />
        <input placeholder="Expected Price" value={form.price} onChange={update('price')} />

        <h3 style={{ marginTop: 12, marginBottom: 8, color: '#2a6b5c', fontSize: 14, fontWeight: 600 }}>Condition & Details</h3>
        <select value={form.condition} onChange={update('condition')}>
          <option>Running Condition</option>
          <option>Not Running</option>
          <option>Reconditioned</option>
        </select>
        <textarea
          className="full"
          rows="3"
          placeholder="Additional notes, accessories, and condition details"
          value={form.spec}
          onChange={update('spec')}
        />

        <h3 style={{ marginTop: 12, marginBottom: 8, color: '#2a6b5c', fontSize: 14, fontWeight: 600 }}>Media Upload</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Nameplate Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={updateFile('photosFile')}
              style={{ fontSize: 12, width: '100%' }}
            />
            {form.photosFile && <div style={{ fontSize: 11, color: '#2a6b5c', marginTop: 4 }}>✓ {form.photosFile.name}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#666' }}>Walkaround Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={updateFile('videoFile')}
              style={{ fontSize: 12, width: '100%' }}
            />
            {form.videoFile && <div style={{ fontSize: 11, color: '#2a6b5c', marginTop: 4 }}>✓ {form.videoFile.name}</div>}
          </div>
        </div>

        {form.photosFile && (
          <>
            <button
              className="btn"
              onClick={handleExtractFromImage}
              disabled={extracting}
              style={{ marginTop: 10, width: '100%', opacity: extracting ? 0.6 : 1 }}
            >
              {extracting ? '🔍 Extracting...' : '🔍 Auto-Extract from Nameplate Photo'}
            </button>
            {extractionError && (
              <div style={{ fontSize: 12, color: '#d32f2f', marginTop: 8, padding: 8, backgroundColor: '#ffebee', borderRadius: 4 }}>
                ⚠️ {extractionError}
              </div>
            )}
          </>
        )}
      </div>
      <div className="actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={handleSubmit}>Submit Machine</button>
      </div>
    </>
  );
}

export function SellerFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptySellerForm);

  return (
    <div className={`modal ${open ? 'on' : ''}`}>
      <div className="box">
        <div className="head">
          <div>
            <h2 style={{ margin: 0 }}>Seller Machine Submission Form</h2>
            <div className="muted">This is the public link the owner sends to the seller.</div>
          </div>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <SellerFormContent
          form={form}
          setForm={setForm}
          onSubmit={(data) => {
            onSubmit(data);
            setForm(emptySellerForm);
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export function SellerFormSidebar({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptySellerForm);

  return (
    <div className={`sidebar ${open ? 'on' : ''}`} style={{
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100vh',
      width: '480px',
      backgroundColor: '#fff',
      boxShadow: '-2px 0 12px rgba(0,0,0,0.1)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      overflow: 'hidden',
    }}>
      <div className="head" style={{ padding: '16px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Seller Machine Submission Form</h2>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>This is the public link the owner sends to the seller.</div>
          </div>
          <button className="close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
        <SellerFormContent
          form={form}
          setForm={setForm}
          onSubmit={(data) => {
            onSubmit(data);
            setForm(emptySellerForm);
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export function SellerFormPage({ onClose, onSubmit }) {
  const [form, setForm] = useState(emptySellerForm);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#f5f7fa',
      zIndex: 998,
      overflowY: 'auto',
      paddingBottom: 60,
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, color: '#1a1a1a' }}>Seller Machine Submission Form</h1>
            <div className="muted">This is the public link the owner sends to the seller.</div>
          </div>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <SellerFormContent
            form={form}
            setForm={setForm}
            onSubmit={(data) => {
              onSubmit(data);
              setForm(emptySellerForm);
            }}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export function ReviewModal({ open, submission, onClose, onApprove, onReject }) {
  if (!submission) return null;

  return (
    <div className={`modal ${open ? 'on' : ''}`}>
      <div className="box">
        <div className="head">
          <div>
            <h2 style={{ margin: 0 }}>Review Seller Submission</h2>
            <div className="muted">{submission.id}</div>
          </div>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="detail">
          <div><b>Seller</b><br /><span className="muted">{submission.seller || '—'}</span></div>
          <div><b>Brand</b><br /><span className="muted">{submission.brand || '—'}</span></div>
          <div><b>Type</b><br /><span className="muted">{submission.type || '—'}</span></div>
          <div><b>MC No.</b><br /><span className="muted">{submission.mcNo || '—'}</span></div>
          <div><b>Construction Year</b><br /><span className="muted">{submission.constructionYear || '—'}</span></div>
          <div><b>Location</b><br /><span className="muted">{submission.location || '—'}</span></div>
          <div><b>Working Width</b><br /><span className="muted">{submission.workingWidthMm ? `${submission.workingWidthMm}mm / ${submission.workingWidthInch}"` : '—'}</span></div>
          <div><b>Gauge</b><br /><span className="muted">{submission.gaugeFeinheit || '—'}</span></div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Nameplate & Media</h3>
          {submission.photosFile ? (
            <div style={{ marginBottom: 12 }}>
              <b>Nameplate Photo</b>
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fafbfc', borderRadius: 4, fontSize: 12 }}>
                📸 {typeof submission.photosFile === 'string' ? submission.photosFile : submission.photosFile.name}
              </div>
            </div>
          ) : null}
          {submission.videoFile ? (
            <div style={{ marginBottom: 12 }}>
              <b>Walkaround Video</b>
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fafbfc', borderRadius: 4, fontSize: 12 }}>
                🎬 {typeof submission.videoFile === 'string' ? submission.videoFile : submission.videoFile.name}
              </div>
            </div>
          ) : null}
          {submission.spec && (
            <div>
              <b>Additional Notes</b>
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fafbfc', borderRadius: 4, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {submission.spec}
              </div>
            </div>
          )}
        </div>
        <div className="actions">
          <button className="btn red" onClick={onReject}>Reject</button>
          <button className="btn green" onClick={onApprove}>Approve & Add to Inventory</button>
        </div>
      </div>
    </div>
  );
}

export function InquiryModal({ open, onClose, onCreate }) {
  return (
    <div className={`modal ${open ? 'on' : ''}`}>
      <div className="box">
        <div className="head">
          <h2>New Inquiry</h2>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="form">
          <input placeholder="Buyer / Company Name" />
          <input placeholder="Mobile" />
          <input placeholder="Machine Required" />
          <input placeholder="Preferred Brand / Model" />
          <input placeholder="Year From" />
          <input placeholder="Budget" />
          <textarea className="full" rows="3" placeholder="Requirement / remarks" />
        </div>
        <div className="actions">
          <button className="btn primary" onClick={onCreate}>Create Inquiry</button>
        </div>
      </div>
    </div>
  );
}

export function DealModal({ open, onClose, onSave }) {
  return (
    <div className={`modal ${open ? 'on' : ''}`}>
      <div className="box">
        <div className="head">
          <h2>Create Deal</h2>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="form">
          <input placeholder="Machine" />
          <input placeholder="Buyer" />
          <input placeholder="Seller" />
          <input placeholder="Final Price" />
          <input placeholder="Brokerage / Commission" />
          <select>
            <option>Negotiation</option>
            <option>Closed</option>
            <option>Lost</option>
          </select>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={onSave}>Save Deal</button>
        </div>
      </div>
    </div>
  );
}
