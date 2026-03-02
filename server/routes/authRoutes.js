// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validators');

/**
 * @swagger
 * /signup:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@email.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Validation error hoặc email đã tồn tại
 */
router.post('/signup', validateSignup, signup);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Quên mật khẩu — gửi email reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email reset đã được gửi
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Đặt lại mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post('/reset-password', resetPassword);

module.exports = router;