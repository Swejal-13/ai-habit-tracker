const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/signup', signupRules, signup);
router.post('/login',  loginRules,  login);
router.get('/me',      protect,     getMe);
router.put('/password',protect, changePassword);

module.exports = router;
