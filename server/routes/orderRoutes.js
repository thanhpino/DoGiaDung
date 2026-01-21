// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getLatestOrders,
    getOrdersByUserId,
    getOrderItems,
    getOrderById,
    createOrder,
    updateOrderStatus
} = require('../controllers/orderController');

router.get('/api/orders', getAllOrders);
router.get('/api/orders/latest', getLatestOrders);
router.get('/api/orders/user/:userId', getOrdersByUserId);
router.get('/api/orders/:id/items', getOrderItems);
router.get('/api/orders/:id', getOrderById);
router.post('/api/orders', createOrder);
router.put('/api/orders/:id', updateOrderStatus);

module.exports = router;