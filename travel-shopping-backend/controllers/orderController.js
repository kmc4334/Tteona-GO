/**
 * orderController.js
 * 구매/결제 처리
 */
const Order = require('../models/Order');
const User  = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// ── 포인트 적립율 ──────────────────────────────
const POINT_EARN_RATE = 0.05; // 결제금액의 5%

// ────────────────────────────────────────────────
// POST /api/orders
// ────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const {
      items,           // [{ productId, title, image, category, price, quantity, ...날짜옵션 }]
      subtotal,        // 상품 합계
      discountAmount,  // 할인액 (0 가능)
      pointsUsed,      // 포인트 사용액 (0 가능)
      paymentMethod,   // 'card' | 'kakao_pay' | 'naver_pay' | 'toss' | 'points'
      contactName,
      contactPhone,
      contactEmail,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: '주문 상품이 없습니다.' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: '결제 수단을 선택해주세요.' });
    }

    const user = await User.findById(req.user.id);

    // ── 포인트 사용 검증 ──────────────────────
    const usedPoints = parseInt(pointsUsed) || 0;
    if (usedPoints > 0) {
      if (user.points < usedPoints) {
        return res.status(400).json({ success: false, message: '포인트가 부족합니다.' });
      }
    }

    const finalAmount = Math.max(0, (subtotal || 0) - (discountAmount || 0) - usedPoints);
    const pointsEarned = Math.floor(finalAmount * POINT_EARN_RATE);

    // ── 주문 생성 ──────────────────────────────
    const order = await Order.create({
      userId: req.user.id,
      items,
      subtotal:       subtotal       || 0,
      discountAmount: discountAmount || 0,
      pointsUsed:     usedPoints,
      finalAmount,
      pointsEarned,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'confirmed',
      contactName:  contactName  || user.name,
      contactPhone: contactPhone || user.phoneNumber || '',
      contactEmail: contactEmail || user.email,
    });

    // ── 포인트 차감 ───────────────────────────
    if (usedPoints > 0) {
      user.points -= usedPoints;
      await PointTransaction.create({
        userId: req.user.id,
        amount: -usedPoints,
        description: `주문 ${order.orderNo} 포인트 사용`,
        type: 'SPEND',
      });
    }

    // ── 포인트 적립 ───────────────────────────
    if (pointsEarned > 0) {
      user.points += pointsEarned;
      await PointTransaction.create({
        userId: req.user.id,
        amount: pointsEarned,
        description: `주문 ${order.orderNo} 구매 적립`,
        type: 'EARN',
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      order,
      currentPoints: user.points,
    });
  } catch (error) {
    console.error('[orderController] createOrder 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// GET /api/orders
// ────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// GET /api/orders/:id
// ────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// DELETE /api/orders/:id  (주문 취소)
// ────────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: '이미 취소된 주문입니다.' });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    // 포인트 환불
    const user = await User.findById(req.user.id);
    if (order.pointsUsed > 0) {
      user.points += order.pointsUsed;
      await PointTransaction.create({
        userId: req.user.id,
        amount: order.pointsUsed,
        description: `주문 ${order.orderNo} 취소 환불`,
        type: 'EARN',
      });
    }
    if (order.pointsEarned > 0) {
      user.points = Math.max(0, user.points - order.pointsEarned);
      await PointTransaction.create({
        userId: req.user.id,
        amount: -order.pointsEarned,
        description: `주문 ${order.orderNo} 취소 적립 회수`,
        type: 'SPEND',
      });
    }
    await user.save();

    res.json({ success: true, message: '주문이 취소되었습니다.', currentPoints: user.points });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
