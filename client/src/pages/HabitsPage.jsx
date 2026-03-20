import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import HabitItem from '../components/habits/HabitItem';
import HabitModal from '../components/habits/HabitModal';
import toast from 'react-hot-toast';

const TABS = ['all', 'daily', 'weekly', 'monthly', 'yearly'];

export default function HabitsPage() {
  const { habits, loading, createHabit, updateHabit, deleteHabit, completeHabit } = useHabits();
  const [tab, setTab]         = useState('all');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch]   = useState('');

  const filtered = habits.filter(h => {
    const matchTab    = tab === 'all' || h.frequency === tab;
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleCreate = async (form) => {
    try {
      await createHabit(form);
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create habit');
    }
  };

  const handleUpdate = async (form) => {
    try {
      await updateHabit(editing._id, form);
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update habit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit? This cannot be undone.')) return;
    try { await deleteHabit(id); } catch { toast.error('Failed to delete'); }
  };

  // Stats
  const todayStr    = new Date().toISOString().split('T')[0];
  const doneToday   = habits.filter(h => h.completedToday).length;
  const maxStreak   = habits.reduce((m, h) => Math.max(m, h.currentStreak), 0);
  const successRate = habits.length
    ? Math.round((habits.reduce((s, h) => s + (h.completions?.length ?? 0), 0) / Math.max(habits.length * 30, 1)) * 100)
    : 0;

  return (
    <div className="p-7 max-w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">My Habits</h1>
          <p className="text-white/40 text-sm mt-0.5">Track, manage, and grow your daily habits</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          ＋ Add Habit
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Habits</div>
          <div className="stat-value">{habits.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Done Today</div>
          <div className="stat-value text-[#3dd68c]">{doneToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Streak</div>
          <div className="stat-value text-[#f5a623]">🔥{maxStreak}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value gradient-text">{Math.min(successRate, 99)}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-bg-3 rounded-xl p-1 border border-white/[0.07]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab px-4 ${tab === t ? 'active' : ''}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <input
          placeholder="Search habits…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56 py-2 text-sm"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-white/30 text-center py-12">Loading habits…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🌱</div>
          <div className="text-white/40 mb-4">{search ? 'No habits match your search' : 'No habits yet'}</div>
          {!search && (
            <button className="btn btn-primary" onClick={() => setModal(true)}>Create your first habit</button>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(h => (
            <HabitItem
              key={h._id}
              habit={h}
              onToggle={() => completeHabit(h._id)}
              onEdit={hab => { setEditing(hab); setModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <HabitModal
        open={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
      />
    </div>
  );
}
