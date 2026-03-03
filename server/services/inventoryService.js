// services/inventoryService.js
// Quản lý tồn kho bằng Redis Atomic Operations (Lua Script)
const redis = require('../config/redisClient');
const db = require('../config/database');
const logger = require('../config/logger');

// Lua Script: Check & Deduct stock atomically
// KEYS = [stock:product:1, stock:product:2, ...]
// ARGV = [quantity1, quantity2, ...]
// Returns: 1 = OK, 0 = Hết hàng (kèm index sản phẩm hết)
const RESERVE_STOCK_SCRIPT = `
local n = #KEYS
for i = 1, n do
    local current = tonumber(redis.call('GET', KEYS[i]) or 0)
    if current < tonumber(ARGV[i]) then
        return -i
    end
end
for i = 1, n do
    redis.call('DECRBY', KEYS[i], ARGV[i])
end
return 1
`;

// Lua Script: Release stock (khi hủy đơn)
const RELEASE_STOCK_SCRIPT = `
local n = #KEYS
for i = 1, n do
    redis.call('INCRBY', KEYS[i], ARGV[i])
end
return 1
`;

/**
 * Đồng bộ stock từ MySQL → Redis khi server khởi động
 */
async function syncStockFromDB() {
    try {
        const [products] = await db.query(
            "SELECT id, stock FROM products WHERE is_deleted = 0"
        );

        const pipeline = redis.pipeline();
        for (const p of products) {
            pipeline.set(`stock:product:${p.id}`, p.stock);
        }
        await pipeline.exec();

        logger.info(`📦 Đã sync stock ${products.length} sản phẩm vào Redis`);
        return products.length;
    } catch (err) {
        logger.error(`Sync stock error: ${err.message}`);
        throw err;
    }
}

/**
 * Reserve stock (đặt hàng) — Atomic, không bao giờ bán âm
 * @param {Array<{id: number, quantity: number}>} items
 * @returns {Promise<{success: boolean, failedProductId?: number}>}
 */
async function reserveStock(items) {
    const keys = items.map(item => `stock:product:${item.id}`);
    const quantities = items.map(item => item.quantity);

    try {
        const result = await redis.eval(RESERVE_STOCK_SCRIPT, keys.length, ...keys, ...quantities);

        if (result === 1) {
            // Đồng bộ trừ stock trong MySQL (non-blocking)
            for (const item of items) {
                db.query(
                    "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                    [item.quantity, item.id, item.quantity]
                ).catch(err => logger.error(`MySQL stock deduct error: ${err.message}`));
            }
            return { success: true };
        } else {
            // result = -index (1-based) của sản phẩm hết hàng
            const failedIndex = Math.abs(result) - 1;
            return { success: false, failedProductId: items[failedIndex].id };
        }
    } catch (err) {
        logger.error(`Reserve stock error: ${err.message}`);
        // Fallback: cho phép đặt hàng nếu Redis down (graceful degradation)
        logger.warn('⚠️ Redis down, cho phép đặt hàng không check stock');
        return { success: true };
    }
}

/**
 * Release stock (hủy đơn) — trả lại stock
 * @param {Array<{product_id: number, quantity: number}>} items
 */
async function releaseStock(items) {
    const keys = items.map(item => `stock:product:${item.product_id}`);
    const quantities = items.map(item => item.quantity);

    try {
        await redis.eval(RELEASE_STOCK_SCRIPT, keys.length, ...keys, ...quantities);

        // Đồng bộ MySQL
        for (const item of items) {
            db.query(
                "UPDATE products SET stock = stock + ? WHERE id = ?",
                [item.quantity, item.product_id]
            ).catch(err => logger.error(`MySQL stock release error: ${err.message}`));
        }

        logger.info(`🔄 Đã hoàn stock cho ${items.length} sản phẩm`);
    } catch (err) {
        logger.error(`Release stock error: ${err.message}`);
    }
}

/**
 * Lấy stock hiện tại của sản phẩm từ Redis
 */
async function getStock(productId) {
    const stock = await redis.get(`stock:product:${productId}`);
    return stock ? parseInt(stock) : 0;
}

module.exports = { syncStockFromDB, reserveStock, releaseStock, getStock };
