const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Mặc định chạy từ folder migrations

async function addModelUrlColumn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log("Đã kết nối Database.");

        // Kiểm tra xem cột model_url đã tồn tại chưa
        const [columns] = await connection.query(`SHOW COLUMNS FROM products LIKE 'model_url'`);

        if (columns.length === 0) {
            console.log("Đang thêm cột model_url vào bảng products...");
            await connection.query(`ALTER TABLE products ADD COLUMN model_url VARCHAR(255) DEFAULT NULL;`);
            console.log("Thêm cột model_url thành công!");
        } else {
            console.log("Cột model_url đã tồn tại trong bảng products. Bỏ qua.");
        }

        await connection.end();
        console.log("Đã đóng kết nối Database.");
        process.exit(0);
    } catch (error) {
        console.error("Lỗi khi chạy migration:", error);
        process.exit(1);
    }
}

addModelUrlColumn();
