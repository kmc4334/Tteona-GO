const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  recommendation: {
    id: String,
    image: String,
    title: String,
    description: String,
    price: Number,
  },
  itinerary: [
    {
      name: String,
      latitude: Number,
      longitude: Number,
      description: String,
      category: String,
      estimated_cost: Number,
      day: Number,
      order: Number,
      route_group: String,
    }
  ],
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
