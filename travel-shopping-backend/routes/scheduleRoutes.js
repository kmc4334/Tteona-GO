const express = require('express');
const { getSchedule, saveSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All schedule routes require auth

router.get('/', getSchedule);
router.post('/', saveSchedule);
router.delete('/', deleteSchedule);

module.exports = router;
