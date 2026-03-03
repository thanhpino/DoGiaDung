// middleware/cacheMiddleware.js
// Redis caching middleware cho Express routes
const redis = require('../config/redisClient');
const logger = require('../config/logger');

/**
 * Middleware cache response theo URL
 * @param {number} ttl - Time to live (giây)
 */
function cacheRoute(ttl = 300) {
    return async (req, res, next) => {
        // Chỉ cache GET requests
        if (req.method !== 'GET') return next();

        const key = `cache:${req.originalUrl}`;

        try {
            const cached = await redis.get(key);
            if (cached) {
                logger.info(`⚡ Cache HIT: ${req.originalUrl}`);
                res.set('X-Cache', 'HIT');
                return res.json(JSON.parse(cached));
            }
        } catch (err) {
            logger.error(`Cache read error: ${err.message}`);
        }

        // Cache MISS — override res.json để capture response
        res.set('X-Cache', 'MISS');
        const originalJson = res.json.bind(res);

        res.json = (data) => {
            // Lưu vào Redis (non-blocking)
            redis.setex(key, ttl, JSON.stringify(data)).catch(err =>
                logger.error(`Cache write error: ${err.message}`)
            );
            return originalJson(data);
        };

        next();
    };
}

/**
 * Xóa cache theo pattern
 * @param {string} pattern - Redis key pattern (e.g. "cache:/products*")
 */
async function invalidateCache(pattern) {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            logger.info(`🗑️ Đã xóa ${keys.length} cache keys: ${pattern}`);
        }
    } catch (err) {
        logger.error(`Cache invalidate error: ${err.message}`);
    }
}

module.exports = { cacheRoute, invalidateCache };
