const express = require('express');
const { confirmPayment, getPaymentHistory, tossSuccess, tossFail } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 토스 redirect URL (인증 불필요 - 토스 서버에서 호출)
router.get('/toss-success', tossSuccess);
router.get('/toss-fail', tossFail);

// 인증 필요 라우트
router.use(protect);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
