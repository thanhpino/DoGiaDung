// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const {
    getGeneralStats,
    getWeeklyStats,
    getCategoryStats
} = require('../controllers/statsController');

router.get('/api/stats', getGeneralStats);
router.get('/api/stats/weekly', getWeeklyStats);
router.get('/api/stats/categories', getCategoryStats);

module.exports = router;