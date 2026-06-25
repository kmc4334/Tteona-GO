const { getModel } = require('../models/Product');
const { QdrantClient } = require('@qdrant/js-client-rest');

// ── Qdrant 임포트 상태 추적 ──────────────────────────────────────────────────
let importStatus = { running: false, inserted: 0, skipped: 0, done: false, error: null, startedAt: null };

// ── 좌표 변환 EPSG5174 → WGS84 ───────────────────────────────────────────────
function epsg5174ToWgs84(x, y) {
  const lat0 = 38.0, lng0 = 127.0, falseE = 200000, falseN = 500000;
  const a = 6378137.0, f = 1 / 298.257223563, b = a * (1 - f);
  const e2 = 1 - (b * b) / (a * a);
  const X = x - falseE, Y = y - falseN;
  const phi1 = Y / a + lat0 * Math.PI / 180;
  const N = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const T = Math.tan(phi1) ** 2;
  const C = (e2 / (1 - e2)) * Math.cos(phi1) ** 2;
  const D = X / N;
  const lat = phi1 - (N * Math.tan(phi1) / (a ** 2) * (1 - e2))
    * (D ** 2 / 2 - (5 + 3*T + 10*C - 4*C**2 - 9*(e2/(1-e2))) * D**4 / 24);
  const lng = lng0 * Math.PI / 180 + (D - (1 + 2*T + C) * D**3 / 6) / Math.cos(phi1);
  return { lat: lat * 180 / Math.PI, lng: lng * 180 / Math.PI };
}

function qdrantPayloadToDoc(pl) {
  const name = (pl['사업장명'] || '').trim();
  if (!name) return null;
  // 폐업만 제외, 휴업은 포함
  const status = pl['영업상태명'] || '';
  if (status === '폐업') return null;

  let lat = null, lng = null;
  const rawX = parseFloat(pl['좌표정보x(epsg5174)'] || 0);
  const rawY = parseFloat(pl['좌표정보y(epsg5174)'] || 0);
  if (rawX > 0 && rawY > 0) {
    try {
      const w = epsg5174ToWgs84(rawX, rawY);
      if (w.lat >= 33 && w.lat <= 38.5 && w.lng >= 124 && w.lng <= 130) {
        lat = Math.round(w.lat * 100000) / 100000;
        lng = Math.round(w.lng * 100000) / 100000;
      }
    } catch (_) {}
  }

  const d = (pl['관광숙박업상세명'] || '').toLowerCase();
  let base = 80000;
  if (d.includes('특1급'))       base = 350000;
  else if (d.includes('특2급'))  base = 280000;
  else if (d.includes('리조트')) base = 220000;
  else if (d.includes('관광호텔')) base = 180000;
  else if (d.includes('호텔'))   base = 150000;
  else if (d.includes('펜션'))   base = 120000;
  else if (d.includes('민박'))   base = 60000;
  else if (d.includes('캠핑'))   base = 45000;
  const rooms = parseFloat(pl['객실수'] || 0);
  if (rooms >= 200) base = Math.round(base * 1.3);
  const price = Math.round(base * (0.8 + Math.random() * 0.4) / 1000) * 1000;

  const imgMap = {
    '관광호텔': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    '리조트':  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    '펜션':   'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
    '민박':   'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    '캠핑':   'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  };
  const detail = pl['관광숙박업상세명'] || '';
  let image = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
  for (const [k, v] of Object.entries(imgMap)) if (detail.includes(k)) { image = v; break; }

  let rating = 3.7 + Math.random() * 0.6;
  if (d.includes('특1급')) rating = 4.7 + Math.random() * 0.3;
  else if (d.includes('리조트') || d.includes('특2급')) rating = 4.4 + Math.random() * 0.4;
  else if (d.includes('관광호텔')) rating = 4.1 + Math.random() * 0.4;

  const tags = [];
  if (detail) tags.push(detail.replace(/업$/, ''));
  const env = (pl['주변환경명'] || '').replace(/주변$/, '');
  if (env && env !== '0') tags.push(env);
  const addr = pl['도로명전체주소'] || pl['소재지전체주소'] || '';
  const parts = addr.split(' ');
  if (parts[0]) tags.push(parts[0]);
  if (parts[1]) tags.push(parts[1]);
  if (rooms >= 100) tags.push('대형');
  else if (rooms >= 30) tags.push('중형');
  else if (rooms > 0) tags.push('소형');

  return {
    title:         name,
    category:      d.includes('캠핑') || d.includes('글램핑') ? '체험' : '숙소',
    location:      addr,
    image,
    rating:        +rating.toFixed(1),
    price,
    description:   (pl['_text'] || `${name} - ${detail || '관광숙박시설'}`).substring(0, 200),
    latitude:      lat,
    longitude:     lng,
    tags:          [...new Set(tags.filter(Boolean))].slice(0, 8),
    externalUrl:   '',
    seatsAvailable: parseInt(pl['객실수'] || 0) || 0,
  };
}

