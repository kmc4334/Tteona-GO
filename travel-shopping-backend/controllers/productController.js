const { getModel } = require('../models/Product');

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
    const items = req.body; // [ { title, category, price, ... }, ... ]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'body는 상품 배열이어야 합니다.' });
    }
    const inserted = await Product.insertMany(items, { ordered: false });
    return res.json({ success: true, inserted: inserted.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: '시드 데이터 삽입 실패: ' + err.message });
  }
};

