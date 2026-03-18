const router = require('express').Router();
const ctrl = require('../controllers/friendsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',                ctrl.getFriends);
router.get('/leaderboard',     ctrl.getLeaderboard);
router.get('/search',          ctrl.searchUsers);
router.post('/request',        ctrl.sendRequest);
router.post('/respond',        ctrl.respondRequest);

module.exports = router;
