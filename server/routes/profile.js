const router = require('express').Router();
const ctrl = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/',                   ctrl.getProfile);
router.put('/',                   ctrl.updateProfile);
router.post('/avatar', upload.single('avatar'), ctrl.uploadAvatar);
router.delete('/avatar',          ctrl.removeAvatar);

module.exports = router;
