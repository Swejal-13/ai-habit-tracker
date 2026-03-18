const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 500 },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'daily' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  isCompleted: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

taskSchema.index({ user: 1, isCompleted: 1 });
taskSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Task', taskSchema);
