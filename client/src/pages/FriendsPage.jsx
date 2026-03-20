import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MOCK_ACTIVITY = [
  { emoji:'🔥', msg:'Alex Chen just hit a 21-day streak!' },
  { emoji:'✅', msg:'Maya Rodriguez completed 8 habits today' },
  { emoji:'🏅', msg:'Sam Kim earned the "Consistent" badge' },
  { emoji:'💬', msg:'Jordan Liu started "Morning Yoga" habit' },
];

export default function FriendsPage() {
  const { user }   = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [requests, setRequests]       = useState([]);
  const [email, setEmail]             = useState('');
  const [search, setSearch]           = useState('');
  const [searchRes, setSearchRes]     = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get('/friends/leaderboard').then(({ data }) => setLeaderboard(data.leaderboard)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchRes([]); return; }
    const t = setTimeout(() => {
      api.get(`/friends/search?q=${encodeURIComponent(search)}`).then(({ data }) => setSearchRes(data.users)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const sendRequest = async () => {
    if (!email.trim()) return;
    try {
      await api.post('/friends/request', { email });
      toast.success('Friend request sent!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const avatarColors = ['from-accent to-cyan-400','from-pink-500 to-accent','from-[#3dd68c] to-[#4a9eff]','from-[#f5a623] to-[#ff6b9d]'];

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">👥 Friends & Leaderboard</h1>
        <p className="text-white/40 text-sm mt-0.5">Stay accountable with friends and see who's crushing it</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Leaderboard */}
        <div>
          <div className="section-header mb-3">
            <span className="section-title">Productivity Leaderboard</span>
            <span className="badge badge-amber">This week</span>
          </div>

          {loading ? (
            <div className="text-white/30 text-sm text-center py-8">Loading…</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-white/30 text-sm text-center py-8">
              Add friends to see the leaderboard!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, i) => (
                <div
                  key={u._id || i}
                  className={`flex items-center gap-3 p-3 bg-card border rounded-xl transition-all ${
                    u.isYou || u._id === user?._id
                      ? 'border-accent/40 bg-accent/[0.05]'
                      : 'border-white/[0.07] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`text-base font-bold w-5 ${i === 0 ? 'text-[#f5a623]' : i === 1 ? 'text-white/50' : 'text-white/25'}`}>
                    {i + 1}
                  </div>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-semibold text-white flex-shrink-0`}>
                    {(u.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {u.name}
                      {(u.isYou || u._id === user?._id) && <span className="text-accent-2 text-xs ml-1">(you)</span>}
                    </div>
                    <div className="text-[11px] text-white/30">🔥 {u.longestStreak ?? 0} day streak</div>
                    <div className="h-1 bg-bg-4 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${u.productivityScore ?? 0}%` }} />
                    </div>
                  </div>
                  <div className={`font-heading text-xl font-bold ${i === 0 ? 'text-[#f5a623]' : 'text-accent-2'}`}>
                    {u.productivityScore ?? 0}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Activity feed */}
          <div>
            <div className="section-title mb-3">Friends Activity</div>
            <div className="card space-y-3">
              {MOCK_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                  <span className="text-base">{a.emoji}</span>
                  <span dangerouslySetInnerHTML={{ __html: a.msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>

          {/* Add by email */}
          <div>
            <div className="section-title mb-3">Add Friend</div>
            <div className="flex gap-2">
              <input
                placeholder="Friend's email address…"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendRequest()}
              />
              <button className="btn btn-primary flex-shrink-0" onClick={sendRequest}>Send</button>
            </div>
          </div>

          {/* Search */}
          <div>
            <div className="section-title mb-3">Search Users</div>
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2"
            />
            {searchRes.length > 0 && (
              <div className="space-y-2">
                {searchRes.map(u => (
                  <div key={u._id} className="flex items-center gap-2.5 p-2.5 bg-card border border-white/[0.07] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent-2">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-white/30">{u.email}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEmail(u.email); setSearch(''); setSearchRes([]); }}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
