const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

const rules = [
  body('title').trim().notEmpty().withMessage('Task title required').isLength({ max: 200 }),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('type').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
];

router.get('/',               ctrl.getTasks);
router.post('/',    rules,    ctrl.createTask);
router.put('/:id',            ctrl.updateTask);
router.delete('/:id',         ctrl.deleteTask);
router.patch('/:id/toggle',   ctrl.toggleTask);

module.exports = router;
