// controllers/statsController.js
const db = require('../config/database');
const redis = require('../config/redisClient');
const logger = require('../config/logger');

const getGeneralStats = async (req, res) => {
    try {
        // Tổng doanh thu & đơn hàng (all time)
        const [[rev]] = await db.query("SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status != 'Đã hủy'");
        const [[ord]] = await db.query("SELECT COUNT(*) as totalOrders FROM orders WHERE status != 'Đã hủy'");
        const [[usr]] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'");

        // Doanh thu & đơn tháng này
        const [[thisMonth]] = await db.query(
            `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders 
             FROM orders WHERE status != 'Đã hủy' 
             AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`
        );

        // Doanh thu & đơn tháng trước
        const [[lastMonth]] = await db.query(
            `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders 
             FROM orders WHERE status != 'Đã hủy' 
             AND MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
             AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))`
        );

        // Khách mới tháng này vs tháng trước
        const [[usersThisMonth]] = await db.query(
            `SELECT COUNT(*) as cnt FROM users WHERE role='customer' 
             AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())`
        );
        const [[usersLastMonth]] = await db.query(
            `SELECT COUNT(*) as cnt FROM users WHERE role='customer' 
             AND MONTH(created_at)=MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
             AND YEAR(created_at)=YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))`
        );

        // Hôm nay
        const [[today]] = await db.query(
            `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders 
             FROM orders WHERE status != 'Đã hủy' AND DATE(created_at) = CURDATE()`
        );

        // Đơn chờ xử lý
        const [[pending]] = await db.query(
            "SELECT COUNT(*) as cnt FROM orders WHERE status = 'Chờ xử lý'"
        );

        // Giá trị đơn trung bình
        const totalOrders = ord.totalOrders || 0;
        const totalRevenue = rev.totalRevenue || 0;
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // Tính % thay đổi
        const calcChange = (current, previous) => {
            if (!previous || previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 1000) / 10;
        };

        const monthlyTarget = parseInt(process.env.MONTHLY_TARGET) || 20000000;

        res.json({
            revenue: totalRevenue,
            orders: totalOrders,
            users: usr.totalUsers || 0,
            avgOrderValue,
            revenueChange: calcChange(thisMonth.revenue, lastMonth.revenue),
            ordersChange: calcChange(thisMonth.orders, lastMonth.orders),
            usersChange: calcChange(usersThisMonth.cnt, usersLastMonth.cnt),
            monthlyRevenue: thisMonth.revenue || 0,
            monthlyTarget,
            monthlyProgress: monthlyTarget > 0 ? Math.min(Math.round((thisMonth.revenue / monthlyTarget) * 100), 100) : 0,
            todayRevenue: today.revenue || 0,
            todayOrders: today.orders || 0,
            pendingOrders: pending.cnt || 0
        });
    } catch (err) {
        logger.error('getGeneralStats error: ' + err.message);
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

// Doanh thu 12 tháng gần nhất
const getMonthlyStats = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%m/%Y') as month, SUM(total_amount) as revenue,
                    COUNT(*) as orders
             FROM orders WHERE status != 'Đã hủy' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%m/%Y')
             ORDER BY MIN(created_at) ASC`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thống kê tháng" });
    }
};

// Top 10 sản phẩm bán chạy
const getTopProducts = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT p.id, p.name, p.image_url, p.price, SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as total_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.status != 'Đã hủy'
             GROUP BY p.id ORDER BY total_sold DESC LIMIT 10`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải top sản phẩm" });
    }
};

// Doanh thu theo phương thức thanh toán
const getRevenueByPayment = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT payment_method as name, COUNT(*) as orders, SUM(total_amount) as revenue
             FROM orders WHERE status != 'Đã hủy'
             GROUP BY payment_method ORDER BY revenue DESC`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải thống kê thanh toán" });
    }
};

module.exports = { getGeneralStats, getWeeklyStats, getCategoryStats, getMonthlyStats, getTopProducts, getRevenueByPayment };
