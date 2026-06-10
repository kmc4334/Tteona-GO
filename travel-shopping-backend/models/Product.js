const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  category:       { type: String, required: true }, // 숙소 | 관광지 | 체험 | 교통수단 | 기타
  location:       { type: String, default: '' },
  image:          { type: String, default: '' },
  rating:         { type: Number, default: 0 },
  price:          { type: Number, required: true },
  originalPrice:  { type: Number },
  discount:       { type: String, default: null },
  externalUrl:    { type: String, default: '' },
  seatsAvailable: { type: Number, default: 0 },
  description:    { type: String, default: '' },
  latitude:       { type: Number, default: null },
  longitude:      { type: Number, default: null },
  tags:           [{ type: String }],
  createdAt:      { type: Date, default: Date.now },
});

// 상품 전용 DB 커넥션 (server.js에서 global.productConn 으로 설정됨)
// 서버 시작 시 global.productConn 이 주입되므로 모듈 로드 시점에 바인딩
function getModel() {
  const conn = global.productConn || mongoose.connection;
  if (conn.models['Product']) return conn.models['Product'];
  return conn.model('Product', productSchema);
}

module.exports = { getModel, productSchema };

