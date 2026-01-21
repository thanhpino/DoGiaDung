// controllers/statsController.js
const db = require('../config/database');

const getGeneralStats = (req, res) => {
    const sqlRevenue = "SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status != 'Đã hủy'";
    const sqlOrders = "SELECT COUNT(*) as totalOrders FROM orders";
    const sqlUsers = "SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'";
    
    db.query(sqlRevenue, (err, rev) => {
        db.query(sqlOrders, (err, ord) => {
            db.query(sqlUsers, (err, usr) => {
                res.json({
                    revenue: rev[0].totalRevenue || 0,
                    orders: ord[0].totalOrders || 0,
                    users: usr[0].totalUsers || 0
                });
            });
        });
    });
};

const getWeeklyStats = (req, res) => {
    const sql = `SELECT DATE_FORMAT(created_at, '%d/%m') as day, 
                        SUM(total_amount) as value 
                 FROM orders 
                 WHERE status != 'Đã hủy' 
                   AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                 GROUP BY DATE_FORMAT(created_at, '%d/%m') 
                 ORDER BY MIN(created_at) ASC`;
    
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
};

const getCategoryStats = (req, res) => {
    const sql = `SELECT p.category as name, SUM(oi.quantity) as sold 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 JOIN orders o ON oi.order_id = o.id 
                 WHERE o.status != 'Đã hủy' 
                 GROUP BY p.category 
                 ORDER BY sold DESC`;
    
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        
        const totalSold = data.reduce((sum, item) => sum + Number(item.sold), 0);
        const result = data.map(item => ({
            name: item.name,
            pct: totalSold > 0 ? Math.round(Number(item.sold / totalSold) * 100) : 0
        }));
        
        return res.json(result);
    });
};

module.exports = {
    getGeneralStats,
    getWeeklyStats,
    getCategoryStats
};