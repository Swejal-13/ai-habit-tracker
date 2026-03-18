const Habit = require('../models/Habit');
const Task  = require('../models/Task');

// ── CSV Export ─────────────────────────────────────────────────────
exports.exportCSV = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id, isActive: true }).lean();

    const rows = [];
    rows.push(['Habit Name', 'Category', 'Frequency', 'Current Streak', 'Longest Streak', 'Total Completions', 'Created At'].join(','));

    habits.forEach(h => {
      rows.push([
        `"${h.name}"`,
        `"${h.category}"`,
        h.frequency,
        h.currentStreak,
        h.longestStreak,
        h.completions?.length ?? 0,
        new Date(h.createdAt).toISOString().split('T')[0],
      ].join(','));
    });

    // Completions detail sheet
    rows.push('');
    rows.push(['Habit', 'Completed Date', 'Note'].join(','));
    habits.forEach(h => {
      (h.completions || []).forEach(c => {
        rows.push([`"${h.name}"`, c.date, `"${c.note || ''}"`].join(','));
      });
    });

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="habitflow-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) { next(err); }
};

// ── JSON Export ────────────────────────────────────────────────────
exports.exportJSON = async (req, res, next) => {
  try {
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user.id }).lean(),
      Task.find({ user: req.user.id }).lean(),
    ]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="habitflow-backup-${Date.now()}.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      habits: habits.map(h => ({
        name: h.name, emoji: h.emoji, category: h.category, frequency: h.frequency,
        currentStreak: h.currentStreak, longestStreak: h.longestStreak,
        completions: h.completions, createdAt: h.createdAt,
      })),
      tasks: tasks.map(t => ({
        title: t.title, type: t.type, priority: t.priority,
        isCompleted: t.isCompleted, createdAt: t.createdAt,
      })),
    });
  } catch (err) { next(err); }
};
