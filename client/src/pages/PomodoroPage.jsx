import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FOCUS_SECS  = 25 * 60;
const BREAK_SECS  = 5  * 60;
const CIRCUMF     = 2 * Math.PI * 80; // r=80

export default function PomodoroPage() {
  const [mode, setMode]         = useState('focus'); // 'focus' | 'break'
  const [secs, setSecs]         = useState(FOCUS_SECS);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [task, setTask]         = useState('');
  const [stats, setStats]       = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get('/analytics/focus/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  const tick = useCallback(() => {
    setSecs(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        setRunning(false);
        // Session complete
        if (mode === 'focus') {
          setSessions(s => s + 1);
          api.post('/analytics/focus', { duration: 25, type: 'focus', taskLabel: task || 'Focus Session' }).catch(() => {});
          toast.success('🎉 Focus session complete! Take a break.');
          setMode('break');
          setSecs(BREAK_SECS);
        } else {
          toast('☕ Break over! Ready to focus again?');
          setMode('focus');
          setSecs(FOCUS_SECS);
        }
        return 0;
      }
      return prev - 1;
    });
  }, [mode, task]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const toggle = () => setRunning(v => !v);
  const reset  = () => { setRunning(false); setSecs(mode === 'focus' ? FOCUS_SECS : BREAK_SECS); };
  const skip   = () => {
    setRunning(false);
    if (mode === 'focus') { setSessions(s => s + 1); setMode('break'); setSecs(BREAK_SECS); }
    else { setMode('focus'); setSecs(FOCUS_SECS); }
  };

  const switchMode = (m) => { setRunning(false); setMode(m); setSecs(m === 'focus' ? FOCUS_SECS : BREAK_SECS); };

  const total  = mode === 'focus' ? FOCUS_SECS : BREAK_SECS;
  const pct    = secs / total;
  const offset = CIRCUMF * (1 - pct);
  const mins   = Math.floor(secs / 60);
  const secPad = String(secs % 60).padStart(2, '0');

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">⏱️ AI Focus Timer</h1>
        <p className="text-white/40 text-sm mt-0.5">Pomodoro-powered deep work sessions</p>
      </div>

      <div className="flex gap-6 items-start flex-wrap">
        {/* Timer card */}
        <div className="card w-72 text-center flex-shrink-0">
          {/* Mode toggle */}
          <div className="flex gap-1.5 bg-bg-3 rounded-xl p-1 mb-5">
            {['focus','break'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`tab flex-1 py-1.5 ${mode === m ? 'active' : ''}`}
              >
                {m === 'focus' ? '🧠 Focus' : '☕ Break'}
              </button>
            ))}
          </div>

          {/* Ring */}
          <div className="relative w-44 h-44 mx-auto mb-5">
            <svg width="176" height="176" viewBox="0 0 176 176" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="88" cy="88" r="80" fill="none"
                stroke={mode === 'focus' ? '#7c6af7' : '#3dd68c'}
                strokeWidth="8"
                strokeDasharray={CIRCUMF}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-heading text-4xl font-bold">{mins}:{secPad}</div>
              <div className="text-xs text-white/40 mt-1">{mode === 'focus' ? 'Focus Mode' : 'Break Time'}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center mb-4">
            <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
            <button
              className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggle}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={skip}>⏭ Skip</button>
          </div>

          <div className="border-t border-white/[0.07] pt-4">
            <div className="text-xs text-white/30 mb-1">Sessions today</div>
            <div className="font-heading text-2xl font-bold text-accent-2">{sessions}</div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-64 space-y-4">
          {/* Current task */}
          <div className="card">
            <div className="section-title mb-3">Current Task</div>
            <input
              placeholder="What are you focusing on?"
              value={task}
              onChange={e => setTask(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <div className="stat-label">Total Focus Time</div>
              <div className="stat-value gradient-text">
                {stats ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m` : '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">All-Time Sessions</div>
              <div className="stat-value text-[#4a9eff]">{stats?.totalSessions ?? sessions}</div>
            </div>
          </div>

          {/* AI insights */}
          <div className="card">
            <div className="section-title mb-3">AI Focus Insights</div>
            <div className="space-y-2">
              <div className="insight">🌅 Best focus window: <strong>9 am – 11 am</strong></div>
              <div className="insight">📉 Attention typically dips at <strong>2–3 pm</strong>. Schedule breaks then.</div>
              {stats?.bestHour && <div className="insight">⭐ Your most productive hour: <strong>{stats.bestHour}</strong></div>}
              <div className="insight">✅ Avg focused session before break needed: <strong>22 min</strong></div>
            </div>
          </div>

          {/* Tips */}
          <div className="card">
            <div className="section-title mb-3">Focus Tips</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li>📵 Put your phone in another room during focus blocks</li>
              <li>🎧 Use binaural beats or lo-fi music for deep work</li>
              <li>💧 Drink water before each session</li>
              <li>🪟 Sit near natural light when possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
