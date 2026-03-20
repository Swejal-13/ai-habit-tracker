import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm]   = useState({ name: user?.name || '', timezone: user?.timezone || 'UTC', reminderTime: user?.reminderTime || '08:00', theme: user?.theme || 'dark' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const fileRef = useRef(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatar: data.user.avatar });
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
  };

  const removeAvatar = async () => {
    try {
      const { data } = await api.delete('/profile/avatar');
      updateUser({ avatar: null });
      toast.success('Avatar removed');
    } catch { toast.error('Failed'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Profile & Settings</h1>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Profile form */}
        <div>
          <div className="card mb-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.07]">
              <div className="relative">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-bg-3" />
                  : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-2xl font-bold text-white border-2 border-bg-3">{initials}</div>
                }
              </div>
              <div>
                <div className="font-semibold text-base">{user?.name}</div>
                <div className="text-xs text-white/30 mb-2">{user?.email}</div>
                <div className="flex gap-1.5">
                  <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>📷 Upload</button>
                  {user?.avatar && <button className="btn btn-danger btn-sm" onClick={removeAvatar}>✕ Remove</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Timezone</label>
                  <select value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}>
                    {['UTC','UTC+5:30 (IST)','UTC-5 (EST)','UTC-8 (PST)','UTC+1 (CET)','UTC+9 (JST)'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Daily Reminder</label>
                  <input type="time" value={form.reminderTime} onChange={e => setForm(p => ({ ...p, reminderTime: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <select value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="section-title mb-4">Change Password</div>
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">New Password</label>
                  <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Confirm</label>
                  <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-ghost">Update Password</button>
            </form>
          </div>
        </div>

        {/* Stats + Export */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card"><div className="stat-label">Habits Created</div><div className="stat-value">—</div></div>
            <div className="stat-card"><div className="stat-label">Total Completed</div><div className="stat-value text-[#3dd68c]">{user?.totalCompleted ?? 0}</div></div>
            <div className="stat-card"><div className="stat-label">Best Streak</div><div className="stat-value text-[#f5a623]">🔥{user?.longestStreak ?? 0}</div></div>
            <div className="stat-card"><div className="stat-label">Score</div><div className="stat-value gradient-text">{user?.productivityScore ?? 0}%</div></div>
          </div>

          <div className="card">
            <div className="section-title mb-3">Achievements</div>
            <div className="text-sm text-white/50 mb-3">{user?.achievements?.length ?? 0} badges earned</div>
            <div className="flex flex-wrap gap-2">
              {(user?.achievements ?? []).slice(0, 8).map(id => {
                const ICONS = { first_habit:'🌱', streak_3:'🔥', streak_7:'⚡', streak_14:'💪', streak_30:'🌟', streak_100:'👑', total_50:'🏅', total_100:'🚀' };
                return <span key={id} className="text-2xl" title={id}>{ICONS[id] || '🏆'}</span>;
              })}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-3">Export Data</div>
            <p className="text-xs text-white/40 mb-3">Download your full habit history and analytics</p>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => toast('CSV export — connect backend to enable')}>📄 Export CSV</button>
              <button className="btn btn-ghost btn-sm" onClick={() => toast('PDF export — connect backend to enable')}>📑 Export PDF</button>
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-3 text-danger">Danger Zone</div>
            <button className="btn btn-danger btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
