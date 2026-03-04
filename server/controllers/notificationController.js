// controllers/notificationController.js
const db = require('../config/database');
const logger = require('../config/logger');

// Lấy notifications của user (phân trang)
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const [data] = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [userId, limit, offset]
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thông báo" });
    }
};

// Đếm chưa đọc
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const [[result]] = await db.query(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
            [userId]
        );
        return res.json({ count: result.count });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi" });
    }
};

// Đánh dấu đã đọc 1
const markAsRead = async (req, res) => {
    try {
        await db.query(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );
        return res.json({ status: "Success" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi" });
    }
};

// Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
    try {
        await db.query(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
            [req.user.id]
        );
        return res.json({ status: "Success" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi" });
    }
};

/**
 * Helper: Tạo notification + emit socket
 * Gọi từ orderController khi tạo/cập nhật đơn
 */
const createNotification = async (io, { userId, type, title, message, relatedId }) => {
    try {
        const [result] = await db.query(
            "INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)",
            [userId, type, title, message, relatedId || null]
        );

        const notification = {
            id: result.insertId,
            user_id: userId,
            type, title, message,
            related_id: relatedId,
            is_read: 0,
            created_at: new Date()
        };

        // Emit socket tới user cụ thể
        if (io) {
            io.emit('NEW_NOTIFICATION', notification);
        }

        return notification;
    } catch (err) {
        logger.error(`Create notification error: ${err.message}`);
    }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification };
