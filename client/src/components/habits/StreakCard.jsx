import React from 'react';

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export default function StreakCard({ currentStreak = 0, longestStreak = 0, totalCompleted = 0 }) {
  const nextMilestone = MILESTONES.find(m => m > currentStreak) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) ?? 0;
  const progress      = nextMilestone > prevMilestone
    ? Math.round(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  const level = currentStreak >= 100 ? 'Legend' : currentStreak >= 30 ? 'Master' : currentStreak >= 14 ? 'Dedicated' : currentStreak >= 7 ? 'Consistent' : currentStreak >= 3 ? 'Starter' : 'Beginner';
  const levelColor = currentStreak >= 100 ? 'text-[#f5a623]' : currentStreak >= 30 ? 'text-accent-2' : currentStreak >= 7 ? 'text-[#3dd68c]' : 'text-white/60';

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="stat-label">Current Streak</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-heading text-4xl font-bold text-[#f5a623]">🔥{currentStreak}</span>
            <span className="text-white/40 text-sm">days</span>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg bg-bg-3 border border-white/[0.07] text-xs font-semibold ${levelColor}`}>
          {level}
        </div>
      </div>

      {/* Progress to next milestone */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <span>{currentStreak} days</span>
          <span>Next: {nextMilestone} days</span>
        </div>
        <div className="progress-bar h-2">
          <div
            className="progress-fill bg-gradient-to-r from-[#f5a623] to-[#ff6b35]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-white/30 mt-1.5">
          {nextMilestone - currentStreak} more day{nextMilestone - currentStreak !== 1 ? 's' : ''} to reach {nextMilestone}-day milestone
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.07]">
        <div>
          <div className="text-xs text-white/30 mb-0.5">Best ever</div>
          <div className="font-heading text-lg font-bold text-white/70">🏆 {longestStreak}</div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-0.5">Total done</div>
          <div className="font-heading text-lg font-bold text-[#3dd68c]">{totalCompleted}</div>
        </div>
      </div>
    </div>
  );
}
