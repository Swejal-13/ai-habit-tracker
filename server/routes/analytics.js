const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard',        ctrl.getDashboard);
router.get('/habits',           ctrl.getHabitAnalytics);
router.post('/focus',           ctrl.logFocusSession);
router.get('/focus/stats',      ctrl.getFocusStats);

module.exports = router;
