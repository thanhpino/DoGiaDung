// migrations/create_product_images.js
// Chạy: node migrations/create_product_images.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/database');

async function migrate() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INT DEFAULT 0,
            is_primary TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            INDEX idx_product (product_id)
        )
    `);
    console.log('✅ Tạo bảng product_images thành công!');
    process.exit(0);
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
