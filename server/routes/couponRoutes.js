// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');

// Customer: validate mã
router.post('/api/coupons/validate', verifyToken, validateCoupon);

// Admin CRUD
router.get('/api/coupons', verifyToken, verifyAdmin, getCoupons);
router.post('/api/coupons', verifyToken, verifyAdmin, createCoupon);
router.put('/api/coupons/:id', verifyToken, verifyAdmin, updateCoupon);
router.delete('/api/coupons/:id', verifyToken, verifyAdmin, deleteCoupon);

module.exports = router;
