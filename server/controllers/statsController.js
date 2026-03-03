// controllers/statsController.js
const db = require('../config/database');
const redis = require('../config/redisClient');
const logger = require('../config/logger');

const getGeneralStats = async (req, res) => {
    try {
        const [[rev]] = await db.query("SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status != 'Đã hủy'");
        const [[ord]] = await db.query("SELECT COUNT(*) as totalOrders FROM orders");
        const [[usr]] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'");

        res.json({
            revenue: rev.totalRevenue || 0,
            orders: ord.totalOrders || 0,
            users: usr.totalUsers || 0
        });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thống kê" });
    }
};

const getWeeklyStats = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%d/%m') as day, SUM(total_amount) as value 
             FROM orders WHERE status != 'Đã hủy' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
             GROUP BY DATE_FORMAT(created_at, '%d/%m') ORDER BY MIN(created_at) ASC`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thống kê tuần" });
    }
};

const getCategoryStats = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT p.category as name, SUM(oi.quantity) as sold 
             FROM order_items oi JOIN products p ON oi.product_id = p.id 
             JOIN orders o ON oi.order_id = o.id WHERE o.status != 'Đã hủy' 
             GROUP BY p.category ORDER BY sold DESC`
        );

        const totalSold = data.reduce((sum, item) => sum + Number(item.sold), 0);
        const result = data.map(item => ({
            name: item.name,
            pct: totalSold > 0 ? Math.round(Number(item.sold / totalSold) * 100) : 0
        }));

        return res.json(result);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thống kê danh mục" });
    }
};

module.exports = { getGeneralStats, getWeeklyStats, getCategoryStats };