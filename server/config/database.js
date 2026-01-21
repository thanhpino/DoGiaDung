require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối DB:', err.message);
    } else {
        console.log('✅ MySQL đã kết nối thành công!');
        connection.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");
        connection.release();
    }
});

module.exports = pool;