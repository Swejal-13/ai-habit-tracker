import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const BLOCK_COLORS = ['border-accent','border-[#4a9eff]','border-[#3dd68c]','border-[#f5a623]','border-[#ff6b9d]','border-[#00d4ff]','border-[#ff5f5f]'];
const TYPE_ICONS   = { deep_work:'🧠', habit:'🔄', break:'☕', admin:'📧', meeting:'🤝', exercise:'🏃', other:'⚡' };

export default function DailyPlanner() {
  const [items, setItems]     = useState('');
  const [energy, setEnergy]   = useState('High — Ready to crush it');
  const [wake, setWake]       = useState('7:00 AM');
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    const list = items.split('\n').map(s => s.trim()).filter(Boolean);
    if (!list.length) return toast.error('Add some tasks first');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/day-plan', { items: list, energyLevel: energy, wakeTime: wake });
      setPlan(data.plan);
      toast.success('Day plan generated!');
    } catch {
      // Fallback demo plan
      setPlan({
        schedule: [
          { time:'6:30 AM', task:'Morning routine & hydration', type:'habit', duration:'30 min', reason:'Prime your body and mind' },
          { time:'7:30 AM', task:'Quick review & priority setting', type:'admin', duration:'15 min', reason:'Start focused' },
          { time:'9:00 AM', task:list[0] || 'Deep work block', type:'deep_work', duration:'2 hours', reason:'Peak cognitive hours' },
          { time:'11:00 AM', task:list[1] || 'Secondary tasks', type:'admin', duration:'1 hour', reason:'Momentum continues' },
          { time:'12:00 PM', task:'Lunch & mindful break', type:'break', duration:'45 min', reason:'Recharge' },
          { time:'1:30 PM', task:list[2] || 'Meetings & comms', type:'meeting', duration:'1.5 hours', reason:'Afternoon social energy' },
          { time:'3:30 PM', task:'Exercise or walk', type:'habit', duration:'30 min', reason:'Beat afternoon slump' },
          { time:'4:30 PM', task:'Review & wind down', type:'admin', duration:'30 min', reason:'Close the loop' },
        ],
        advice: 'Schedule your hardest task in the first 2 hours — that\'s when willpower is highest.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">📅 AI Daily Planner</h1>
        <p className="text-white/40 text-sm mt-0.5">Let AI build your optimal day schedule</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Input */}
        <div className="card">
          <div className="section-title mb-4">What's on your plate today?</div>

          <div className="form-group">
            <label className="form-label">Tasks & Habits (one per line)</label>
            <textarea
              rows={6}
              placeholder={"Deep work session\nMorning run\nTeam meeting at 2pm\nRead 30 min\nMeditation"}
              value={items}
              onChange={e => setItems(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Energy Level</label>
              <select value={energy} onChange={e => setEnergy(e.target.value)}>
                <option>High — Ready to crush it</option>
                <option>Medium — Balanced day</option>
                <option>Low — Need easy wins</option>
              </select>
            </div>
            <div>
              <label className="form-label">Wake Time</label>
              <select value={wake} onChange={e => setWake(e.target.value)}>
                {['5:00 AM','6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','9:00 AM'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary w-full justify-center mt-2"
            onClick={generate}
            disabled={loading}
          >
            {loading ? '✦ Building your schedule…' : '✦ Generate My Optimal Day'}
          </button>
        </div>

        {/* Schedule output */}
        <div>
          <div className="section-title mb-4">Today's Optimized Schedule</div>

          {!plan ? (
            <div className="flex items-center justify-center h-64 text-white/20 text-sm card">
              Fill in your tasks and click Generate →
            </div>
          ) : (
            <div className="space-y-2.5">
              {plan.schedule?.map((slot, i) => (
                <div
                  key={i}
                  className={`flex gap-3 items-start p-3 bg-card border border-white/[0.07] border-l-[3px] rounded-lg ${BLOCK_COLORS[i % BLOCK_COLORS.length]}`}
                >
                  <div className="text-[11px] font-semibold text-white/50 w-16 flex-shrink-0 mt-0.5">{slot.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span>{TYPE_ICONS[slot.type] || '⚡'}</span>
                      <span className="text-sm font-medium">{slot.task}</span>
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{slot.duration} · {slot.reason}</div>
                  </div>
                </div>
              ))}

              {plan.advice && (
                <div className="insight mt-3">💡 {plan.advice}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
