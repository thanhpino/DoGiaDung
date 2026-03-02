// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyToken } = require('../middleware/authMiddleware');
const { createReview, getReviewsByProduct } = require('../controllers/reviewController');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Viết đánh giá sản phẩm (cần đăng nhập)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Đánh giá thành công
 */
router.post('/api/reviews', verifyToken, upload.single('image'), createReview);

/**
 * @swagger
 * /api/reviews/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Xem đánh giá theo sản phẩm
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 */
router.get('/api/reviews/:productId', getReviewsByProduct);

module.exports = router;