const express = require('express');
const { getProducts, getProductById, seedProducts } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/seed', seedProducts);

module.exports = router;
