// chatbot-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const { handleChat } = require('./controllers/chatController');
const { syncEmbeddings } = require('./scripts/syncEmbeddings');

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
    const vectorStore = require('./services/vectorStore');
    res.json({
        service: 'ChatBot Service',
        status: 'OK',
        model: 'Gemini 2.0 Flash',
        embedding: `${vectorStore.size()} sản phẩm đã embed`,
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
    logger.info(`📐 Embedding Model: ${process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'}`);

    // Sync embeddings (non-blocking, không delay startup)
    syncEmbeddings()
        .then(count => logger.info(`🎯 Embedding sẵn sàng: ${count} sản phẩm`))
        .catch(err => logger.error(`⚠️ Embedding sync fail (chatbot vẫn hoạt động): ${err.message}`));
});

module.exports = app;
