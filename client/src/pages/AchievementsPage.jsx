import React from 'react';
import { useAuth } from '../context/AuthContext';

const ALL_ACHIEVEMENTS = [
  { id:'first_habit',  icon:'🌱', name:'First Step',     desc:'Complete your first habit',    points:10 },
  { id:'streak_3',     icon:'🔥', name:'Streak Starter', desc:'Achieve a 3-day streak',       points:20 },
  { id:'streak_7',     icon:'⚡', name:'Consistent',     desc:'Achieve a 7-day streak',       points:50 },
  { id:'streak_14',    icon:'💪', name:'Two Weeks',      desc:'Achieve a 14-day streak',      points:100 },
  { id:'streak_30',    icon:'🌟', name:'Master',         desc:'Achieve a 30-day streak',      points:200 },
  { id:'streak_100',   icon:'👑', name:'Legend',         desc:'Achieve a 100-day streak',     points:500 },
  { id:'total_50',     icon:'🏅', name:'Habit Hero',     desc:'Complete 50 total habits',     points:75  },
  { id:'total_100',    icon:'🚀', name:'Centurion',      desc:'Complete 100 total habits',    points:150 },
  { id:'total_365',    icon:'🎖️', name:'Year Strong',    desc:'Complete 365 total habits',    points:365 },
  { id:'variety',      icon:'🎨', name:'Explorer',       desc:'Create habits in 4 categories',points:60  },
  { id:'early_bird',   icon:'🌅', name:'Early Bird',     desc:'Complete a habit before 7 am', points:30  },
  { id:'night_owl',    icon:'🦉', name:'Night Owl',      desc:'Complete a habit after 10 pm', points:30  },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const earned   = user?.achievements ?? [];
  const total    = ALL_ACHIEVEMENTS.reduce((s, a) => s + (earned.includes(a.id) ? a.points : 0), 0);
  const possible = ALL_ACHIEVEMENTS.reduce((s, a) => s + a.points, 0);

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">🏆 Achievements</h1>
        <p className="text-white/40 text-sm mt-0.5">Unlock badges by building consistent habits</p>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="section-title">Overall Progress</div>
            <div className="text-sm text-white/40 mt-0.5">{earned.length} / {ALL_ACHIEVEMENTS.length} badges unlocked</div>
          </div>
          <div className="text-right">
            <div className="font-heading text-2xl font-bold gradient-text">{total}</div>
            <div className="text-xs text-white/30">/ {possible} points</div>
          </div>
        </div>
        <div className="progress-bar h-2.5">
          <div
            className="progress-fill bg-gradient-to-r from-accent to-cyan-400"
            style={{ width: `${possible ? (total / possible) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-4 gap-4">
        {ALL_ACHIEVEMENTS.map(a => {
          const unlocked = earned.includes(a.id);
          return (
            <div
              key={a.id}
              className={`card flex flex-col items-center text-center transition-all ${
                unlocked ? 'border-accent/30 bg-accent/[0.03]' : 'opacity-40 grayscale'
              }`}
            >
              <div className="text-4xl mb-2.5">{a.icon}</div>
              <div className="text-sm font-semibold mb-0.5">{a.name}</div>
              <div className="text-[11px] text-white/40 mb-2">{a.desc}</div>
              <div className={`badge text-[10px] mt-auto ${unlocked ? 'badge-green' : 'badge-amber'}`}>
                {unlocked ? '✓ Unlocked' : `${a.points} pts`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
