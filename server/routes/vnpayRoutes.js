// routes/vnpayRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createPaymentUrl } = require('../controllers/vnpayController');

/**
 * @swagger
 * /api/create_payment_url:
 *   post:
 *     tags: [VNPay]
 *     summary: Tạo link thanh toán VNPay
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Số tiền thanh toán (VNĐ)
 *               bankCode:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: URL thanh toán VNPay
 */
router.post('/api/create_payment_url', verifyToken, createPaymentUrl);

module.exports = router;