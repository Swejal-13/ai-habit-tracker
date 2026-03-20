import React from 'react';

const INTENSITY = (count, max) => {
  if (!count || count === 0) return '';
  const ratio = count / max;
  if (ratio > 0.75) return 'bg-accent';
  if (ratio > 0.5)  return 'bg-accent/75';
  if (ratio > 0.25) return 'bg-accent/50';
  return 'bg-accent/25';
};

export default function Heatmap({ data }) {
  // Generate 105 days of data
  const days = Array.from({ length: 105 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (104 - i));
    const key = d.toISOString().split('T')[0];
    return { date: key, count: data?.[key] ?? Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0 };
  });

  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div>
      <div className="text-[11px] text-white/30 mb-2">
        {new Date(days[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        {' → '}
        {new Date(days[days.length-1].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </div>
      <div className="flex flex-wrap gap-[3px]">
        {days.map(d => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} completions`}
            className={`w-[13px] h-[13px] rounded-[3px] cursor-pointer transition-transform hover:scale-125 ${
              d.count > 0 ? INTENSITY(d.count, max) : 'bg-bg-4'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-white/30">
        <span>Less</span>
        {['bg-bg-4','bg-accent/25','bg-accent/50','bg-accent/75','bg-accent'].map(c => (
          <div key={c} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
