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

/**
 * Lấy tất cả sản phẩm (cho embedding sync)
 */
async function getAllProducts() {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, category, image_url, description FROM products WHERE is_deleted = 0"
        );
        return rows;
    } catch (err) {
        logger.error(`getAllProducts error: ${err.message}`);
        return [];
    }
}

/**
 * Tìm kiếm ngữ nghĩa (Semantic Search) bằng Gemini Embedding
 * Fallback sang LIKE search nếu vector store chưa sẵn sàng
 */
async function semanticSearch(queryText, topK = 5) {
    const vectorStore = require('./vectorStore');
    const { embedText } = require('./embeddingService');

    try {
        // Kiểm tra vector store đã có dữ liệu chưa
        if (vectorStore.size() === 0) {
            logger.warn('VectorStore trống, fallback sang LIKE search');
            return await searchProducts(queryText, topK);
        }

        // Embed câu hỏi
        const queryVector = await embedText(queryText);

        // Tìm kiếm trong vector store
        const results = vectorStore.search(queryVector, topK);

        if (results.length === 0) {
            logger.info('Semantic search không tìm thấy, fallback sang LIKE');
            return await searchProducts(queryText, topK);
        }

        logger.info(`Semantic search: tìm thấy ${results.length} kết quả (top score: ${results[0].score.toFixed(3)})`);

        // Trả về metadata (thông tin sản phẩm) thay vì vector
        return results.map(r => r.metadata);

    } catch (err) {
        logger.error(`semanticSearch error: ${err.message}, fallback sang LIKE`);
        return await searchProducts(queryText, topK);
    }
}

module.exports = {
    searchProducts,
    getTopProducts,
    getNewProducts,
    getProductsByPrice,
    getPremiumProducts,
    getProductsByCategory,
    getAllProducts,
    semanticSearch
};
