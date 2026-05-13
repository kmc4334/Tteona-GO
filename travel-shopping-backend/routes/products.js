const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// (1) 개발용 seed (상세 조회보다 먼저 있어야 함)
router.post('/seed', productController.seedProducts);

// (2) 상품 리스트  GET /api/products?category=숙소&search=제주&limit=30
router.get('/', productController.getProducts);

// (3) 상품 상세  GET /api/products/:id
router.get('/:id', productController.getProductById);

// (4) 가격 조회  GET /api/products/:id/price
router.get('/:id/price', productController.getProductPrice);

// (5) 추천 상품  POST /api/recommend
router.post('/',          protect, productController.getRecommendations);
router.post('/recommend', protect, productController.getRecommendations);

module.exports = router;


