import React from 'react';

const COLOR_MAP = {
  accent:  'text-accent-2',
  success: 'text-[#3dd68c]',
  warning: 'text-[#f5a623]',
  danger:  'text-[#ff5f5f]',
  info:    'text-[#4a9eff]',
};

export default function StatCard({ label, value, sub, color = 'accent', gradient = false, children }) {
  const colorClass = gradient
    ? 'gradient-text'
    : (COLOR_MAP[color] || 'text-white');

  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${colorClass}`}>{value}</div>
      {sub && <div className="text-xs mt-1 text-white/40">{sub}</div>}
      {children}
    </div>
  );
}
