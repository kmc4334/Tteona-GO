const express = require('express');
const { getMyPoints, earnPoints, spendPoints, seedPoints } = require('../controllers/pointController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyPoints);
router.post('/earn', earnPoints);
router.post('/spend', spendPoints);
router.post('/seed', seedPoints);

module.exports = router;
