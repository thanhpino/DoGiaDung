// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.get('/api/notifications', verifyToken, getNotifications);
router.get('/api/notifications/unread-count', verifyToken, getUnreadCount);
router.put('/api/notifications/read-all', verifyToken, markAllAsRead);
router.put('/api/notifications/:id/read', verifyToken, markAsRead);

module.exports = router;
