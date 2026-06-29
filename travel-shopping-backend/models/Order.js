const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title:     { type: String, required: true },
  image:     { type: String, default: '' },
  category:  { type: String, default: '기타' },
  price:     { type: Number, required: true },
  quantity:  { type: Number, default: 1 },
  // 숙박
  checkInDate:  { type: String, default: null },
  checkOutDate: { type: String, default: null },
  nights:       { type: Number, default: null },
  // 체험
  experienceDate: { type: String, default: null },
  experienceSlot: { type: String, default: null },
  guests:         { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNo:    { type: String, unique: true },          // 주문번호 (자동생성)
  items:      { type: [orderItemSchema], required: true },

  // 금액
  subtotal:        { type: Number, required: true },   // 상품 합계
  discountAmount:  { type: Number, default: 0 },       // 할인액
  pointsUsed:      { type: Number, default: 0 },       // 포인트 사용액
  finalAmount:     { type: Number, required: true },   // 최종 결제액
  pointsEarned:    { type: Number, default: 0 },       // 이번 결제로 적립된 포인트

  // 결제 수단
  paymentMethod: {
    type: String,
    enum: ['card', 'kakao_pay', 'naver_pay', 'toss', 'points'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'paid',     // 실결제 연동 전: 즉시 paid 처리
  },

  // 주문 상태
  status: {
    type: String,
    enum: ['confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'confirmed',
  },

  // 연락처 (선택)
  contactName:  { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

// 주문번호 자동 생성 (TTG + yyyyMMdd + 6자리 랜덤)
orderSchema.pre('save', function (next) {
  if (!this.orderNo) {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNo = `TTG-${date}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
