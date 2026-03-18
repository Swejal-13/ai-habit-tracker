const router   = require('express').Router();
const ctrl     = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/csv',  ctrl.exportCSV);
router.get('/json', ctrl.exportJSON);

module.exports = router;
