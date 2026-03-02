// routes/vnpayRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createPaymentUrl } = require('../controllers/vnpayController');

// User: Tạo link thanh toán (cần đăng nhập)
router.post('/api/create_payment_url', verifyToken, createPaymentUrl);

module.exports = router;