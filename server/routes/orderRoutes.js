// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validators');
const {
    getAllOrders,
    getLatestOrders,
    getOrdersByUserId,
    getOrderItems,
    getOrderById,
    createOrder,
    updateOrderStatus
} = require('../controllers/orderController');

// Admin only: Xem tất cả đơn hàng + Cập nhật trạng thái
router.get('/api/orders', verifyToken, verifyAdmin, getAllOrders);
router.get('/api/orders/latest', verifyToken, verifyAdmin, getLatestOrders);
router.put('/api/orders/:id', verifyToken, verifyAdmin, updateOrderStatus);

// User: Xem đơn hàng của mình + Tạo đơn (có validation)
router.get('/api/orders/user/:userId', verifyToken, getOrdersByUserId);
router.get('/api/orders/:id/items', verifyToken, getOrderItems);
router.get('/api/orders/:id', verifyToken, getOrderById);
router.post('/api/orders', verifyToken, validateOrder, createOrder);

module.exports = router;