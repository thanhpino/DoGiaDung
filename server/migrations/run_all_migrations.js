// server/migrations/run_all_migrations.js
const db = require('../config/database'); // Đường dẫn tới file config DB của bro

const runMigrations = async () => {
    console.log('🚀 Bắt đầu chạy Migrations...');

    try {
        // 1. Tạo bảng wishlists
        await db.query(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_wishlist (user_id, product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng wishlists đã sẵn sàng.');

        // 2. Tạo bảng product_images
        await db.query(`
            CREATE TABLE IF NOT EXISTS product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng product_images đã sẵn sàng.');

        // 3. Tạo bảng notifications
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng notifications đã sẵn sàng.');

        // 4. Tạo bảng coupons
        await db.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_amount INT NOT NULL,
                min_order_value INT DEFAULT 0,
                start_date DATETIME,
                end_date DATETIME,
                usage_limit INT DEFAULT NULL,
                used_count INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng coupons đã sẵn sàng.');

        // 5. Tạo bảng coupon_usage
        await db.query(`
            CREATE TABLE IF NOT EXISTS coupon_usage (
                id INT AUTO_INCREMENT PRIMARY KEY,
                coupon_id INT NOT NULL,
                user_id INT NOT NULL,
                order_id INT NOT NULL,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng coupon_usage đã sẵn sàng.');

        // 6. Cập nhật bảng orders (Thêm coupon_code và discount_amount)
        // Dùng try-catch riêng vì MySQL không có cú pháp IF NOT EXISTS cho ADD COLUMN
        try {
            await db.query(`ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER total_amount;`);
            await db.query(`ALTER TABLE orders ADD COLUMN discount_amount INT DEFAULT 0 AFTER coupon_code;`);
            console.log('✅ Đã thêm cột coupon vào bảng orders.');
        } catch (alterErr) {
            if (alterErr.code === 'ER_DUP_FIELDNAME') {
                console.log('⚡ Cột coupon đã tồn tại trong bảng orders, bỏ qua.');
            } else {
                throw alterErr;
            }
        }

        console.log('🎉 TẤT CẢ MIGRATIONS ĐÃ CHẠY THÀNH CÔNG!');
    } catch (error) {
        console.error('❌ Lỗi khi chạy migrations:', error);
    } finally {
        process.exit(); // Tắt script sau khi chạy xong
    }
};

runMigrations();