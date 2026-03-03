// scripts/syncEmbeddings.js
// Đồng bộ embeddings cho tất cả sản phẩm từ MySQL vào VectorStore
const db = require('../config/database');
const { embedProducts } = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');
const logger = require('../config/logger');

/**
 * Lấy tất cả sản phẩm active từ DB
 */
async function getAllProducts() {
    const [rows] = await db.query(
        "SELECT id, name, price, category, image_url, description FROM products WHERE is_deleted = 0"
    );
    return rows;
}

/**
 * Sync embeddings: Lấy sản phẩm → Tạo embedding → Nạp vào VectorStore
 * @returns {Promise<number>} Số sản phẩm đã embed thành công
 */
async function syncEmbeddings() {
    logger.info('🔄 Bắt đầu đồng bộ embeddings...');

    try {
        // 1. Lấy sản phẩm từ DB
        const products = await getAllProducts();
        logger.info(`📦 Tìm thấy ${products.length} sản phẩm trong DB`);

        if (products.length === 0) {
            logger.warn('⚠️ Không có sản phẩm nào để embed');
            return 0;
        }

        // 2. Clear store cũ
        vectorStore.clear();

        // 3. Embed từng sản phẩm (có rate limiting)
        const results = await embedProducts(products, (current, total, product) => {
            logger.info(`🧠 [${current}/${total}] Đã embed: ${product.name}`);
        });

        // 4. Nạp vào VectorStore
        for (const { productId, vector, metadata } of results) {
            vectorStore.addProduct(productId, vector, metadata);
        }

        logger.info(`✅ Đồng bộ xong! ${vectorStore.size()}/${products.length} sản phẩm đã có embedding`);
        return vectorStore.size();

    } catch (err) {
        logger.error(`❌ Lỗi đồng bộ embeddings: ${err.message}`);
        throw err;
    }
}

module.exports = { syncEmbeddings };

// Cho phép chạy standalone: node scripts/syncEmbeddings.js
if (require.main === module) {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
    syncEmbeddings()
        .then(count => {
            console.log(`\n🎉 Hoàn tất! Đã embed ${count} sản phẩm.`);
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Lỗi:', err.message);
            process.exit(1);
        });
}
