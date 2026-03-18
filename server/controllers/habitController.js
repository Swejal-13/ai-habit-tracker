const Habit = require('../models/Habit');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// ── Streak helpers ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

function recalcStreak(habit) {
  if (!habit.completions.length) { habit.currentStreak = 0; return; }
  const dates = [...new Set(habit.completions.map(c => c.date))].sort().reverse();
  let streak = 0;
  let cursor = today();
  for (const d of dates) {
    if (d === cursor) { streak++; const prev = new Date(cursor); prev.setDate(prev.getDate()-1); cursor = prev.toISOString().split('T')[0]; }
    else if (d < cursor) break;
  }
  habit.currentStreak = streak;
  if (streak > habit.longestStreak) habit.longestStreak = streak;
}

// ── GET all habits ─────────────────────────────────────────────────
exports.getHabits = async (req, res, next) => {
  try {
    const { frequency, category, search } = req.query;
    const query = { user: req.user.id, isActive: true };
    if (frequency) query.frequency = frequency;
    if (category)  query.category  = category;
    if (search)    query.name       = { $regex: search, $options: 'i' };

    const habits = await Habit.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: habits.length, habits });
  } catch (err) { next(err); }
};

// ── CREATE habit ───────────────────────────────────────────────────
exports.createHabit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const habit = await Habit.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, habit });
  } catch (err) { next(err); }
};

// ── UPDATE habit ───────────────────────────────────────────────────
exports.updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, habit });
  } catch (err) { next(err); }
};

// ── DELETE habit (soft) ────────────────────────────────────────────
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit deleted' });
  } catch (err) { next(err); }
};

// ── COMPLETE habit for today ───────────────────────────────────────
exports.completeHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const dateStr = req.body.date || today();
    const alreadyDone = habit.completions.some(c => c.date === dateStr);

    if (alreadyDone) {
      // Toggle off
      habit.completions = habit.completions.filter(c => c.date !== dateStr);
    } else {
      // Toggle on
      habit.completions.push({ date: dateStr, note: req.body.note || '' });
      habit.lastCompletedDate = dateStr;

      // Update user total
      await User.findByIdAndUpdate(req.user.id, { $inc: { totalCompleted: 1 } });
    }

    recalcStreak(habit);
    await habit.save();

    // Check achievements
    await checkAchievements(req.user.id, habit);

    res.json({ success: true, habit, completed: !alreadyDone });
  } catch (err) { next(err); }
};

// ── GET single habit ───────────────────────────────────────────────
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, habit });
  } catch (err) { next(err); }
};

// ── Achievement checker ────────────────────────────────────────────
async function checkAchievements(userId, habit) {
  const user = await User.findById(userId);
  const earned = [];
  const has = (badge) => user.achievements.includes(badge);

  if (!has('first_habit')) { earned.push('first_habit'); }
  if (habit.currentStreak >= 3  && !has('streak_3'))   earned.push('streak_3');
  if (habit.currentStreak >= 7  && !has('streak_7'))   earned.push('streak_7');
  if (habit.currentStreak >= 14 && !has('streak_14'))  earned.push('streak_14');
  if (habit.currentStreak >= 30 && !has('streak_30'))  earned.push('streak_30');
  if (habit.currentStreak >= 100&& !has('streak_100')) earned.push('streak_100');
  if (user.totalCompleted >= 50 && !has('total_50'))   earned.push('total_50');
  if (user.totalCompleted >= 100&& !has('total_100'))  earned.push('total_100');

  if (earned.length) {
    user.achievements.push(...earned);
    // update longest streak on user record
    if (habit.longestStreak > user.longestStreak) user.longestStreak = habit.longestStreak;
    await user.save();
  }
}
