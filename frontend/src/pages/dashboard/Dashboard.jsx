import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import GearLogo from '../../components/GearLogo';
import apiClient, { resolveMediaUrl } from '../../services/apiClient';
import {
  DashboardHome,
  Submissions,
  Machines,
  Matching,
  Clients,
  Deals,
  Followups,
} from './DashboardPages';
import { LeadsPipeline } from './DashboardLeads';
import { KpiDashboard } from './DashboardKpi';
import { ReferralPartners } from './DashboardReferralPartners';
import { StaffAccess } from './DashboardStaffAccess';
import { SellerFormModal, SellerFormSidebar, SellerFormPage, ReviewModal, DealModal } from './DashboardModals';

const NAV_ITEMS = [
  { id: 'dashboard', label: '🏠 Dashboard' },
  { id: 'submissions', label: '📥 Seller Submissions' },
  { id: 'machines', label: '🏭 Machine Inventory' },
  { id: 'leads', label: '🧭 Leads & Pipeline' },
  { id: 'kpi', label: '📊 KPI Dashboard', adminOnly: true },
  { id: 'referrals', label: '🤝 Referral Partners' },
  { id: 'staff-access', label: '🔒 Staff Access', adminOnly: true },
  { id: 'matching', label: '🔎 Machine Matching' },
  { id: 'clients', label: '👥 Sellers & Buyers' },
  { id: 'deals', label: '🤝 Deals & Brokerage' },
  { id: 'followups', label: '🔔 Follow-ups' },
];

const INITIAL_SUBMISSIONS = [
  { id: 'SUB-501', seller: 'Rajesh Engineering', brand: 'Haas', type: 'VF-2', mcNo: '45821', constructionYear: '2019', location: 'Ahmedabad', media: 'Photos + Video', price: '₹23L', gaugeFeinheit: 'E 24', workingWidthMm: '4000', workingWidthInch: '157' },
  { id: 'SUB-502', seller: 'Galaxy Tools', brand: 'Jyoti', type: 'DX250', mcNo: '38451', constructionYear: '2021', location: 'Rajkot', media: 'Photos', price: '₹20L', gaugeFeinheit: 'E 20', workingWidthMm: '2500', workingWidthInch: '98' },
];

