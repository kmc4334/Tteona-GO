const mongoose = require('mongoose');

const personalityResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  travelType: {
    type: String,
    required: true,
    enum: [
      'master_planner',
      'free_spirit',
      'cozy_healer',
      'trend_setter',
      'action_seeker',
      'local_gourmet',
      'easy_going',
      'lone_wanderer'
    ],
  },
  scores: {
    plan: { type: Number, default: 0 },
    spontaneous: { type: Number, default: 0 },
    adventure: { type: Number, default: 0 },
    safe: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    rest: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    solo: { type: Number, default: 0 },
    healing: { type: Number, default: 0 },
    aesthetic: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    nature: { type: Number, default: 0 },
    easygoing: { type: Number, default: 0 },
  },
  axisScores: {
    plan: { type: Number, default: 0 },
    adventure: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
  },
  answers: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 사용자당 최신 결과만 유지하기 위한 인덱스
personalityResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PersonalityResult', personalityResultSchema);
