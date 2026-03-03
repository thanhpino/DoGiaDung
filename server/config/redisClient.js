// // config/redisClient.js
const Redis = require('ioredis');
const logger = require('./logger');

// Để nếu Render không đọc được biến, âm thầm chạy localhost.
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (!REDIS_URL) {
    logger.error('🚨 Render không đọc được biến REDIS_URL! Vui lòng check lại mục Environment trên Render.');
}

// 2. Thêm cấu hình TLS (Bắt buộc đối với Upstash Redis)
const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    tls: {
        rejectUnauthorized: false // CHÌA KHÓA VÀNG Ở ĐÂY: Bỏ qua lỗi SSL/TLS của Upstash
    },
    retryStrategy(times) {
        const delay = Math.min(times * 500, 5000);
        logger.warn(`🔴 Redis reconnecting... (lần ${times}, chờ ${delay}ms)`);
        return delay;
    }
});

redis.on('connect', () => {
    logger.info('🟢 Redis (Upstash) đã kết nối thành công!');
});

redis.on('error', (err) => {
    logger.error(`🔴 Redis error: ${err.message}`);
});

module.exports = redis;