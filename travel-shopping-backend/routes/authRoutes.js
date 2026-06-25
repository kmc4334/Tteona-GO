const express = require('express');
const { signup, login, sendVerificationCode, verifyCode, getMe, updateName, updateEmail, updatePassword, updateProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.get('/me', protect, getMe);
router.put('/name', protect, updateName);
router.put('/email', protect, updateEmail);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.delete('/delete', protect, deleteAccount);


module.exports = router;
