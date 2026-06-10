const express = require('express');
const { getBookings, createBooking, cancelBooking, getLikes, toggleLike } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/bookings', protect, getBookings);
router.post('/bookings', protect, createBooking);
router.delete('/bookings/:id', protect, cancelBooking);
router.get('/likes', protect, getLikes);
router.post('/likes/toggle', protect, toggleLike);

module.exports = router;
