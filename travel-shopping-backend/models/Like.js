const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
