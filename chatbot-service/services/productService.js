// services/productService.js
const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Tìm sản phẩm theo keyword (tên)
 */
async function searchProducts(keyword, limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE (name LIKE ? OR category LIKE ?) AND is_deleted = 0 LIMIT ?",
            [`%${keyword}%`, `%${keyword}%`, limit]
        );
        return rows;
    } catch (err) {
        logger.error(`searchProducts error: ${err.message}`);
        return [];
    }
}

/**
 * Sản phẩm bán chạy
 */
async function getTopProducts(limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE is_deleted = 0 ORDER BY id DESC LIMIT ?",
            [limit]
        );
        return rows;
    } catch (err) {
        logger.error(`getTopProducts error: ${err.message}`);
        return [];
    }
}

/**
 * Hàng mới về
 */
async function getNewProducts(limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ?",
            [limit]
        );
        return rows;
    } catch (err) {
        logger.error(`getNewProducts error: ${err.message}`);
        return [];
    }
}

/**
 * Lọc theo khoảng giá
 */
async function getProductsByPrice(maxPrice, limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE price <= ? AND is_deleted = 0 ORDER BY price DESC LIMIT ?",
            [maxPrice, limit]
        );
        return rows;
    } catch (err) {
        logger.error(`getProductsByPrice error: ${err.message}`);
        return [];
    }
}

/**
 * Sản phẩm cao cấp
 */
async function getPremiumProducts(limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE is_deleted = 0 ORDER BY price DESC LIMIT ?",
            [limit]
        );
        return rows;
    } catch (err) {
        logger.error(`getPremiumProducts error: ${err.message}`);
        return [];
    }
}

/**
 * Lọc theo danh mục
 */
async function getProductsByCategory(category, limit = 3) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE category LIKE ? AND is_deleted = 0 LIMIT ?",
            [`%${category}%`, limit]
        );
        return rows;
    } catch (err) {
        logger.error(`getProductsByCategory error: ${err.message}`);
        return [];
    }
}

module.exports = {
    searchProducts,
    getTopProducts,
    getNewProducts,
    getProductsByPrice,
    getPremiumProducts,
    getProductsByCategory
};
