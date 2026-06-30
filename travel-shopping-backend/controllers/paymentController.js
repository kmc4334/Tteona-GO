const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// 토스페이먼츠 테스트 시크릿 키
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

// 결제 금액 → 포인트 환산 테이블 (1원 = 1포인트, 추가 보너스 포함)
const getPointsForAmount = (amount) => {
  let points = amount; // 기본 1원 = 1포인트
  if (amount >= 50000) points = Math.floor(amount * 1.1); // 5만원 이상 10% 보너스
  if (amount >= 100000) points = Math.floor(amount * 1.2); // 10만원 이상 20% 보너스
  return points;
};

// @desc    토스페이먼츠 successUrl 리다이렉트 처리 (인증 없이 호출됨)
// @route   GET /api/payments/toss-success
// @access  Public (토스 서버에서 redirect)
exports.tossSuccess = async (req, res) => {
  const { paymentKey, orderId, amount, token } = req.query;
  if (!paymentKey || !orderId || !amount) {
    return res.send(buildResultHtml('FAIL', null, '잘못된 결제 요청입니다.'));
  }

  try {
    const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
    });

    const tossData = await tossResponse.json();
    if (!tossResponse.ok) {
      return res.send(buildResultHtml('FAIL', null, tossData.message || '결제 승인 실패'));
    }

    // JWT 토큰으로 유저 찾기 (쿼리에서 전달됨)
    let userId = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (_) {}
    }

    let pointsEarned = getPointsForAmount(parseInt(amount));
    let totalPoints = parseInt(amount); // fallback

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.points += pointsEarned;
        await user.save();
        totalPoints = user.points;
        await PointTransaction.create({
          userId,
          amount: pointsEarned,
          description: `포인트 충전 (${parseInt(amount).toLocaleString()}원 결제)`,
          type: 'EARN',
        });
      }
    }

    res.send(buildResultHtml('SUCCESS', { paymentKey, amount: parseInt(amount), pointsEarned, totalPoints }, null));
  } catch (error) {
    console.error('tossSuccess 오류:', error);
    res.send(buildResultHtml('FAIL', null, '서버 오류가 발생했습니다.'));
  }
};

// @desc    토스페이먼츠 failUrl 리다이렉트 처리
// @route   GET /api/payments/toss-fail
// @access  Public
exports.tossFail = (req, res) => {
  const { message, code } = req.query;
  res.send(buildResultHtml('FAIL', null, message || '결제가 취소되었습니다.'));
};

// 결과를 부모(iframe/WebView)에 postMessage로 전달하는 HTML
function buildResultHtml(type, data, errorMessage) {
  const payload = type === 'SUCCESS'
    ? JSON.stringify({ type: 'SUCCESS', ...data })
    : JSON.stringify({ type: errorMessage === '결제가 취소되었습니다.' ? 'CANCEL' : 'FAIL', message: errorMessage });

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
  <script>
    const payload = ${JSON.stringify(payload)};
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(payload);
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, '*');
    } else {
      window.opener && window.opener.postMessage(payload, '*');
    }
  </script>
  <p style="font-family:sans-serif;text-align:center;padding:40px;color:#666">
    ${type === 'SUCCESS' ? '결제 처리 중...' : '결제가 완료되었습니다.'}
  </p>
  </body></html>`;
}

// @desc    토스페이먼츠 결제 승인 (API 직접 호출용 - 모바일)
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  const { paymentKey, orderId, amount, product, bookingInfo } = req.body;

  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ success: false, message: '결제 정보가 올바르지 않습니다.' });
  }

  try {
    const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      return res.status(400).json({
        success: false,
        message: tossData.message || '결제 승인에 실패했습니다.',
        code: tossData.code,
      });
    }

    // 결제 1원 = 1포인트 적립
    const pointsToEarn = getPointsForAmount(amount);
    const user = await User.findById(req.user.id);
    user.points += pointsToEarn;
    await user.save();

    await PointTransaction.create({
      userId: req.user.id,
      amount: pointsToEarn,
      description: `결제 적립 - ${tossData.orderName || orderId}`,
      type: 'EARN',
    });

    res.status(200).json({
      success: true,
      message: '결제가 완료되었습니다.',
      pointsEarned: pointsToEarn,
      totalPoints: user.points,
      payment: {
        orderId: tossData.orderId,
        orderName: tossData.orderName,
        amount: tossData.totalAmount,
        method: tossData.method,
        approvedAt: tossData.approvedAt,
      },
    });
  } catch (error) {
    console.error('결제 처리 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// @desc    결제 내역 조회
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const transactions = await PointTransaction.find({
      userId: req.user.id,
      type: 'EARN',
      description: { $regex: '포인트 충전' },
    }).sort({ date: -1 }).limit(20);

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
