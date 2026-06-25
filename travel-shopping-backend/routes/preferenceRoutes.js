const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

/**
 * POST /api/preference/init
 * 여행 성향 퀴즈 결과 저장
 */
router.post('/init', protect, async (req, res) => {
  try {
    const { travelType, scores, axisScores, tags } = req.body;
    const userId = req.user.id;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'travelPersonality.type': travelType,
          'travelPersonality.scores': scores,
          'travelPersonality.axisScores': axisScores,
          'travelPersonality.tags': tags,
          'travelPersonality.analyzedAt': new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      message: '여행 성향이 저장되었습니다.',
      travelPersonality: updated.travelPersonality,
    });
  } catch (err) {
    console.error('[preference/init]', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/preference/me
 * 내 성향 조회
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('travelPersonality');
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, travelPersonality: user.travelPersonality || null });
  } catch (err) {
    console.error('[preference/me]', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