const INITIAL_MACHINES = [
  { id: 'M1001', brand: 'Haas', type: 'VF-2', mcNo: '45821', constructionYear: '2018', seller: 'Shakti Engineering', location: 'Ahmedabad', price: '₹22L', status: 'Available', media: 'Photos + Video' },
  { id: 'M1002', brand: 'Jyoti', type: 'DX200', mcNo: '38451', constructionYear: '2020', seller: 'Om Machines', location: 'Rajkot', price: '₹18.5L', status: 'Reserved', media: 'Photos' },
];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(() =>
    localStorage.getItem('userRole') === 'Admin' ? 'kpi' : 'dashboard'
  );
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [machineTotal, setMachineTotal] = useState(128);
  const [toast, setToast] = useState('');
  const [sellerFormOpen, setSellerFormOpen] = useState(false);
  const [sellerFormLayout, setSellerFormLayout] = useState('modal'); // 'modal', 'sidebar', or 'page'
  const [reviewSubmission, setReviewSubmission] = useState(null);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const toastTimer = useRef(null);

  const nextSubId = useRef(503);
  const nextMachineId = useRef(1003);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/machines/admin/all')
      .then((res) => {
        if (cancelled) return;
        const real = (res.data || []).map((m) => ({
          id: m.id,
          brand: m.brand,
          type: `${m.type} · ${m.subtype}`,
          mcNo: '—',
          constructionYear: String(m.year),
          seller: m.seller?.name || '—',
          location: m.location,
          price: m.price ? `₹${m.price}` : 'On request',
          status: m.status,
          media: m.videoUrl ? 'Photos + Video' : m.photos?.length ? 'Photos' : '—',
          photos: (m.photos || []).map(resolveMediaUrl),
        }));
        if (real.length > 0) {
          setMachines(real);
          setMachineTotal(real.length);
        }
      })
      .catch(() => {
        /* backend unreachable — keep the sample inventory rows */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteMachine = async (id) => {
    try {
      await apiClient.delete(`/machines/${id}`);
      setMachines((prev) => prev.filter((m) => m.id !== id));
      setMachineTotal((n) => Math.max(0, n - 1));
      showToast('Machine removed from inventory.');
    } catch {
      showToast('Could not remove this machine — please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    onLogout?.();
    navigate('/login');
  };

  const handleSubmitSeller = (form) => {
    const id = `SUB-${nextSubId.current++}`;
    const hasMedia = form.photosFile || form.videoFile;
    setSubmissions((prev) => [
      ...prev,
      {
        id,
        seller: form.sellerName || 'New Seller',
        brand: form.brand || '—',
        type: form.type || 'Unknown',
        mcNo: form.mcNo || '—',
        constructionYear: form.constructionYear || '—',
        location: form.location || '—',
        media: hasMedia ? 'Photos + Video' : '—',
        price: form.price || '—',
        gaugeFeinheit: form.gaugeFeinheit || '—',
        workingWidthMm: form.workingWidthMm || '—',
        workingWidthInch: form.workingWidthInch || '—',
        photosFile: form.photosFile,
        videoFile: form.videoFile,
        spec: form.spec,
        condition: form.condition,
        madeIn: form.madeIn,
        spacingMm: form.spacingMm,
      },
    ]);
    setSellerFormOpen(false);
    showToast('Submission sent. Owner notification created.');
  };

  const handleApprove = () => {
    if (!reviewSubmission) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== reviewSubmission.id));
    setMachines((prev) => [
      ...prev,
      {
        id: `M${nextMachineId.current++}`,
        brand: reviewSubmission.brand,
        type: reviewSubmission.type,
        mcNo: reviewSubmission.mcNo,
        constructionYear: reviewSubmission.constructionYear,
        seller: reviewSubmission.seller,
        location: reviewSubmission.location,
        price: reviewSubmission.price,
        status: 'Available',
        media: reviewSubmission.media,
        gaugeFeinheit: reviewSubmission.gaugeFeinheit,
        workingWidthMm: reviewSubmission.workingWidthMm,
        workingWidthInch: reviewSubmission.workingWidthInch,
      },
    ]);
    setMachineTotal((n) => n + 1);
    setReviewSubmission(null);
    showToast('Approved. Machine added to inventory.');
    setActivePage('machines');
  };

  const handleReject = () => {
    if (!reviewSubmission) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== reviewSubmission.id));
    setReviewSubmission(null);
    showToast('Submission rejected');
  };

  const isAdmin = localStorage.getItem('userRole') === 'Admin';
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const currentTitle = NAV_ITEMS.find((n) => n.id === activePage)?.label.replace(/^\S+\s/, '');

  return (
    <div className="dash">
      <div className="app">
        <aside className="side">
          <div className="brand">
            <div className="logo"><GearLogo size={26} /></div>
            <div>
              <b>MachTrack CRM</b>
              <small>by Simora Technologies</small>
            </div>
          </div>
          <div className="nav">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                className={activePage === item.id ? 'on' : ''}
                onClick={() => setActivePage(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} style={{ marginTop: 16 }}>🚪 Logout</button>
          </div>
        </aside>

        <main className="main">
          <div className="top">
            <div>
              <h1>{currentTitle}</h1>
              <div className="muted">Seller self-submission, owner approval, inventory and inquiry management.</div>
            </div>
            <div>
              <button className="btn notif" onClick={() => setActivePage('submissions')}>
                🔔 Notifications
                <span className="bubble">{submissions.length}</span>
              </button>{' '}
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={sellerFormLayout}
                  onChange={(e) => setSellerFormLayout(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  <option value="modal">Modal</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="page">Full Page</option>
                </select>
                <button className="btn primary" onClick={() => navigate('/admin/post-machine')}>📤 Post Machine</button>
                <button className="btn primary" onClick={() => setSellerFormOpen(true)}>🔗 Seller Form</button>
              </div>
            </div>
          </div>

          {activePage === 'dashboard' && (
            <DashboardHome
              pendingCount={submissions.length}
              machineTotal={machineTotal}
              openInquiries={34}
              dealsClosed={17}
              onOpenSellerForm={() => setSellerFormOpen(true)}
            />
          )}
          {activePage === 'submissions' && (
            <Submissions submissions={submissions} onReview={setReviewSubmission} />
          )}
          {activePage === 'machines' && <Machines machines={machines} onDelete={handleDeleteMachine} />}
          {activePage === 'leads' && <LeadsPipeline onToast={showToast} />}
          {activePage === 'kpi' && <KpiDashboard onToast={showToast} />}
          {activePage === 'referrals' && <ReferralPartners onToast={showToast} />}
          {activePage === 'staff-access' && isAdmin && <StaffAccess onToast={showToast} />}
          {activePage === 'matching' && (
            <Matching onSelectMatch={() => showToast('Machine linked and marked as shown')} />
          )}
          {activePage === 'clients' && <Clients onToast={showToast} />}
          {activePage === 'deals' && <Deals onOpenDealModal={() => setDealModalOpen(true)} />}
          {activePage === 'followups' && <Followups onToast={showToast} />}
        </main>
      </div>

      {sellerFormLayout === 'modal' && (
        <SellerFormModal
          open={sellerFormOpen}
          onClose={() => setSellerFormOpen(false)}
          onSubmit={handleSubmitSeller}
        />
      )}
      {sellerFormLayout === 'sidebar' && (
        <SellerFormSidebar
          open={sellerFormOpen}
          onClose={() => setSellerFormOpen(false)}
          onSubmit={handleSubmitSeller}
        />
      )}
      {sellerFormLayout === 'page' && sellerFormOpen && (
        <SellerFormPage
          onClose={() => setSellerFormOpen(false)}
          onSubmit={handleSubmitSeller}
        />
      )}
      <ReviewModal
        open={!!reviewSubmission}
        submission={reviewSubmission}
        onClose={() => setReviewSubmission(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <DealModal
        open={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
        onSave={() => {
          setDealModalOpen(false);
          showToast('Deal saved');
        }}
      />

      <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
    </div>
  );
}
