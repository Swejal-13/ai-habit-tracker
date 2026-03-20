import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PRIORITIES = ['high', 'medium', 'low'];
const TYPES = ['daily', 'weekly', 'monthly', 'yearly'];
const P_COLORS = { high: 'badge-red', medium: 'badge-amber', low: 'badge-green' };

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item group ${task.isCompleted ? 'opacity-60' : ''}`}>
      <div
        className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer flex-shrink-0 transition-all ${
          task.isCompleted ? 'bg-accent border-accent text-white text-[10px]' : 'border-white/20 hover:border-accent/50'
        }`}
        onClick={() => onToggle(task._id)}
      >
        {task.isCompleted && '✓'}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${task.isCompleted ? 'line-through text-white/30' : ''}`}>{task.title}</div>
        {task.dueDate && (
          <div className="text-[11px] text-white/30 mt-0.5">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
      <span className={`badge ${P_COLORS[task.priority]} text-[10px]`}>{task.priority}</span>
      <button
        className="btn-icon btn opacity-0 group-hover:opacity-100 text-xs"
        onClick={() => onDelete(task._id)}
      >✕</button>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('daily');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ title: '', priority: 'medium', type: 'daily', dueDate: '' });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { data } = await api.post('/tasks', { ...form, type: tab });
      setTasks(prev => [data.task, ...prev]);
      setForm({ title: '', priority: 'medium', type: tab, dueDate: '' });
      setModal(false);
      toast.success('Task added!');
    } catch { toast.error('Failed to add task'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      setTasks(prev => prev.map(t => t._id === id ? data.task : t));
    } catch { toast.error('Failed to update task'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered   = tasks.filter(t => t.type === tab);
  const pending    = filtered.filter(t => !t.isCompleted);
  const completed  = filtered.filter(t => t.isCompleted);
  const pct        = filtered.length ? Math.round((completed.length / filtered.length) * 100) : 0;

  return (
    <div className="p-7 max-w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Task Manager</h1>
          <p className="text-white/40 text-sm mt-0.5">Stay on top of your daily, weekly and long-term goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>＋ Add Task</button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 bg-bg-3 rounded-xl p-1 border border-white/[0.07] mb-5 w-fit">
        {TYPES.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab px-5 ${tab === t ? 'active' : ''}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Task list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">{tab.charAt(0).toUpperCase() + tab.slice(1)} Tasks</span>
            <span className="badge badge-purple">{pending.length} pending</span>
          </div>

          {loading ? (
            <div className="text-white/30 text-center py-8 text-sm">Loading…</div>
          ) : pending.length === 0 && completed.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-white/30 text-sm">No {tab} tasks yet</div>
            </div>
          ) : (
            <>
              {pending.map(t => <TaskItem key={t._id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
              {completed.length > 0 && (
                <>
                  <div className="text-xs text-white/30 mt-4 mb-2 px-1">Completed ({completed.length})</div>
                  {completed.map(t => <TaskItem key={t._id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
                </>
              )}
            </>
          )}
        </div>

        {/* Progress sidebar */}
        <div>
          <div className="section-header mb-3">
            <span className="section-title">{tab.charAt(0).toUpperCase() + tab.slice(1)} Progress</span>
            <span className="badge badge-green">{pct}%</span>
          </div>
          <div className="card mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Completion</span>
              <span className="text-white/50">{completed.length} / {filtered.length}</span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill bg-gradient-to-r from-accent to-cyan-400" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-medium mb-3">Priority Breakdown</div>
            {PRIORITIES.map(p => {
              const count = filtered.filter(t => t.priority === p).length;
              const pPct  = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
              const bar   = p === 'high' ? 'bg-[#ff5f5f]' : p === 'medium' ? 'bg-[#f5a623]' : 'bg-[#3dd68c]';
              return (
                <div key={p} className="mb-3">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span className="capitalize">{p}</span>
                    <span>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${bar}`} style={{ width: `${pPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Task</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task *</label>
                <input autoFocus required placeholder="What needs to be done?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2.5 justify-end mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
