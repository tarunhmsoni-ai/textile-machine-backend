import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

const EMPTY_USER_FORM = { fullName: '', username: '', password: '', role: 'Staff' };

export function StaffAccess({ onToast }) {
  const [myIp, setMyIp] = useState('');
  const [ips, setIps] = useState([]);
  const [ipLabel, setIpLabel] = useState('');
  const [ipValue, setIpValue] = useState('');
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/auth/my-ip'),
      apiClient.get('/staff-access/ips'),
      apiClient.get('/auth/users'),
    ])
      .then(([ipRes, whitelistRes, usersRes]) => {
        setMyIp(ipRes.data?.ip || '');
        setIps(whitelistRes.data || []);
        setUsers(usersRes.data || []);
      })
      .catch(() => onToast?.('Could not load staff access settings.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addIp = async (e) => {
    e.preventDefault();
    if (!ipValue.trim()) return;
    try {
      await apiClient.post('/staff-access/ips', { ipAddress: ipValue.trim(), label: ipLabel.trim() });
      onToast?.('Office IP whitelisted.');
      setIpValue('');
      setIpLabel('');
      load();
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Could not add this IP.');
    }
  };

  const removeIp = async (id) => {
    if (!window.confirm('Remove this IP from the whitelist? Staff will no longer be able to log in from it.')) return;
    try {
      await apiClient.delete(`/staff-access/ips/${id}`);
      onToast?.('IP removed.');
      load();
    } catch {
      onToast?.('Could not remove this IP.');
    }
  };

  const addMyIp = () => {
    setIpValue(myIp);
  };

  const submitUser = async (e) => {
    e.preventDefault();
    if (!userForm.fullName.trim() || !userForm.username.trim() || userForm.password.length < 6) {
      onToast?.('Full name, username and a 6+ character password are required.');
      return;
    }
    setSavingUser(true);
    try {
      await apiClient.post('/auth/register', userForm);
      onToast?.(`${userForm.role} account created for ${userForm.fullName}.`);
      setUserForm(EMPTY_USER_FORM);
      load();
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Could not create this account.');
    } finally {
      setSavingUser(false);
    }
  };

  const deactivateUser = async (u) => {
    if (!window.confirm(`Deactivate ${u.fullName}'s account?`)) return;
    try {
      await apiClient.delete(`/auth/users/${u.id}`);
      onToast?.('Account deactivated.');
      load();
    } catch {
      onToast?.('Could not deactivate this account.');
    }
  };

  if (loading) return <p className="muted">Loading staff access settings…</p>;

  return (
    <div className="staff-access">
      <section className="staff-access__section">
        <h3>Office IP Whitelist</h3>
        <p className="muted">
          Staff accounts can only log in — and stay logged in — from one of these IP addresses. Admin accounts are
          never restricted.
        </p>

        <div className="staff-access__my-ip">
          This connection's IP: <b>{myIp || '—'}</b>
          <button type="button" className="btn small" onClick={addMyIp}>Use this IP</button>
        </div>

        <form className="staff-access__ip-form" onSubmit={addIp}>
          <input placeholder="IP address" value={ipValue} onChange={(e) => setIpValue(e.target.value)} required />
          <input placeholder="Label (e.g. Office - Ahmedabad)" value={ipLabel} onChange={(e) => setIpLabel(e.target.value)} />
          <button type="submit" className="btn primary">Whitelist</button>
        </form>

        {ips.length === 0 ? (
          <p className="muted">No office IPs whitelisted yet — staff logins will be blocked until one is added.</p>
        ) : (
          <ul className="staff-access__ip-list">
            {ips.map((ip) => (
              <li key={ip.id}>
                <span><b>{ip.ipAddress}</b>{ip.label && ` — ${ip.label}`}</span>
                <button className="btn small danger" onClick={() => removeIp(ip.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="staff-access__section">
        <h3>Add Staff / Admin Account</h3>
        <form className="staff-access__user-form" onSubmit={submitUser}>
          <input
            placeholder="Full name"
            value={userForm.fullName}
            onChange={(e) => setUserForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />
          <input
            placeholder="Username"
            value={userForm.username}
            onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={userForm.password}
            onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="Staff">Staff (office IP only)</option>
            <option value="Admin">Admin (unrestricted)</option>
          </select>
          <button type="submit" className="btn primary" disabled={savingUser}>
            {savingUser ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      </section>

      <section className="staff-access__section">
        <h3>Accounts</h3>
        <div className="staff-access__user-list">
          {users.map((u) => (
            <div key={u.id} className={`staff-access__user-card ${!u.isActive ? 'staff-access__user-card--inactive' : ''}`}>
              <div>
                <b>{u.fullName}</b> <span className="muted">@{u.username}</span>
                <span className="staff-access__role-tag">{u.role}</span>
                {!u.isActive && <span className="staff-access__role-tag">Deactivated</span>}
              </div>
              {u.isActive && (
                <button className="btn small danger" onClick={() => deactivateUser(u)}>Deactivate</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
