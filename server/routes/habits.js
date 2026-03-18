const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect);

const rules = [
  body('name').trim().notEmpty().withMessage('Habit name required').isLength({ max: 80 }),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
];

router.get('/',              ctrl.getHabits);
router.post('/',   rules,    ctrl.createHabit);
router.get('/:id',           ctrl.getHabit);
router.put('/:id',           ctrl.updateHabit);
router.delete('/:id',        ctrl.deleteHabit);
router.post('/:id/complete', ctrl.completeHabit);

module.exports = router;
