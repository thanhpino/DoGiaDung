// routes/chatbotRoutes.js
// Hybrid: Proxy sang microservice (Docker) HOẶC chạy local (Render)
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// Trong test hoặc khi không có CHATBOT_URL → chạy in-process
const CHATBOT_URL = process.env.NODE_ENV === 'test' ? null : process.env.CHATBOT_SERVICE_URL;

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

if (CHATBOT_URL) {
    // === MODE 1: MICROSERVICE (Docker) ===
    logger.info(`🤖 ChatBot mode: PROXY → ${CHATBOT_URL}`);

    router.post('/api/chat', async (req, res) => {
        try {
            const response = await fetch(`${CHATBOT_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });
            const data = await response.json();
            res.json(data);
        } catch (err) {
            logger.error(`ChatBot proxy error: ${err.message}`);
            res.json({ reply: "Dạ HomeBot đang bảo trì, vui lòng thử lại sau ạ! 🙏", fallback: true });
        }
    });

} else {
    // === MODE 2: IN-PROCESS (Render / Single Server) ===
    logger.info('🤖 ChatBot mode: IN-PROCESS (Gemini AI)');

    // Import chatbot logic trực tiếp
    let chatHandler = null;

    try {
        // Thử load từ chatbot-service (nếu có)
        chatHandler = require('../../chatbot-service/controllers/chatController');
        logger.info('✅ Loaded chatbot controller from chatbot-service/');
    } catch (e) {
        // Fallback: dùng rule-based nếu không tìm thấy chatbot-service
        logger.warn('⚠️ chatbot-service not found, using built-in fallback');
    }

    router.post('/api/chat', async (req, res) => {
        if (chatHandler) {
            return chatHandler.handleChat(req, res);
        }
        // Ultimate fallback
        res.json({ reply: "Dạ HomeBot đang bảo trì, vui lòng thử lại sau ạ! 🙏" });
    });
}

module.exports = router;