const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  id: { type: String },
  productId: { type: String },
  name: { type: String, required: true },
  city: { type: String, default: '' },
  category: { type: String, default: '' },
  duration: { type: Number, default: null },
  start_time: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  img: { type: String, default: '' },
  addedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const scheduleDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, required: true },
  slots: [slotSchema]
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  info: {
    title: { type: String, required: true },
    dest: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    days: { type: Number, required: true },
    people: { type: String, default: '2' },
    budget: { type: String, default: '' },
    transport: { type: String, default: '자가용' },
    memo: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  schedule: [scheduleDaySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
