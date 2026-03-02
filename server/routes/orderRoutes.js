// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validators');
const {
    getAllOrders, getLatestOrders, getOrdersByUserId,
    getOrderItems, getOrderById, createOrder, updateOrderStatus
} = require('../controllers/orderController');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy tất cả đơn hàng (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/api/orders', verifyToken, verifyAdmin, getAllOrders);

/**
 * @swagger
 * /api/orders/latest:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy 5 đơn hàng mới nhất (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 5 đơn hàng mới nhất
 */
router.get('/api/orders/latest', verifyToken, verifyAdmin, getLatestOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Cập nhật trạng thái đơn hàng (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Chờ xác nhận, Đang giao, Đã giao, Đã hủy]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.put('/api/orders/:id', verifyToken, verifyAdmin, updateOrderStatus);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy đơn hàng theo User ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của user
 */
router.get('/api/orders/user/:userId', verifyToken, getOrdersByUserId);

/**
 * @swagger
 * /api/orders/{id}/items:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy chi tiết sản phẩm trong đơn hàng
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
 *         description: Danh sách sản phẩm trong đơn
 */
router.get('/api/orders/:id/items', verifyToken, getOrderItems);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy đơn hàng theo ID
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
 *         description: Thông tin đơn hàng
 */
router.get('/api/orders/:id', verifyToken, getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, customer_name, customer_phone, items]
 *             properties:
 *               user_id:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *               customer_address:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               note:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Đặt hàng thành công
 */
router.post('/api/orders', verifyToken, validateOrder, createOrder);

module.exports = router;