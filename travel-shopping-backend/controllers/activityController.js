const Booking = require('../models/Booking');
const Like = require('../models/Like');

// @desc    Get user's bookings
// @route   GET /api/activity/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a booking
// @route   POST /api/activity/bookings
exports.createBooking = async (req, res) => {
  try {
    const { productId, title, price, image, checkInDate, checkOutDate, guests, platform, platformPrice } = req.body;
    const booking = await Booking.create({
      userId: req.user.id,
      productId,
      title,
      price,
      image,
      checkInDate: checkInDate || null,
      checkOutDate: checkOutDate || null,
      guests: guests || 1,
      platform: platform || null,
      platformPrice: platformPrice || null,
    });
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's liked items
// @route   GET /api/activity/likes
exports.getLikes = async (req, res) => {
  try {
    const likes = await Like.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like on a product
// @route   POST /api/activity/likes/toggle
exports.toggleLike = async (req, res) => {
  try {
    const { productId, title, price, image, category } = req.body;
    const existing = await Like.findOne({ userId: req.user.id, productId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      return res.json({ success: true, liked: false, message: '찜 해제되었습니다.' });
    }

    await Like.create({ userId: req.user.id, productId, title, price, image, category });
    res.json({ success: true, liked: true, message: '찜 목록에 추가되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel / delete a booking
// @route   DELETE /api/activity/bookings/:id
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
    }
    res.json({ success: true, message: '예약이 취소되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

