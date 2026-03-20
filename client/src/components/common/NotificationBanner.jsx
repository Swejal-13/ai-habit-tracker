import React, { useState, useEffect } from 'react';

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'friend',      icon: '🔥', msg: 'Alex Chen just completed 7 habits today!', time: '2m ago' },
  { id: 2, type: 'achievement', icon: '🏅', msg: 'You earned the "Consistent" badge — 7-day streak!', time: '1h ago' },
  { id: 3, type: 'reminder',    icon: '⏰', msg: 'Evening Walk reminder — you haven\'t completed it yet.', time: '3h ago' },
  { id: 4, type: 'milestone',   icon: '⭐', msg: 'You\'re 2 days away from a 14-day streak milestone!', time: '5h ago' },
];

const TYPE_COLORS = {
  friend:      'border-[#4a9eff] bg-[#4a9eff]/5',
  achievement: 'border-[#f5a623] bg-[#f5a623]/5',
  reminder:    'border-accent bg-accent/5',
  milestone:   'border-[#3dd68c] bg-[#3dd68c]/5',
};

export default function NotificationBanner() {
  const [notes, setNotes]       = useState(DEMO_NOTIFICATIONS);
  const [visible, setVisible]   = useState(true);
  const [current, setCurrent]   = useState(0);

  // Auto-cycle
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % notes.length), 5000);
    return () => clearInterval(t);
  }, [notes.length]);

  if (!visible || notes.length === 0) return null;

  const n = notes[current];

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${TYPE_COLORS[n.type] || 'border-white/[0.07]'} mb-5 animate-fade-in`}>
      <span className="text-xl flex-shrink-0">{n.icon}</span>
      <div className="flex-1 text-sm">{n.msg}</div>
      <span className="text-xs text-white/30 flex-shrink-0">{n.time}</span>
      <div className="flex gap-1 ml-1">
        {notes.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${i === current ? 'bg-white/60' : 'bg-white/15'}`}
          />
        ))}
      </div>
      <button onClick={() => setVisible(false)} className="text-white/20 hover:text-white/50 text-base ml-1 transition-colors">×</button>
    </div>
  );
}
