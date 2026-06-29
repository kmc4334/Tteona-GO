const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' },
  bookingDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  // 날짜 및 인원
  checkInDate: { type: String, default: null },
  checkOutDate: { type: String, default: null },
  guests: { type: Number, default: 1 },
  // 플랫폼 비교 예약
  platform: { type: String, default: null },
  platformPrice: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