// 백그라운드 임포트 실행 함수
async function runImport(Product) {
  const TOTAL = 88589, TARGET = 1000, BATCH = 100, ROUNDS = 40;
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  const collection = process.env.QDRANT_COLLECTION || 'labeling';
  const docs = [], seen = new Set();

  for (let r = 0; r < ROUNDS && docs.length < TARGET; r++) {
    const offset = Math.floor(Math.random() * (TOTAL - BATCH));
    try {
      const res = await qdrant.scroll(collection, {
        limit: BATCH, offset, with_payload: true, with_vector: false,
      });
      for (const pt of (res.points || [])) {
        if (seen.has(pt.id)) continue;
        seen.add(pt.id);
        const doc = qdrantPayloadToDoc(pt.payload || {});
        if (doc) docs.push(doc);
        else importStatus.skipped++;
      }
      importStatus.inserted = docs.length;
      console.log(`[import] 라운드 ${r+1}/${ROUNDS} | 수집: ${docs.length}건`);
    } catch (e) {
      console.error(`[import] 라운드 ${r+1} 오류:`, e.message);
    }
    // 레이턴시 완화를 위한 짧은 대기
    await new Promise(r => setTimeout(r, 200));
  }

  const final = docs.slice(0, TARGET);
  if (final.length > 0) {
    await Product.insertMany(final, { ordered: false });
  }
  importStatus.inserted = final.length;
  importStatus.done = true;
  importStatus.running = false;
  console.log(`[import] ✅ 완료: ${final.length}건 삽입`);
}


// 공통 헬퍼: 응답용 상품 포맷
function formatProduct(p) {
  return {
    id:             p._id,
    title:          p.title,
    category:       p.category,
    location:       p.location,
    price:          p.price,
    originalPrice:  p.originalPrice || null,
    discount:       p.discount || null,
    image:          p.image,
    rating:         p.rating || 0,
    externalUrl:    p.externalUrl || '',
    seatsAvailable: p.seatsAvailable || 0,
    description:    p.description || '',
    latitude:       p.latitude || null,
    longitude:      p.longitude || null,
    tags:           p.tags || [],
  };
}

// 기본 폴백 데이터 (DB가 비어있을 때 사용 - 10개로 확장)
const FALLBACK_PRODUCTS = [
  {
    _id: 'fallback_1',
    category: '체험',
    title: '제주도 해녀 체험',
    location: '제주 서귀포시',
    rating: 4.7,
    price: 55800,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800',
    latitude: 33.3039,
    longitude: 126.9194,
    description: '유네스코 인류무형문화유산인 제주 해녀와 함께 직접 바다에 들어가 해산물을 채취해 보세요.'
  },
  {
    _id: 'fallback_2',
    category: '교통수단',
    title: '제주 렌터카 48시간 이용권',
    location: '제주 전역',
    rating: 4.5,
    price: 89000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    latitude: 33.5113,
    longitude: 126.4930,
    description: '제주 여행의 필수품! 최신형 차량 렌트 서비스.'
  },
  {
    _id: 'fallback_3',
    category: '숙소',
    title: '그랜드 하얏트 제주',
    location: '제주 제주시',
    rating: 4.8,
    price: 350000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    latitude: 33.4849,
    longitude: 126.4818,
    description: '제주 도심의 랜드마크에서 즐기는 럭셔리한 휴식.'
  },
  {
    _id: 'fallback_4',
    category: '체험',
    title: '한라산 영실코스 가이드 투어',
    location: '제주 서귀포시',
    rating: 4.6,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800',
    latitude: 33.3617,
    longitude: 126.5292,
    description: '전문 가이드와 함께하는 한라산의 비경 감상.'
  },
  {
    _id: 'fallback_5',
    category: '관광지',
    title: '제주 우도 드라이빙 투어',
    location: '제주 우도',
    rating: 4.9,
    price: 35000,
    image: 'https://images.unsplash.com/photo-1505305976870-c0be1cd39939?auto=format&fit=crop&q=80&w=800',
    latitude: 33.5123,
    longitude: 126.9536,
    description: '섬 속의 섬 우도에서 즐기는 낭만적인 드라이브.'
  },
  {
    _id: 'fallback_6',
    category: '숙소',
    title: '서울 시그니엘 호텔',
    location: '서울 송파구',
    rating: 4.9,
    price: 650000,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    latitude: 37.5126,
    longitude: 127.1025,
    description: '롯데월드타워에서 즐기는 대한민국 최고의 전망.'
  },
  {
    _id: 'fallback_7',
    category: '체험',
    title: '경복궁 한복 대여 및 촬영',
    location: '서울 종로구',
    rating: 4.7,
    price: 25000,
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=800',
    latitude: 37.5796,
    longitude: 126.9770,
    description: '아름다운 한복을 입고 고궁에서 추억을 만드세요.'
  },
  {
    _id: 'fallback_8',
    category: '관광지',
    title: '부산 해운대 블루라인파크',
    location: '부산 해운대구',
    rating: 4.8,
    price: 15000,
    image: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&q=80&w=800',
    latitude: 35.1587,
    longitude: 129.1604,
    description: '해운대 해변 열차를 타고 즐기는 환상적인 바다 뷰.'
  },
  {
    _id: 'fallback_9',
    category: '교통수단',
    title: 'KTX 서울-부산 왕복권',
    location: '전국',
    rating: 4.5,
    price: 99800,
    image: 'https://images.unsplash.com/photo-1474487056217-76fe0300bc80?auto=format&fit=crop&q=80&w=800',
    latitude: 37.5546,
    longitude: 126.9706,
    description: '빠르고 편안한 대한민국 전국 철도 여행.'
  },
  {
    _id: 'fallback_10',
    category: '숙소',
    title: '강릉 파크로쉬 리조트',
    location: '강원 정선군',
    rating: 4.8,
    price: 280000,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    latitude: 37.4589,
    longitude: 128.6123,
    description: '자연 속에서 즐기는 완벽한 힐링과 명상.'
  }
];

