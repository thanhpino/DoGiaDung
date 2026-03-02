// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyToken } = require('../middleware/authMiddleware');
const { createReview, getReviewsByProduct } = require('../controllers/reviewController');

// User: Viết đánh giá (cần đăng nhập)
router.post('/api/reviews', verifyToken, upload.single('image'), createReview);

// Public: Xem đánh giá
router.get('/api/reviews/:productId', getReviewsByProduct);

module.exports = router;