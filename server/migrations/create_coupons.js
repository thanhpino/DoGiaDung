// migrations/create_coupons.js
// Chạy: node migrations/create_coupons.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/database');

async function migrate() {
    // Bảng coupons
    await db.query(`
        CREATE TABLE IF NOT EXISTS coupons (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
            discount_value DECIMAL(10,2) NOT NULL,
            min_order DECIMAL(10,2) DEFAULT 0,
            max_uses INT DEFAULT NULL,
            used_count INT DEFAULT 0,
            expires_at DATETIME DEFAULT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tạo bảng coupons thành công!');

    // Bảng coupon_usage — track ai đã dùng mã nào
    await db.query(`
        CREATE TABLE IF NOT EXISTS coupon_usage (
            id INT AUTO_INCREMENT PRIMARY KEY,
            coupon_id INT NOT NULL,
            user_id INT NOT NULL,
            order_id INT NOT NULL,
            used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            UNIQUE KEY unique_usage (coupon_id, user_id)
        )
    `);
    console.log('✅ Tạo bảng coupon_usage thành công!');

    // Thêm cột discount vào orders
    const cols = [
        { name: 'coupon_code', sql: "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL" },
        { name: 'discount_amount', sql: "ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0" }
    ];
    for (const col of cols) {
        try {
            await db.query(col.sql);
            console.log(`✅ Added column: ${col.name}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log(`⏭️ Column ${col.name} already exists`);
            else throw e;
        }
    }

    process.exit(0);
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
