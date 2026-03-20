import React from 'react';

const CIRCUMF = 2 * Math.PI * 44; // r=44

const SCORE_LABEL = (s) => {
  if (s >= 90) return { label: 'Exceptional', color: '#3dd68c' };
  if (s >= 75) return { label: 'Strong',      color: '#7c6af7' };
  if (s >= 60) return { label: 'Good',         color: '#4a9eff' };
  if (s >= 40) return { label: 'Building',     color: '#f5a623' };
  return            { label: 'Starting',       color: '#ff5f5f' };
};

export default function ProductivityScore({ score = 0, breakdown = null }) {
  const offset = CIRCUMF * (1 - score / 100);
  const { label, color } = SCORE_LABEL(score);

  return (
    <div className="card">
      <div className="section-title mb-4">Productivity Score</div>
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            <circle
              cx="48" cy="48" r="44"
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeDasharray={CIRCUMF}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-heading text-xl font-bold" style={{ color }}>{score}</div>
            <div className="text-[10px] text-white/30">/ 100</div>
          </div>
        </div>

        {/* Label + breakdown */}
        <div className="flex-1">
          <div className="font-semibold text-base mb-1" style={{ color }}>{label}</div>
          {breakdown ? (
            <div className="space-y-1.5">
              {Object.entries(breakdown).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-xs text-white/40 mb-0.5">
                    <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                    <span>{v}%</span>
                  </div>
                  <div className="progress-bar h-1">
                    <div className="progress-fill" style={{ width: `${v}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/40 leading-relaxed">
              Based on habit completion, streak length, and task performance over the last 7 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
