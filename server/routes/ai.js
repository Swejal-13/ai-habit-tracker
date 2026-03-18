const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/chat',             ctrl.chat);
router.post('/habit-plan',       ctrl.generateHabitPlan);
router.post('/day-plan',         ctrl.generateDayPlan);
router.get('/weekly-report',     ctrl.weeklyReport);
router.get('/suggestions',       ctrl.habitSuggestions);

module.exports = router;
