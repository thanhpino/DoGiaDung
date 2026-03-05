// routes/chatbotRoutes.js
// Hybrid: Proxy sang microservice (Docker) HOẶC chạy local (Render)
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// Trong test hoặc khi không có CHATBOT_URL → chạy in-process
const CHATBOT_URL = process.env.NODE_ENV === 'test' ? null : process.env.CHATBOT_SERVICE_URL;

// Import chatbot logic trực tiếp làm Fallback an toàn tuyệt đối
let chatHandler = null;
try {
    // Thử load từ chatbot-service (nếu có)
    chatHandler = require('../../chatbot-service/controllers/chatController');
    logger.info('✅ Loaded chatbot controller from chatbot-service/ for auto-fallback');
} catch (e) {
    logger.warn('⚠️ chatbot-service not found locally, relying solely on proxy');
}

/**
 * @swagger
 * /api/chat:
 *   post:
 *     tags: [Chatbot]
 *     summary: Gửi tin nhắn cho AI Chatbot (Gemini)
 *     description: "Chatbot AI sử dụng Gemini 1.5-Flash, phân tích ý định và truy vấn sản phẩm từ DB"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Cho mình xem nồi chiên không dầu"
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ AI chatbot
 */

router.post('/api/chat', async (req, res) => {
    // Nếu có cấu hình microservice URL thì ưu tiên gọi qua đó
    if (CHATBOT_URL) {
        try {
            const response = await fetch(`${CHATBOT_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });
            const data = await response.json();
            return res.json(data);
        } catch (err) {
            logger.error(`ChatBot proxy fetch to ${CHATBOT_URL} failed: ${err.message}. Tự động kích hoạt Fallback local!`);
            // Nếu gọi microservice lỗi (vd: nhập nhầm port, chưa chạy), tự động fallback
        }
    }

    // Nếu không có CHATBOT_URL, hoặc gọi Proxy bị lỗi -> Chạy In-process trực tiếp
    if (chatHandler) {
        logger.info('🤖 Fallback: Xử lý ChatBot In-Process (Gemini)');
        return chatHandler.handleChat(req, res);
    }

    // Ultimate fallback nếu cả proxy và in-process đều chết
    return res.json({ reply: "Dạ HomeBot đang bảo trì hoặc mất kết nối mạng lưới thông minh, vui lòng thử lại sau ạ! 🙏" });
});

module.exports = router;