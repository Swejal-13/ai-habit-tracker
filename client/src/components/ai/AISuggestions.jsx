import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FALLBACK = [
  { name: 'Drink 8 Glasses of Water', emoji: '💧', reason: 'Hydration improves focus and energy by up to 14%.', category: 'Nutrition', frequency: 'daily' },
  { name: '10-min Morning Meditation', emoji: '🧘', reason: 'Reduces cortisol and primes your brain for deep work.', category: 'Mental Wellness', frequency: 'daily' },
  { name: 'Evening Journaling', emoji: '✍️', reason: 'Improves self-awareness and sleep quality.', category: 'Mental Wellness', frequency: 'daily' },
  { name: 'Cold Shower', emoji: '🚿', reason: 'Boosts alertness and resilience over time.', category: 'Health & Fitness', frequency: 'daily' },
];

export default function AISuggestions({ onAddHabit }) {
  const [suggestions, setSuggestions] = useState(FALLBACK);
  const [loading, setLoading]         = useState(false);
  const [added, setAdded]             = useState(new Set());

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/suggestions');
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch {
      // silently keep fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (s) => {
    try {
      await onAddHabit({
        name: s.name,
        emoji: s.emoji,
        category: s.category,
        frequency: s.frequency,
        description: s.reason,
      });
      setAdded(prev => new Set([...prev, s.name]));
    } catch {
      toast.error('Failed to add habit');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title">✦ AI Habit Suggestions</div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>
      <div className="space-y-2.5">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-bg-3 rounded-lg border border-white/[0.07] hover:border-white/[0.12] transition-colors"
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-white/40 mt-0.5 leading-relaxed">{s.reason}</div>
              <div className="flex gap-1.5 mt-1.5">
                <span className="badge badge-purple text-[10px]">{s.category}</span>
                <span className="badge badge-blue text-[10px]">{s.frequency}</span>
              </div>
            </div>
            {onAddHabit && (
              <button
                className={`btn btn-sm flex-shrink-0 mt-0.5 ${added.has(s.name) ? 'btn-ghost opacity-40 cursor-default' : 'btn-primary'}`}
                onClick={() => !added.has(s.name) && handleAdd(s)}
                disabled={added.has(s.name)}
              >
                {added.has(s.name) ? '✓ Added' : '＋ Add'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
