const cron = require('node-cron');
const User  = require('../models/User');
const Habit = require('../models/Habit');

/**
 * Cron service – runs scheduled jobs
 * Currently: daily reminder check at every hour's top
 */

// ── Daily habit reminder (runs every hour, checks per-user reminder time) ──
cron.schedule('0 * * * *', async () => {
  try {
    const nowHour = new Date().toTimeString().slice(0, 5); // 'HH:MM'
    const users = await User.find({ reminderTime: nowHour, isActive: true }).lean();

    for (const user of users) {
      const todayStr = new Date().toISOString().split('T')[0];
      const habits = await Habit.find({ user: user._id, isActive: true, frequency: 'daily' }).lean();
      const pending = habits.filter(h => !h.completions?.some(c => c.date === todayStr));

      if (pending.length > 0) {
        console.log(`[CRON] Reminder for ${user.email}: ${pending.length} habit(s) pending`);
        // TODO: send email via nodemailer or push notification
        // await emailService.sendReminder(user, pending);
      }
    }
  } catch (err) {
    console.error('[CRON] Reminder error:', err.message);
  }
});

// ── Midnight: reset daily streak check ────────────────────────────
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Midnight tick – streak integrity check');
  // Could flag users who broke streaks for motivational nudge
});

console.log('✅ Cron jobs registered');
