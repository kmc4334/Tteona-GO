const express = require('express');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All notification routes require auth

// IMPORTANT: specific routes before parameterized ones
router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/read-all', markAllAsRead);
router.delete('/', clearAll);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
