import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const NAV = [
  { label: 'Dashboard',    to: '/',             icon: '⚡', section: 'main' },
  { label: 'Habits',       to: '/habits',        icon: '🔄', section: 'main' },
  { label: 'Tasks',        to: '/tasks',         icon: '✅', section: 'main' },
  { label: 'Analytics',    to: '/analytics',     icon: '📊', section: 'main' },
  { label: 'AI Coach',     to: '/ai-coach',      icon: '🤖', section: 'ai' },
  { label: 'Daily Planner',to: '/planner',       icon: '📅', section: 'ai' },
  { label: 'Focus Timer',  to: '/pomodoro',      icon: '⏱️', section: 'ai' },
  { label: 'Friends',      to: '/friends',       icon: '👥', section: 'social' },
  { label: 'Achievements', to: '/achievements',  icon: '🏆', section: 'social' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const searchRef = useRef(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.results);
      } catch { setResults([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const avatarUrl = user?.avatar ? user.avatar : null;
  const initials  = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[218px] min-w-[218px] bg-bg-2 border-r border-white/[0.07] flex flex-col py-5 px-3 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pb-5 font-heading text-[20px] font-extrabold text-accent-2 tracking-tight">
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--tw-shadow-color)] shadow-accent"></span>
          HabitFlow
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 mx-1 mb-4 px-3 py-2 rounded-lg bg-bg-3 text-white/30 text-lg border border-white/[0.07] hover:border-white/20 transition-all cursor-pointer"
        >
          <span>🔍</span>
          <span className="flex-1 text-left">Search…</span>
          <span className="bg-bg-4 px-1.5 py-0.5 rounded text-[10px]">⌘K</span>
        </button>

        {/* Nav sections */}
        {['main', 'ai', 'social'].map(section => (
          <div key={section}>
            <div className="text-[15px] font-semibold uppercase tracking-widest text-white/25 px-2 py-2 mt-1">
              {section === 'main' ? 'Main' : section === 'ai' ? 'AI Tools' : 'Social'}
            </div>
            {NAV.filter(n => n.section === section).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="text-xl w-5 text-center">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Bottom user row */}
        <div className="mt-auto pt-4 border-t border-white/[0.07]">
          <div
            className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-bg-4 transition-all"
            onClick={() => navigate('/profile')}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-bg-3" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center text-sm font-semibold text-white">{initials}</div>
            }
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium truncate">{user?.name}</div>
              <div className="text-[14px] text-white/30 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full mt-2 text-left px-2 py-1.5 text-xl text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-bg-4">
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 w-full p-6 bg-bg">
        <Outlet />
      </main>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="bg-bg-2 border border-white/10 rounded-2xl w-full max-w-lg p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              <span className="text-white/40">🔍</span>
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search habits, tasks, goals…"
                className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 p-0"
              />
              <kbd className="text-[10px] text-white/30 bg-bg-4 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {results.length === 0 && query && (
                <div className="py-8 text-center text-white/30 text-sm">No results for "{query}"</div>
              )}
              {results.length === 0 && !query && (
                <div className="py-8 text-center text-white/20 text-sm">Type to search habits, tasks and more</div>
              )}
              {results.map(r => (
                <div
                  key={r.id}
                  onClick={() => { navigate(r.type === 'habit' ? '/habits' : '/tasks'); setSearchOpen(false); setQuery(''); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-3 cursor-pointer transition-colors"
                >
                  <span className="text-xl w-7 text-center">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.title}</div>
                    <div className="text-xs text-white/40">{r.subtitle}</div>
                  </div>
                  <span className={`badge ${r.type === 'habit' ? 'badge-purple' : 'badge-blue'}`}>{r.type}</span>
                  <span className="text-xs text-white/30">{r.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
