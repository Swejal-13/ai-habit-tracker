import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../hooks/useHabits';
import api from '../utils/api';

import HabitItem           from '../components/habits/HabitItem';
import StatCard            from '../components/common/StatCard';
import Heatmap             from '../components/analytics/Heatmap';
import StreakCard           from '../components/habits/StreakCard';
import ProductivityScore   from '../components/analytics/ProductivityScore';
import AISuggestions       from '../components/ai/AISuggestions';
import WeeklyReport        from '../components/ai/WeeklyReport';
import NotificationBanner  from '../components/common/NotificationBanner';
import HabitModal          from '../components/habits/HabitModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { habits, loading, completeHabit, createHabit } = useHabits();
  const [dashboard, setDashboard]   = useState(null);
  const [addModal, setAddModal]     = useState(false);
  const [activeTab, setActiveTab]   = useState('overview');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setDashboard(data.dashboard))
      .catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayHabits = habits.filter(h => h.frequency === 'daily').slice(0, 6);
  const doneCount   = todayHabits.filter(h => h.completedToday).length;
  const pct         = todayHabits.length ? Math.round((doneCount / todayHabits.length) * 100) : 0;
  const streak      = dashboard?.currentStreak ?? 0;
  const score       = dashboard?.productivityScore ?? user?.productivityScore ?? 0;

  const weekValues = (dashboard?.weeklyData ?? []).map(d => d.count);
  const maxVal     = Math.max(...weekValues, 1);
  const weekLabels = (dashboard?.weeklyData ?? []).map(d => ['S','M','T','W','T','F','S'][new Date(d.date + 'T12:00:00').getDay()]);

  const chartData = {
    labels: weekLabels.length ? weekLabels : ['M','T','W','T','F','S','S'],
    datasets: [{
      data: weekValues.length ? weekValues : [5,4,7,6,5,3,3],
      backgroundColor: (weekValues.length ? weekValues : [5,4,7,6,5,3,3]).map((v, i, a) =>
        i === a.length - 1 ? 'rgba(124,106,247,0.4)' : v === maxVal ? 'rgba(61,214,140,0.75)' : 'rgba(124,106,247,0.65)'
      ),
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: 'rgba(155,155,170,0.8)', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: 'rgba(155,155,170,0.8)', font: { size: 11 }, maxTicksLimit: 4 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const INSIGHTS = [
    `📈 You complete ${pct}% of habits on average — keep scheduling difficult tasks in the morning.`,
    `⚠️ ${todayHabits.length - doneCount} habit${todayHabits.length - doneCount !== 1 ? 's' : ''} still pending today — you still have time!`,
    `🏅 ${streak >= 7 ? `Incredible ${streak}-day streak!` : `${7 - streak} more day${7 - streak !== 1 ? 's' : ''} to hit a 7-day streak milestone.`}`,
    `💡 Adding a journaling habit could boost your score by ~8%. Try it!`,
  ];

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <NotificationBanner />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            {todayHabits.length > 0 && ` · ${todayHabits.length - doneCount} pending today`}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => navigate('/ai-coach')}>✦ AI Coach</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>＋ New Habit</button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-bg-3 border border-white/[0.07] rounded-xl p-1 mb-5 w-fit">
        {[['overview','⚡ Overview'],['ai','✦ AI Tools'],['report','📋 Weekly Report']].map(([v,l]) => (
          <button key={v} onClick={() => setActiveTab(v)} className={`tab px-5 ${activeTab === v ? 'active' : ''}`}>{l}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <StatCard label="Today's Progress" value={`${doneCount}/${todayHabits.length}`} sub={`${pct}% done`} color="accent">
              <div className="progress-bar mt-2"><div className="progress-fill bg-accent" style={{ width: `${pct}%` }} /></div>
            </StatCard>
            <StatCard label="Current Streak"     value={`🔥 ${streak}`}   sub={`Best: ${dashboard?.longestStreak ?? 0}`} color="warning" />
            <StatCard label="Productivity Score" value={`${score}%`}       sub="Last 7 days" gradient />
            <StatCard label="Total Completed"    value={user?.totalCompleted ?? 0} sub="All time" color="success" />
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="section-title">Today's Habits</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/habits')}>View all →</button>
              </div>
              {loading
                ? <div className="text-white/30 text-sm text-center py-8">Loading…</div>
                : todayHabits.length === 0
                  ? <div className="text-center py-10">
                      <div className="text-4xl mb-2">🌱</div>
                      <div className="text-white/30 text-sm mb-3">No daily habits yet</div>
                      <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}>Create your first habit</button>
                    </div>
                  : todayHabits.map(h => <HabitItem key={h._id} habit={h} onToggle={() => completeHabit(h._id)} compact />)
              }
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="section-title">This Week</span>
                <span className="badge badge-green">↑ 12%</span>
              </div>
              <div className="relative h-[160px]"><Bar data={chartData} options={chartOpts} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <StreakCard currentStreak={streak} longestStreak={dashboard?.longestStreak ?? 0} totalCompleted={user?.totalCompleted ?? 0} />
            <ProductivityScore score={score} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="section-title">Activity Heatmap</span>
                <span className="badge badge-purple">365 days</span>
              </div>
              <Heatmap data={dashboard?.heatmapData} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="section-title">AI Insights</span>
                <span className="badge badge-purple">✦ Live</span>
              </div>
              {INSIGHTS.map((ins, i) => <div key={i} className="insight">{ins}</div>)}
            </div>
          </div>
        </>
      )}

      {/* AI TOOLS */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-2 gap-5">
          <AISuggestions onAddHabit={createHabit} />
          <div className="space-y-4">
            <div className="card">
              <div className="section-title mb-3">Quick Actions</div>
              <div className="space-y-2">
                {[['🤖','Chat with AI Coach','/ai-coach'],['📅','Generate Today\'s Plan','/planner'],['⏱️','Start Focus Session','/pomodoro'],['📊','View Full Analytics','/analytics']].map(([icon,label,to]) => (
                  <button key={to} className="btn btn-ghost w-full justify-start gap-2 text-sm" onClick={() => navigate(to)}>
                    <span className="text-base">{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
            <ProductivityScore score={score} />
          </div>
        </div>
      )}

      {/* WEEKLY REPORT */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-2 gap-5">
          <WeeklyReport />
          <div className="space-y-4">
            <StreakCard currentStreak={streak} longestStreak={dashboard?.longestStreak ?? 0} totalCompleted={user?.totalCompleted ?? 0} />
            <div className="card">
              <div className="section-title mb-3">Export Data</div>
              <p className="text-sm text-white/40 mb-3">Download your habit history and analytics</p>
              <div className="flex gap-2">
                <a href="/api/export/csv"  className="btn btn-ghost btn-sm" download>📄 CSV</a>
                <a href="/api/export/json" className="btn btn-ghost btn-sm" download>📦 JSON</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <HabitModal open={addModal} onClose={() => setAddModal(false)} onSubmit={async (form) => { await createHabit(form); setAddModal(false); }} />
    </div>
  );
}
