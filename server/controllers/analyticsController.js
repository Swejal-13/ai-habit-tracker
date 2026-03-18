const Habit = require('../models/Habit');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// Helper: date N days ago as YYYY-MM-DD
const daysAgo = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// ── DASHBOARD OVERVIEW ─────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const habits = await Habit.find({ user: userId, isActive: true });
    const tasks  = await Task.find({ user: userId });

    // Today's stats
    const totalHabits     = habits.length;
    const completedToday  = habits.filter(h => h.completions.some(c => c.date === todayStr)).length;
    const currentStreak   = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
    const longestStreak   = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);

    // Productivity score (weighted formula)
    const completionRate = totalHabits ? (completedToday / totalHabits) * 100 : 0;
    const streakBonus    = Math.min(currentStreak * 0.5, 20);
    const tasksDone      = tasks.filter(t => t.isCompleted).length;
    const taskBonus      = Math.min(tasksDone * 2, 20);
    const productivityScore = Math.min(Math.round(completionRate * 0.6 + streakBonus + taskBonus), 100);

    // Update user score
    await User.findByIdAndUpdate(userId, { productivityScore });

    // Weekly completion data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const count = habits.reduce((sum, h) => sum + (h.completions.some(c => c.date === d) ? 1 : 0), 0);
      weeklyData.push({ date: d, count });
    }

    // Monthly completion data (last 30 days)
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i);
      const count = habits.reduce((sum, h) => sum + (h.completions.some(c => c.date === d) ? 1 : 0), 0);
      monthlyData.push({ date: d, count });
    }

    // Heatmap data (last 365 days)
    const heatmapData = {};
    for (let i = 364; i >= 0; i--) {
      const d = daysAgo(i);
      heatmapData[d] = habits.reduce((sum, h) => sum + (h.completions.some(c => c.date === d) ? 1 : 0), 0);
    }

    res.json({
      success: true,
      dashboard: {
        totalHabits,
        completedToday,
        completionRate: Math.round(completionRate),
        currentStreak,
        longestStreak,
        productivityScore,
        totalTasksCompleted: tasksDone,
        weeklyData,
        monthlyData,
        heatmapData,
      },
    });
  } catch (err) { next(err); }
};

// ── HABIT ANALYTICS ────────────────────────────────────────────────
exports.getHabitAnalytics = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id, isActive: true });

    const analytics = habits.map(h => {
      const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(29 - i));
      const completedLast30 = last30.filter(d => h.completions.some(c => c.date === d)).length;
      const rate = Math.round((completedLast30 / 30) * 100);
      return {
        id: h._id,
        name: h.name,
        emoji: h.emoji,
        category: h.category,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        totalCompletions: h.completions.length,
        completionRateLast30: rate,
        trend: rate >= 70 ? 'great' : rate >= 40 ? 'ok' : 'needs_work',
      };
    });

    // Best and worst habits
    const sorted = [...analytics].sort((a, b) => b.completionRateLast30 - a.completionRateLast30);

    res.json({
      success: true,
      analytics,
      insights: {
        bestHabits: sorted.slice(0, 3),
        needsWork: sorted.slice(-3).filter(h => h.completionRateLast30 < 50),
      },
    });
  } catch (err) { next(err); }
};

// ── FOCUS SESSIONS ─────────────────────────────────────────────────
exports.logFocusSession = async (req, res, next) => {
  try {
    const session = await FocusSession.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
};

exports.getFocusStats = async (req, res, next) => {
  try {
    const sessions = await FocusSession.find({ user: req.user.id, type: 'focus' }).sort({ completedAt: -1 }).limit(200);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date === todayStr);

    // Hour distribution (best focus hours)
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(s => { hourCounts[new Date(s.completedAt).getHours()]++; });
    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));

    res.json({
      success: true,
      stats: {
        totalSessions: sessions.length,
        totalMinutes,
        todaySessions: todaySessions.length,
        bestHour: `${bestHour}:00`,
        recentSessions: sessions.slice(0, 10),
      },
    });
  } catch (err) { next(err); }
};
