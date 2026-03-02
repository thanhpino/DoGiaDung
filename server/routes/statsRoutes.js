// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const {
    getGeneralStats,
    getWeeklyStats,
    getCategoryStats
} = require('../controllers/statsController');

// Admin only: Xem thống kê
router.get('/api/stats', verifyToken, verifyAdmin, getGeneralStats);
router.get('/api/stats/weekly', verifyToken, verifyAdmin, getWeeklyStats);
router.get('/api/stats/categories', verifyToken, verifyAdmin, getCategoryStats);

module.exports = router;