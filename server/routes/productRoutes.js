// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateProduct } = require('../middleware/validators');
const { cacheRoute } = require('../middleware/cacheMiddleware');
const {
    getProducts, getProductById, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Lấy danh sách sản phẩm (phân trang)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: All
 *         description: Lọc theo danh mục
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm + phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/products', cacheRoute(300), getProducts); // Cache 5 phút

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Lấy chi tiết sản phẩm theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/api/products/:id', cacheRoute(600), getProductById); // Cache 10 phút

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Thêm sản phẩm mới (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               img:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không phải Admin
 */
router.post('/api/products', verifyToken, verifyAdmin, validateProduct, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Cập nhật sản phẩm (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               img:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     tags: [Products]
 *     summary: Xóa sản phẩm (Admin only, soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.put('/api/products/:id', verifyToken, verifyAdmin, validateProduct, updateProduct);
router.delete('/api/products/:id', verifyToken, verifyAdmin, deleteProduct);

module.exports = router;