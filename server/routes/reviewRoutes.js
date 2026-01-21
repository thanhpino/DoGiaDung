// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { createReview, getReviewsByProduct } = require('../controllers/reviewController');

router.post('/api/reviews', upload.single('image'), createReview);
router.get('/api/reviews/:productId', getReviewsByProduct);

module.exports = router;