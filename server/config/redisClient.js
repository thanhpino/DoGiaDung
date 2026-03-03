// config/redisClient.js
// Redis connection singleton (ioredis)
const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 500, 5000);
        logger.warn(`🔴 Redis reconnecting... (lần ${times}, chờ ${delay}ms)`);
        return delay;
    }
});

redis.on('connect', () => {
    logger.info('🔴 Redis đã kết nối thành công!');
});

redis.on('error', (err) => {
    logger.error(`🔴 Redis error: ${err.message}`);
});

module.exports = redis;
