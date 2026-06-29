const mongoose = require('mongoose');

const packageItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, default: '' },
  timeSlot: { type: String, default: '09:00' },
  day: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  category: { type: String, default: '' },
}, { _id: false });

const packageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: '나만의 여행 패키지' },
  items: [packageItemSchema],
  totalDays: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Package', packageSchema);
