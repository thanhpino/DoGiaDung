// queues/embeddingQueue.js
// BullMQ Embedding Sync Queue — Đồng bộ embedding khi thêm/sửa sản phẩm
const { Queue, Worker } = require('bullmq');
const redis = require('../config/redisClient');
const logger = require('../config/logger');

const embeddingQueue = new Queue('embedding-queue', {
    connection: redis,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 10000 },
        removeOnComplete: 20,
        removeOnFail: 50
    }
});

// Worker — gọi chatbot-service API để re-embed
const CHATBOT_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8082';

const embeddingWorker = new Worker('embedding-queue', async (job) => {
    const { action, productId } = job.data;
    logger.info(`🧠 [Embedding Worker] ${action} product #${productId || 'all'}`);

    try {
        // Trigger chatbot-service re-sync
        // Chatbot-service sẽ re-embed khi restart
        // For now, just log — full integration sẽ thêm API endpoint ở chatbot-service
        logger.info(`✅ [Embedding Worker] Queued ${action} for product #${productId || 'all'}`);
    } catch (err) {
        logger.error(`❌ [Embedding Worker] Error: ${err.message}`);
        throw err;
    }
}, {
    connection: redis,
    concurrency: 1
});

/**
 * Queue re-embed khi admin thêm/sửa sản phẩm
 */
async function queueEmbeddingSync(action = 'sync_all', productId = null) {
    await embeddingQueue.add(`embedding-${action}`, { action, productId });
    logger.info(`📮 Đã queue embedding ${action} ${productId ? '#' + productId : ''}`);
}

module.exports = { embeddingQueue, queueEmbeddingSync };
