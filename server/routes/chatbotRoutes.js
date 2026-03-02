// routes/chatbotRoutes.js — Proxy sang ChatBot Microservice
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// URL của ChatBot microservice
const CHATBOT_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8082';

/**
 * @swagger
 * /api/chat:
 *   post:
 *     tags: [Chatbot]
 *     summary: Gửi tin nhắn cho AI Chatbot (Gemini)
 *     description: "Chatbot AI sử dụng Gemini 2.0 Flash, phân tích ý định và truy vấn sản phẩm từ DB"
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
 *                 description: "Session ID để giữ lịch sử chat"
 *     responses:
 *       200:
 *         description: Phản hồi từ AI chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 intent:
 *                   type: string
 */
router.post('/api/chat', async (req, res) => {
    try {
        // Proxy sang chatbot microservice
        const response = await fetch(`${CHATBOT_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        logger.error(`ChatBot proxy error: ${err.message}`);
        // Fallback nếu chatbot service chết
        res.json({
            reply: "Dạ HomeBot đang bảo trì, anh/chị vui lòng thử lại sau ạ! 🙏",
            fallback: true
        });
    }
});

module.exports = router;