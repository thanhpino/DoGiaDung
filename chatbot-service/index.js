// chatbot-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const { handleChat } = require('./controllers/chatController');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({
        service: 'ChatBot Service',
        status: 'OK',
        model: 'Gemini 2.0 Flash',
        timestamp: new Date().toISOString()
    });
});

// Chat endpoint
app.post('/api/chat', handleChat);

// Start server
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
    logger.info(`🤖 ChatBot Service đang chạy tại http://localhost:${PORT}`);
    logger.info(`🧠 AI Model: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
});

module.exports = app;
