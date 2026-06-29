const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['EARN', 'SPEND'],
    default: 'EARN'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
