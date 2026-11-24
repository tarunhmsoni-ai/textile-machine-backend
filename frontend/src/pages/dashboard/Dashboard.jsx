import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import GearLogo from '../../components/GearLogo';
import apiClient from '../../services/apiClient';
import { DashboardHome } from './DashboardPages';
import MachineInventory from './DashboardMachines';
import Subscribers from './DashboardSubscribers';
import { LeadsPipeline } from './DashboardLeads';
import { KpiDashboard } from './DashboardKpi';
import { ReferralPartners } from './DashboardReferralPartners';
import { StaffAccess } from './DashboardStaffAccess';

const NAV_ITEMS = [
  { id: 'dashboard', label: '🏠 Dashboard', subtitle: 'A quick look at your machines and leads.' },
  { id: 'machines', label: '🏭 Machine Inventory', subtitle: 'Edit machines, change their status and take them off the website.' },
  { id: 'leads', label: '🧭 Leads & Pipeline', subtitle: 'Buyer enquiries from the website, phone and WhatsApp.' },
  { id: 'kpi', label: '📊 KPI Dashboard', subtitle: 'Performance for any period. Visible to admin only.', adminOnly: true },
  { id: 'referrals', label: '🤝 Referral Partners', subtitle: 'People who bring leads and get paid when a deal matures.' },
  { id: 'subscribers', label: '✉️ Subscribers', subtitle: 'Visitors who asked for special offers.', adminOnly: true },
  { id: 'staff-access', label: '🔒 Staff Access', subtitle: 'Staff accounts and the office computers they can log in from.', adminOnly: true },
];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'Admin';
  const [activePage, setActivePage] = useState(() => (isAdmin ? 'kpi' : 'dashboard'));
  const [toast, setToast] = useState('');
  const [newLeads, setNewLeads] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const refreshNewLeads = useCallback(() => {
    apiClient
      .get('/leads', { params: { status: 'New' } })
      .then((res) => setNewLeads((res.data || []).length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshNewLeads();
  }, [activePage, refreshNewLeads]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    onLogout?.();
    navigate('/login');
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const current = NAV_ITEMS.find((n) => n.id === activePage);
  const currentTitle = current?.label.replace(/^\S+\s/, '');

  return (
    <div className="dash">
      <div className="app">
        <aside className="side">
          <div className="brand">
            <div className="logo"><GearLogo size={26} /></div>
            <div>
              <b>Textile Machine</b>
              <small>Admin panel</small>
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
              <div className="muted">{current?.subtitle}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn notif" onClick={() => setActivePage('leads')}>
                🔔 New leads
                {newLeads > 0 && <span className="bubble">{newLeads}</span>}
              </button>
              <button className="btn primary" onClick={() => navigate('/admin/post-machine')}>📤 Post Machine</button>
            </div>
          </div>

          {activePage === 'dashboard' && (
            <DashboardHome
              refreshKey={refreshKey}
              onNavigate={setActivePage}
              onPostMachine={() => navigate('/admin/post-machine')}
            />
          )}
          {activePage === 'machines' && (
            <MachineInventory onToast={showToast} onChanged={() => setRefreshKey((k) => k + 1)} />
          )}
          {activePage === 'leads' && <LeadsPipeline onToast={showToast} />}
          {activePage === 'kpi' && isAdmin && <KpiDashboard onToast={showToast} />}
          {activePage === 'referrals' && <ReferralPartners onToast={showToast} />}
          {activePage === 'subscribers' && isAdmin && <Subscribers onToast={showToast} />}
          {activePage === 'staff-access' && isAdmin && <StaffAccess onToast={showToast} />}
        </main>
      </div>

      <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
    </div>
  );
}
