// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateChangePassword } = require('../middleware/validators');
const {
    getAllUsers,
    getUserById,
    updateUser,
    changePassword
} = require('../controllers/userController');

// Admin only: Xem tất cả users
router.get('/api/users', verifyToken, verifyAdmin, getAllUsers);

// User: Xem/Sửa thông tin cá nhân
router.get('/api/users/:id', verifyToken, getUserById);
router.put('/api/users/:id', verifyToken, updateUser);
router.put('/api/users/:id/password', verifyToken, validateChangePassword, changePassword);

module.exports = router;