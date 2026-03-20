import React from 'react';

export default function HabitItem({ habit, onToggle, onEdit, onDelete, compact = false }) {
  return (
    <div
      className={`habit-item group ${habit.completedToday ? 'done' : ''}`}
      onClick={onToggle}
    >
      {/* Check circle */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          habit.completedToday
            ? 'bg-[#3dd68c] border-[#3dd68c] text-white text-xs'
            : 'border-white/20'
        }`}
      >
        {habit.completedToday && '✓'}
      </div>

      {/* Emoji */}
      <span className="text-2xl w-8 text-center flex-shrink-0">{habit.emoji}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-[14.5px] ${habit.completedToday ? 'text-white/50 line-through' : ''}`}>
          {habit.name}
        </div>
        <div className="flex items-center gap-2.5 text-xs text-white/40 mt-0.5">
          <span>{habit.category}</span>
          {!compact && <span>· {habit.frequency}</span>}
          <span className="flex items-center gap-0.5 text-[#f5a623] font-semibold">
            🔥{habit.currentStreak}
          </span>
        </div>
      </div>

      {/* Right: badges + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {habit.completedToday && <span className="badge badge-green text-[10px]">Done</span>}

        {!compact && (
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                className="btn-icon btn text-xl"
                onClick={e => { e.stopPropagation(); onEdit(habit); }}
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                className="btn-icon btn text-xl"
                onClick={e => { e.stopPropagation(); onDelete(habit._id); }}
                title="Delete"
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
