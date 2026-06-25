/**
 * placesController.js
 * Qdrant 벡터 DB에서 실시간으로 장소 데이터를 조회
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const { embedText } = require('../services/ragService');

// Qdrant 클라이언트 초기화
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const collectionName = process.env.QDRANT_COLLECTION || 'labeling';

// ── 좌표 변환 (EPSG5174 → WGS84) ────────────────────────────────────────────
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

// ── 카테고리 매핑 ───────────────────────────────────────────────────────────
function mapCategory(detail) {
  const d = (detail || '').toLowerCase();
  if (d.includes('캠핑') || d.includes('글램핑') || d.includes('체험')) return '체험';
  if (d.includes('호텔') || d.includes('리조트') || d.includes('펜션') || d.includes('민박')) return '숙소';
  if (d.includes('관광')) return '관광지';
  if (d.includes('음식') || d.includes('식당') || d.includes('맛집')) return '맛집';
  if (d.includes('카페')) return '카페';
  return '기타';
}

// ── Qdrant 포인트를 Place 객체로 변환 ──────────────────────────────────────
function qdrantPointToPlace(point, index) {
  const payload = point.payload || {};
  const name = (payload['사업장명'] || '').trim();
  
  let lat = null, lng = null;
  const rawX = parseFloat(payload['좌표정보x(epsg5174)'] || 0);
  const rawY = parseFloat(payload['좌표정보y(epsg5174)'] || 0);
  
  if (rawX > 0 && rawY > 0) {
    try {
      const w = epsg5174ToWgs84(rawX, rawY);
      if (w.lat >= 33 && w.lat <= 38.5 && w.lng >= 124 && w.lng <= 130) {
        lat = Math.round(w.lat * 100000) / 100000;
        lng = Math.round(w.lng * 100000) / 100000;
      }
    } catch (_) {}
  }

  // 좌표가 없으면 제외
  if (!lat || !lng) return null;

  const detail = payload['관광숙박업상세명'] || '';
  const category = mapCategory(detail);
  const address = payload['도로명전체주소'] || payload['소재지전체주소'] || '';
  const description = (payload['_text'] || `${name} - ${detail}`).substring(0, 150);

  return {
    id: point.id || `place_${index}`,
    name,
    lat,
    lng,
    category,
    address,
    description,
    detail,
    status: payload['영업상태명'] || '',
    rooms: parseInt(payload['객실수'] || 0) || 0,
  };
}

// ── 검색 (텍스트 임베딩 + 벡터 검색) ─────────────────────────────────────────
exports.searchPlaces = async (req, res) => {
  try {
    const { query, category, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: '검색어(query)가 필요합니다.' });
    }

    console.log(`[placesController] 검색: "${query}" | 카테고리: ${category || '전체'}`);

    // 1. 텍스트 임베딩
    const vector = await embedText(query);

    // 2. Qdrant 벡터 검색
    const searchResults = await qdrantClient.search(collectionName, {
      vector,
      limit: parseInt(limit) * 3, // 필터링 전에 여유있게 가져오기
      score_threshold: 0.3,
      with_payload: true,
      with_vector: false,
    });

    // 3. Place 객체로 변환 및 필터링
    let places = searchResults
      .map((point, idx) => qdrantPointToPlace(point, idx))
      .filter(p => p !== null && p.status === '영업' || p.status === '정상');

    // 카테고리 필터
    if (category && category !== '전체') {
      places = places.filter(p => p.category === category);
    }

    // 중복 제거 (이름 기준)
    const seen = new Set();
    places = places.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });

    // limit 적용
    places = places.slice(0, parseInt(limit));

    console.log(`[placesController] 검색 결과: ${places.length}건`);

    res.json({
      success: true,
      count: places.length,
      places,
    });
  } catch (error) {
    console.error('[placesController] searchPlaces 오류:', error);
    res.status(500).json({
      success: false,
      message: '장소 검색 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// ── 주변 장소 조회 (스크롤 방식) ────────────────────────────────────────────
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: '중심 좌표(lat, lng)가 필요합니다.' });
    }

    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    console.log(`[placesController] 주변 검색: (${centerLat}, ${centerLng}) 반경 ${radiusKm}km`);

    // Qdrant scroll로 일부 데이터 가져오기 (랜덤 샘플링)
    const BATCH = 200;
    const offset = Math.floor(Math.random() * 80000); // 전체 88k 중 랜덤
    
    const scrollResult = await qdrantClient.scroll(collectionName, {
      limit: BATCH,
      offset,
      with_payload: true,
      with_vector: false,
    });

    // 거리 계산 (Haversine)
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    let places = (scrollResult.points || [])
      .map((point, idx) => qdrantPointToPlace(point, idx))
      .filter(p => p !== null && (p.status === '영업' || p.status === '정상'));

    // 거리 계산 및 필터
    places = places
      .map(p => ({
        ...p,
        distance: haversine(centerLat, centerLng, p.lat, p.lng),
      }))
      .filter(p => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    // 카테고리 필터
    if (category && category !== '전체') {
      places = places.filter(p => p.category === category);
    }

    // 중복 제거
    const seen = new Set();
    places = places.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });

    places = places.slice(0, parseInt(limit));

    console.log(`[placesController] 주변 검색 결과: ${places.length}건`);

    res.json({
      success: true,
      count: places.length,
      center: { lat: centerLat, lng: centerLng },
      radius: radiusKm,
      places,
    });
  } catch (error) {
    console.error('[placesController] getNearbyPlaces 오류:', error);
    res.status(500).json({
      success: false,
      message: '주변 장소 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// ── AI 추천 (사용자 선호도 기반) ─────────────────────────────────────────────
exports.getRecommendedPlaces = async (req, res) => {
  try {
    const { preferences = [], location, limit = 20 } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ success: false, message: '중심 좌표(location)가 필요합니다.' });
    }

    console.log(`[placesController] AI 추천: 선호도 ${preferences.length}개`);

    // 선호도를 쿼리로 결합
    const query = preferences.length > 0
      ? preferences.join(' ')
      : '추천 여행지 숙소 관광';

    const vector = await embedText(query);

    const searchResults = await qdrantClient.search(collectionName, {
      vector,
      limit: parseInt(limit) * 2,
      score_threshold: 0.35,
      with_payload: true,
      with_vector: false,
    });

    let places = searchResults
      .map((point, idx) => qdrantPointToPlace(point, idx))
      .filter(p => p !== null && (p.status === '영업' || p.status === '정상'));

    // 중복 제거
    const seen = new Set();
    places = places.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });

    places = places.slice(0, parseInt(limit));

    console.log(`[placesController] AI 추천 결과: ${places.length}건`);

    res.json({
      success: true,
      count: places.length,
      preferences,
      places,
    });
  } catch (error) {
    console.error('[placesController] getRecommendedPlaces 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 추천 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
