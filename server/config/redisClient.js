// config/redisClient.js
const Redis = require('ioredis');
const logger = require('./logger');

// Mặc định lấy biến môi trường, nếu không có thì tự hiểu là đang chạy Local ở máy bro
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Tự động phát hiện xem đang xài Cloud (rediss://) hay Local (redis://)
const isTLS = REDIS_URL.startsWith('rediss://');

const redisConfig = {
    maxRetriesPerRequest: null, // Bắt buộc cho BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 500, 5000);
        logger.warn(`🔴 Redis reconnecting... (lần ${times}, chờ ${delay}ms)`);
        return delay;
    }
};

// CHÌA KHÓA VÀNG: Chỉ bật cấu hình TLS nếu đang xài Upstash trên mạng
if (isTLS) {
    redisConfig.tls = {
        rejectUnauthorized: false
    };
}

const redis = new Redis(REDIS_URL, redisConfig);

redis.on('connect', () => {
    logger.info(`🟢 Redis đã kết nối thành công! (${isTLS ? 'Cloud/Upstash' : 'Local'})`);
});

redis.on('error', (err) => {
    logger.error(`🔴 Redis error: ${err.message}`);
});

module.exports = redis;