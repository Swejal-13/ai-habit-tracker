import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import api from '../utils/api';
import StatCard from '../components/common/StatCard';
import Heatmap from '../components/analytics/Heatmap';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const TC = 'rgba(155,155,170,0.7)';
const GC = 'rgba(255,255,255,0.05)';

export default function Analytics() {
  const [dash, setDash]     = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/habits'),
    ]).then(([d, h]) => {
      setDash(d.data.dashboard);
      setHabits(h.data.analytics);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-7 text-white/30 text-center py-16">Loading analytics…</div>;

  const monthlyData = {
    labels: (dash?.monthlyData ?? []).map(d => new Date(d.date).getDate()).filter((_, i) => i % 3 === 0),
    datasets: [{
      label: 'Completed',
      data: (dash?.monthlyData ?? []).filter((_, i) => i % 3 === 0).map(d => d.count),
      borderColor: '#7c6af7',
      backgroundColor: 'rgba(124,106,247,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#7c6af7',
      pointRadius: 3,
    }],
  };

  const pieData = {
    labels: habits.map(h => h.name),
    datasets: [{
      data: habits.map(h => h.completionRateLast30 || 1),
      backgroundColor: ['#3dd68c','#4a9eff','#7c6af7','#f5a623','#ff6b9d','#00d4ff','#ff5f5f'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const barData = {
    labels: (dash?.monthlyData ?? []).slice(-14).map(d => {
      const day = new Date(d.date);
      return `${day.getMonth()+1}/${day.getDate()}`;
    }),
    datasets: [{
      data: (dash?.monthlyData ?? []).slice(-14).map(d => d.count),
      backgroundColor: (dash?.monthlyData ?? []).slice(-14).map(d =>
        d.count >= 5 ? 'rgba(61,214,140,0.75)' : d.count >= 3 ? 'rgba(124,106,247,0.65)' : 'rgba(245,166,35,0.6)'
      ),
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: TC, font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: TC, font: { size: 11 }, maxTicksLimit: 4 }, grid: { color: GC } },
    },
  };

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-white/40 text-sm mt-0.5">Deep dive into your productivity data</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Success Rate" value={`${dash?.completionRate ?? 0}%`} gradient />
        <StatCard label="Total Habits" value={habits.length} />
        <StatCard label="Best Streak" value={`🔥${dash?.longestStreak ?? 0}`} color="warning" />
        <StatCard label="Avg / Day" value={(habits.length > 0 ? (habits.reduce((s,h)=>s+h.totalCompletions,0)/30).toFixed(1) : '0')} color="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card">
          <div className="section-header mb-4"><span className="section-title">30-Day Trend</span></div>
          <div className="relative h-[200px]"><Line data={monthlyData} options={chartOpts} /></div>
        </div>
        <div className="card">
          <div className="section-header mb-4"><span className="section-title">Habit Breakdown</span></div>
          <div className="relative h-[200px]">
            <Doughnut data={pieData} options={{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'right', labels:{ color:TC, font:{size:11}, padding:10, boxWidth:10 } } } }} />
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="section-header mb-4"><span className="section-title">Daily Completions — Last 14 Days</span></div>
        <div className="relative h-[150px]"><Bar data={barData} options={chartOpts} /></div>
      </div>

      {/* Per-habit table */}
      <div className="card mb-5">
        <div className="section-header mb-4">
          <span className="section-title">Habit Performance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/[0.07]">
                <th className="text-left py-2 pb-3 font-medium">Habit</th>
                <th className="text-right py-2 pb-3 font-medium">Streak</th>
                <th className="text-right py-2 pb-3 font-medium">Best</th>
                <th className="text-right py-2 pb-3 font-medium">Total</th>
                <th className="text-right py-2 pb-3 font-medium">30-Day Rate</th>
                <th className="text-right py-2 pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(h => (
                <tr key={h.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3">
                    <span className="mr-2">{h.emoji}</span>{h.name}
                  </td>
                  <td className="text-right text-[#f5a623] py-3">🔥{h.currentStreak}</td>
                  <td className="text-right text-white/50 py-3">{h.longestStreak}</td>
                  <td className="text-right text-white/50 py-3">{h.totalCompletions}</td>
                  <td className="text-right py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 progress-bar">
                        <div className="progress-fill" style={{ width: `${h.completionRateLast30}%`, background: h.completionRateLast30 >= 70 ? '#3dd68c' : h.completionRateLast30 >= 40 ? '#7c6af7' : '#f5a623' }} />
                      </div>
                      <span className="text-xs text-white/60 w-8 text-right">{h.completionRateLast30}%</span>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    <span className={`badge ${h.trend === 'great' ? 'badge-green' : h.trend === 'ok' ? 'badge-purple' : 'badge-amber'}`}>
                      {h.trend === 'great' ? '🔥 Great' : h.trend === 'ok' ? '↗ Ok' : '⚠ Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="section-header mb-4">
          <span className="section-title">Activity Heatmap</span>
          <span className="badge badge-purple">365 days</span>
        </div>
        <Heatmap data={dash?.heatmapData} />
      </div>
    </div>
  );
}