// ── GET /api/products ────────────────────────────────────────────────────────
// 쿼리 파라미터: category, search, limit(기본 50)
exports.getProducts = async (req, res) => {
  try {
    const Product = getModel();
    const { category, search, limit = 50 } = req.query;

    const filter = {};
    if (category && category !== '전체') filter.category = category;
    if (search) filter.$or = [
      { title:    { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { tags:     { $regex: search, $options: 'i' } },
    ];

    let docs = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // DB가 비어있으면 기본 데이터 사용
    let isFallback = false;
    if (docs.length === 0 && (!category || category === '전체') && !search) {
      docs = FALLBACK_PRODUCTS;
      isFallback = true;
    }

    return res.json({
      success: true,
      products: docs.map(formatProduct),
      total: docs.length,
      source: isFallback ? 'fallback_data' : 'product_db',
      warning: isFallback ? 'DB가 비어있어 기본 데이터를 표시합니다.' : null
    });
  } catch (err) {
    console.error('[ProductController] getProducts error:', err.message);
    return res.status(500).json({ success: false, message: '상품 목록을 불러올 수 없습니다.' });
  }
};

// ── GET /api/products/:id ────────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const Product = getModel();
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
    return res.json({ success: true, product: formatProduct(doc), source: 'product_db' });
  } catch (err) {
    console.error('[ProductController] getProductById error:', err.message);
    return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
};

// ── GET /api/products/:id/price ──────────────────────────────────────────────
exports.getProductPrice = async (req, res) => {
  try {
    const Product = getModel();
    const doc = await Product.findById(req.params.id).select('price originalPrice');
    if (!doc) return res.status(404).json({ success: false, message: '가격 정보를 찾을 수 없습니다.' });
    return res.json({ success: true, price: doc.price, originalPrice: doc.originalPrice, source: 'product_db' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '가격 조회 중 오류가 발생했습니다.' });
  }
};

// ── POST /api/recommend ──────────────────────────────────────────────────────
// 카테고리/예산/태그 기반 기본 추천
exports.getRecommendations = async (req, res) => {
  try {
    const Product = getModel();
    const { category, budget, tags } = req.body;
    const filter = {};
    if (category) filter.category = category;
    if (budget)   filter.price = { $lte: Number(budget) };
    if (tags && tags.length) filter.tags = { $in: tags };

    const docs = await Product.find(filter).sort({ rating: -1 }).limit(10);
    return res.json({ success: true, recommendations: docs.map(formatProduct), source: 'product_db' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '추천 상품을 불러올 수 없습니다.' });
  }
};

// ── POST /api/products/seed ──────────────────────────────────────────────────
// 개발용: 상품 데이터 일괄 삽입 (JSON 배열)
exports.seedProducts = async (req, res) => {
  try {
    const Product = getModel();
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'body는 상품 배열이어야 합니다.' });
    }
    const inserted = await Product.insertMany(items, { ordered: false });
    return res.json({ success: true, inserted: inserted.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: '시드 데이터 삽입 실패: ' + err.message });
  }
};

// ── POST /api/products/import-from-qdrant ────────────────────────────────────
// Qdrant → MongoDB 백그라운드 임포트
exports.importFromQdrant = async (req, res) => {
  if (importStatus.running) {
    return res.json({ success: false, message: '이미 임포트 진행 중입니다.', status: importStatus });
  }
  const Product = getModel();

  // 기존 데이터 삭제 후 백그라운드 실행
  try {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`[import] 기존 데이터 ${deletedCount}건 삭제`);
  } catch (e) {
    return res.status(500).json({ success: false, message: '기존 데이터 삭제 실패: ' + e.message });
  }

  importStatus = { running: true, inserted: 0, skipped: 0, done: false, error: null, startedAt: new Date() };

  // 백그라운드 실행 (응답은 즉시 반환)
  runImport(Product).catch(err => {
    importStatus.error = err.message;
    importStatus.running = false;
    console.error('[import] 오류:', err.message);
  });

  return res.json({ success: true, message: '임포트 시작됨. /api/products/import-status 로 진행상황 확인', status: importStatus });
};

// ── GET /api/products/import-status ─────────────────────────────────────────
exports.getImportStatus = (req, res) => {
  res.json({ success: true, status: importStatus });
};

