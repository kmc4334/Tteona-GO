const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/places/search
 * Query params:
 *   - query: 검색어 (예: "제주도 호텔")
 *   - category: 필터 (숙소, 관광지, 맛집, 카페)
 *   - lat, lng: 중심 좌표 (선택)
 *   - radius: 반경 (km, 선택)
 *   - limit: 최대 결과 수 (기본 20)
 */
router.get('/search', placesController.searchPlaces);

/**
 * GET /api/places/nearby
 * Query params:
 *   - lat, lng: 중심 좌표 (필수)
 *   - radius: 반경 (km, 기본 10)
 *   - category: 필터 (선택)
 *   - limit: 최대 결과 수 (기본 20)
 */
router.get('/nearby', placesController.getNearbyPlaces);

/**
 * POST /api/places/recommend
 * Body:
 *   - userId: 사용자 ID (선택)
 *   - preferences: 사용자 선호도 배열 (선택)
 *   - location: { lat, lng } 중심 좌표
 *   - limit: 최대 결과 수
 */
router.post('/recommend', placesController.getRecommendedPlaces);

module.exports = router;
