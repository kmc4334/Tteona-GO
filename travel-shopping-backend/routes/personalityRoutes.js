const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  savePersonalityResult,
  getPersonalityResult,
  getPersonalityHistory,
  deletePersonalityResult,
} = require('../controllers/personalityController');

// 모든 라우트는 인증 필요
router.use(protect);

// POST /api/personality/save - 성향 테스트 결과 저장
router.post('/save', savePersonalityResult);

// GET /api/personality/result - 최신 성향 테스트 결과 조회
router.get('/result', getPersonalityResult);

// GET /api/personality/history - 성향 테스트 이력 조회
router.get('/history', getPersonalityHistory);

// DELETE /api/personality/result/:id - 성향 테스트 결과 삭제
router.delete('/result/:id', deletePersonalityResult);

module.exports = router;
