const PersonalityResult = require('../models/PersonalityResult');

/**
 * 성향 테스트 결과 저장
 * POST /api/personality/save
 */
exports.savePersonalityResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { travelType, scores, axisScores, answers } = req.body;

    // 기존 결과가 있으면 업데이트, 없으면 생성
    const result = await PersonalityResult.findOneAndUpdate(
      { userId },
      {
        userId,
        travelType,
        scores,
        axisScores,
        answers,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: '성향 테스트 결과가 저장되었습니다.',
      result,
    });
  } catch (error) {
    console.error('Save personality result error:', error);
    res.status(500).json({
      success: false,
      message: '성향 테스트 결과 저장 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * 사용자의 최신 성향 테스트 결과 조회
 * GET /api/personality/result
 */
exports.getPersonalityResult = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await PersonalityResult.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!result) {
      return res.json({
        success: true,
        message: '저장된 성향 테스트 결과가 없습니다.',
        result: null,
      });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Get personality result error:', error);
    res.status(500).json({
      success: false,
      message: '성향 테스트 결과 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * 사용자의 성향 테스트 이력 조회
 * GET /api/personality/history
 */
exports.getPersonalityHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const history = await PersonalityResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Get personality history error:', error);
    res.status(500).json({
      success: false,
      message: '성향 테스트 이력 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * 성향 테스트 결과 삭제
 * DELETE /api/personality/result/:id
 */
exports.deletePersonalityResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const resultId = req.params.id;

    const result = await PersonalityResult.findOneAndDelete({
      _id: resultId,
      userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '삭제할 결과를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '성향 테스트 결과가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete personality result error:', error);
    res.status(500).json({
      success: false,
      message: '성향 테스트 결과 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
