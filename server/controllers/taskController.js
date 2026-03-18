const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.getTasks = async (req, res, next) => {
  try {
    const { type, completed, priority } = req.query;
    const query = { user: req.user.id };
    if (type)      query.type        = type;
    if (priority)  query.priority    = priority;
    if (completed !== undefined) query.isCompleted = completed === 'true';

    const tasks = await Task.find(query).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const task = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

exports.toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    await task.save();
    res.json({ success: true, task });
  } catch (err) { next(err); }
};
