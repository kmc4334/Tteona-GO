const Schedule = require('../models/Schedule');

// @desc    Get active travel schedule
// @route   GET /api/schedules
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ userId: req.user._id });
    return res.json({
      success: true,
      schedule: schedule || null
    });
  } catch (error) {
    console.error('[ScheduleController] getSchedule error:', error.message);
    return res.status(500).json({ success: false, message: '일정을 가져오는 중 오류가 발생했습니다.' });
  }
};

// @desc    Save (create or update) travel schedule
// @route   POST /api/schedules
// @access  Private
exports.saveSchedule = async (req, res) => {
  try {
    const { info, schedule } = req.body;
    if (!info || !schedule) {
      return res.status(400).json({ success: false, message: '일정 정보(info)와 상세 일정(schedule) 데이터가 필요합니다.' });
    }

    let existingSchedule = await Schedule.findOne({ userId: req.user._id });
    if (existingSchedule) {
      existingSchedule.info = info;
      existingSchedule.schedule = schedule;
      existingSchedule.updatedAt = new Date();
      await existingSchedule.save();
      return res.json({
        success: true,
        message: '일정이 성공적으로 업데이트되었습니다.',
        schedule: existingSchedule
      });
    } else {
      const newSchedule = await Schedule.create({
        userId: req.user._id,
        info,
        schedule
      });
      return res.json({
        success: true,
        message: '일정이 성공적으로 생성되었습니다.',
        schedule: newSchedule
      });
    }
  } catch (error) {
    console.error('[ScheduleController] saveSchedule error:', error.message);
    return res.status(500).json({ success: false, message: '일정을 저장하는 중 오류가 발생했습니다.' });
  }
};

// @desc    Delete/Clear travel schedule
// @route   DELETE /api/schedules
// @access  Private
exports.deleteSchedule = async (req, res) => {
  try {
    const result = await Schedule.findOneAndDelete({ userId: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: '삭제할 일정이 없습니다.' });
    }
    return res.json({
      success: true,
      message: '일정이 초기화되었습니다.'
    });
  } catch (error) {
    console.error('[ScheduleController] deleteSchedule error:', error.message);
    return res.status(500).json({ success: false, message: '일정을 삭제하는 중 오류가 발생했습니다.' });
  }
};
