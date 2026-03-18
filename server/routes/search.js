const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task  = require('../models/Task');

router.use(protect);

// GET /api/search?q=keyword&type=habits|tasks|all
router.get('/', async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;
    if (!q || q.trim().length < 1) return res.json({ success: true, results: [] });

    const regex = { $regex: q.trim(), $options: 'i' };
    const results = [];

    if (type === 'all' || type === 'habits') {
      const habits = await Habit.find({ user: req.user.id, isActive: true, name: regex })
        .select('name emoji category currentStreak frequency').limit(8);
      habits.forEach(h => results.push({ type: 'habit', id: h._id, title: h.name, subtitle: h.category, emoji: h.emoji, meta: `🔥 ${h.currentStreak}` }));
    }

    if (type === 'all' || type === 'tasks') {
      const tasks = await Task.find({ user: req.user.id, title: regex })
        .select('title priority type isCompleted').limit(8);
      tasks.forEach(t => results.push({ type: 'task', id: t._id, title: t.title, subtitle: t.type, emoji: t.isCompleted ? '✅' : '⬜', meta: t.priority }));
    }

    res.json({ success: true, results });
  } catch (err) { next(err); }
});

module.exports = router;
