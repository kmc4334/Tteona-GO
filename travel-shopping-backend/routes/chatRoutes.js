const express = require('express');
const { getChatHistory, saveMessage, clearChatHistory, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All chat routes require auth

router.get('/', getChatHistory);
router.post('/', saveMessage);
router.delete('/', clearChatHistory);
router.post('/message', sendMessage);

module.exports = router;
