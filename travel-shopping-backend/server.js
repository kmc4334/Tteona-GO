const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ─── Routes ────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const proudctRouter     = require('./routes/products');
const cartRoutes        = require('./routes/cartRoutes');
const activityRoutes    = require('./routes/activityRoutes');
const pointRoutes       = require('./routes/pointRoutes');
const packageRoutes     = require('./routes/packageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes        = require('./routes/chatRoutes');
const { startPriceSimulation } = require('./services/priceSimulator');

const app = express();
app.use(cors());
app.use(express.json());

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/products',      proudctRouter);
app.use('/api/recommend',     proudctRouter);
app.use('/api/cart',          cartRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/points',        pointRoutes);
app.use('/api/packages',      packageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: '그리GO 백엔드 서버 정상 동작 중' })
);

// ─── DB URIs ───────────────────────────────────────────────────────────────
const PORT        = process.env.PORT || 5000;
const USER_URI    = process.env.MONGO_URI;
const PRODUCT_URI = process.env.PRODUCT_MONGO_URI;

if (!USER_URI || !PRODUCT_URI) {
  console.error('❌ MONGO_URI 또는 PRODUCT_MONGO_URI 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

// ─── 이중 MongoDB 연결 ────────────────────────────────────────────────────
// 1) 유저 DB  – 기본 mongoose 커넥션 (User, Cart, Activity, Package 등)
// 2) 상품 DB  – 별도 커넥션  (Product)

const productConn = mongoose.createConnection(PRODUCT_URI);

productConn.on('connected', () =>
  console.log('✅ [상품 DB] MongoDB 연결 성공 (CapStone / products)')
);
productConn.on('error', (err) =>
  console.error('❌ [상품 DB] 연결 오류:', err.message)
);

// 상품 커넥션을 전역으로 내보내어 Product 모델에서 사용
global.productConn = productConn;

mongoose.connect(USER_URI)
  .then(() => {
    console.log('✅ [유저 DB] MongoDB 연결 성공');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 서버 실행 중: http://0.0.0.0:${PORT}`);
      console.log('📋 등록된 API 라우트:');
      console.log('  [유저 DB]  /api/auth, /api/cart, /api/activity, /api/points, /api/packages, /api/notifications, /api/chat');
      console.log('  [상품 DB]  /api/products, /api/recommend');
      // startPriceSimulation(); // 임시 비활성화
    });
  })
  .catch((err) => {
    console.error('❌ [유저 DB] MongoDB 연결 오류:', err);
    process.exit(1);
  });

