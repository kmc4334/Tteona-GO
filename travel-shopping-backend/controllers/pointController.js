const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// @desc    Get current points and transactions
// @route   GET /api/points
// @access  Private
exports.getMyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points');
    const transactions = await PointTransaction.find({ userId: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      points: user.points,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Earn points (e.g., after booking)
// @route   POST /api/points/earn
// @access  Private
exports.earnPoints = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '적립 포인트는 0보다 커야 합니다.' });
    }

    const user = await User.findById(req.user.id);
    user.points += amount;
    await user.save();

    const transaction = await PointTransaction.create({
      userId: req.user.id,
      amount,
      description: description || '포인트 적립',
      type: 'EARN',
    });

    res.status(201).json({ success: true, points: user.points, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Spend points
// @route   POST /api/points/spend
// @access  Private
exports.spendPoints = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '사용 포인트는 0보다 커야 합니다.' });
    }

    const user = await User.findById(req.user.id);
    if (user.points < amount) {
      return res.status(400).json({ success: false, message: '포인트가 부족합니다.' });
    }

    user.points -= amount;
    await user.save();

    const transaction = await PointTransaction.create({
      userId: req.user.id,
      amount: -amount,
      description: description || '포인트 사용',
      type: 'SPEND',
    });

    res.status(201).json({ success: true, points: user.points, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed points for testing
// @route   POST /api/points/seed
// @access  Private
exports.seedPoints = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const user = await User.findById(req.user.id);
    user.points += amount;
    await user.save();

    const transaction = await PointTransaction.create({
      userId: req.user.id,
      amount,
      description,
      type: amount >= 0 ? 'EARN' : 'SPEND'
    });

    res.status(201).json({
      success: true,
      points: user.points,
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
