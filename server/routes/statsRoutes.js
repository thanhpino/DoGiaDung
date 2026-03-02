// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getGeneralStats, getWeeklyStats, getCategoryStats } = require('../controllers/statsController');

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: Thống kê tổng quan (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doanh thu, số đơn, số user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenue:
 *                   type: number
 *                 orders:
 *                   type: integer
 *                 users:
 *                   type: integer
 */
router.get('/api/stats', verifyToken, verifyAdmin, getGeneralStats);

/**
 * @swagger
 * /api/stats/weekly:
 *   get:
 *     tags: [Stats]
 *     summary: Doanh thu 7 ngày gần nhất (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doanh thu theo ngày
 */
router.get('/api/stats/weekly', verifyToken, verifyAdmin, getWeeklyStats);

/**
 * @swagger
 * /api/stats/categories:
 *   get:
 *     tags: [Stats]
 *     summary: Thống kê theo danh mục (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Phần trăm bán hàng theo danh mục
 */
router.get('/api/stats/categories', verifyToken, verifyAdmin, getCategoryStats);

module.exports = router;