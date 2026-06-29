const express = require('express');
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/',     getMyOrders);
router.post('/',    createOrder);
router.get('/:id',  getOrderById);
router.delete('/:id', cancelOrder);

module.exports = router;
