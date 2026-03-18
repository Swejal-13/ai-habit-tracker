const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskLabel: { type: String, default: 'Focus Session' },
  duration: { type: Number, default: 25 }, // minutes
  type: { type: String, enum: ['focus', 'break'], default: 'focus' },
  completedAt: { type: Date, default: Date.now },
  date: { type: String }, // 'YYYY-MM-DD' for quick lookup
}, { timestamps: true });

focusSessionSchema.pre('save', function (next) {
  if (!this.date) this.date = new Date().toISOString().split('T')[0];
  next();
});

focusSessionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
