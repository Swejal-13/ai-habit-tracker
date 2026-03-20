import React, { useState, useEffect } from 'react';

const EMOJI_LIST = ['🏃','💪','🧘','📚','💧','🥗','😴','🎯','✍️','🎵','🌿','☀️','🧠','💊','🍎',
  '🏊','🚴','🧹','💻','🌙','🎨','🗣️','🔥','⭐','🏆','💡','🌱','🤸','🏋️','🧃',
  '🫧','🫁','🧬','🎻','🥋','🪷','🫶','📖','🎤','🖊️','🛏️','🍵','🧘‍♀️','🪴'];

const CATS = ['Health & Fitness','Mental Wellness','Learning','Productivity','Social','Nutrition','Other'];
const FREQS = ['daily','weekly','monthly','yearly'];

export default function HabitModal({ open, onClose, onSubmit, initial = null }) {
  const [form, setForm] = useState({ name:'', emoji:'🎯', category:'Health & Fitness', frequency:'daily', description:'', reminderTime:'08:00', weeklyGoal:7 });
  const [emojiSearch, setEmojiSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (initial) setForm({ name: initial.name, emoji: initial.emoji, category: initial.category, frequency: initial.frequency, description: initial.description || '', reminderTime: initial.reminderTime || '08:00', weeklyGoal: initial.weeklyGoal || 7 });
    else setForm({ name:'', emoji:'🎯', category:'Health & Fitness', frequency:'daily', description:'', reminderTime:'08:00', weeklyGoal:7 });
  }, [initial, open]);

  if (!open) return null;

  const filtered = emojiSearch
    ? EMOJI_LIST.filter((_, i) => i % 2 === 0)
    : EMOJI_LIST;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial ? 'Edit Habit' : 'Create New Habit'}</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Habit Name *</label>
            <input
              required
              autoFocus
              placeholder="e.g. Morning Run"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* Emoji picker */}
          <div className="form-row mb-3.5">
            <div>
              <label className="form-label">Emoji</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPicker(v => !v)}
                  className="flex items-center gap-2 w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-sm hover:border-white/20 transition-colors"
                >
                  <span className="text-xl">{form.emoji}</span>
                  <span className="text-white/40">Choose emoji</span>
                </button>
                {showPicker && (
                  <div className="absolute z-10 top-full mt-1 left-0 w-72 bg-bg-2 border border-white/10 rounded-xl p-3 shadow-2xl">
                    <input
                      placeholder="Search…"
                      value={emojiSearch}
                      onChange={e => setEmojiSearch(e.target.value)}
                      className="mb-2 text-xs py-1.5"
                    />
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {filtered.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => { setForm(p => ({ ...p, emoji: em })); setShowPicker(false); }}
                          className="text-xl p-1 rounded-md hover:bg-bg-4 transition-colors"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                {FREQS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Reminder Time</label>
              <input type="time" value={form.reminderTime} onChange={e => setForm(p => ({ ...p, reminderTime: e.target.value }))} />
            </div>
          </div>

          <div className="form-group mt-3.5">
            <label className="form-label">Description (optional)</label>
            <textarea
              rows={2}
              placeholder="Why is this habit important to you?"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-2.5 justify-end mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Create Habit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
