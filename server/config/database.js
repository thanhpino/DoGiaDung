// config/database.js
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'giadung_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Kết nối MySQL thất bại:', err);
        process.exit(1);
    }
    console.log('✅ MySQL đã kết nối thành công!');
});

module.exports = db;