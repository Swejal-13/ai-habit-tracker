const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  completedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { _id: false });

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, default: '', maxlength: 300 },
  emoji: { type: String, default: '⭐' },
  category: {
    type: String,
    enum: ['Health & Fitness', 'Mental Wellness', 'Learning', 'Productivity', 'Social', 'Nutrition', 'Other'],
    default: 'Other',
  },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'daily' },
  reminderTime: { type: String, default: null }, // '08:00'
  color: { type: String, default: '#7c6af7' },

  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null }, // 'YYYY-MM-DD'

  // Completion history
  completions: [completionSchema],

  // Goals
  weeklyGoal: { type: Number, default: 7 },
  monthlyGoal: { type: Number, default: 30 },

  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual: completion count
habitSchema.virtual('totalCompletions').get(function () {
  return this.completions.length;
});

// Virtual: today's status
habitSchema.virtual('completedToday').get(function () {
  const today = new Date().toISOString().split('T')[0];
  return this.completions.some(c => c.date === today);
});

habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

// Index for fast user+date queries
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, 'completions.date': 1 });

module.exports = mongoose.model('Habit', habitSchema);
