// controllers/orderController.js
const db = require('../config/database');
const { sendOrderEmail } = require('../utils/emailService');

let io;

const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

const getAllOrders = (req, res) => {
    const sql = `SELECT o.*, u.name as customer_name 
                 FROM orders o 
                 LEFT JOIN users u ON o.user_id = u.id 
                 ORDER BY o.created_at DESC`;
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
};

const getLatestOrders = (req, res) => {
    const sql = `SELECT o.*, u.name as customer_name 
                 FROM orders o 
                 LEFT JOIN users u ON o.user_id = u.id 
                 ORDER BY o.created_at DESC LIMIT 5`;
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
};

const getOrdersByUserId = (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.userId], (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
};

const getOrderItems = (req, res) => {
    const sql = `SELECT oi.*, p.name, p.image_url, r.rating, r.comment, r.created_at as review_date 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 JOIN orders o ON oi.order_id = o.id 
                 LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = o.user_id 
                 WHERE oi.order_id = ?`;
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
};

const getOrderById = (req, res) => {
    const sql = "SELECT * FROM orders WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("Không tìm thấy đơn hàng");
        return res.json(data[0]);
    });
};

const createOrder = (req, res) => {
    const { user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, items } = req.body;
    
    const sqlGetUser = "SELECT email FROM users WHERE id = ?";
    db.query(sqlGetUser, [user_id], (errUser, resUser) => {
        const userEmail = (resUser && resUser.length > 0) ? resUser[0].email : null;
        
        const sqlOrder = "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, status) VALUES (?)";
        const valuesOrder = [user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, 'Chờ xác nhận'];
        
        db.query(sqlOrder, [valuesOrder], (err, data) => {
            if(err) return res.status(500).json("Lỗi tạo đơn hàng");
            
            const orderId = data.insertId;
            
            // Emit socket event nếu có
            if (io) {
                io.emit("NEW_ORDER", { 
                    message: `Có đơn hàng mới #${orderId} từ ${customer_name}`, 
                    orderId, 
                    customer_name,
                    total: total_amount 
                });
            }
            
            const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
            const valuesItems = items.map(item => [orderId, item.id, item.quantity, item.price]);
            
            db.query(sqlItems, [valuesItems], (err) => {
                if(err) return res.status(500).json("Lỗi lưu chi tiết");
                
                if (userEmail) sendOrderEmail(userEmail, orderId, items, total_amount, customer_name);
                
                return res.json({ status: "Success", orderId: orderId });
            });
        });
    });
};

const updateOrderStatus = (req, res) => {
    const status = req.body.status;
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    
    db.query(sql, [status, req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
};

module.exports = {
    setSocketIO,
    getAllOrders,
    getLatestOrders,
    getOrdersByUserId,
    getOrderItems,
    getOrderById,
    createOrder,
    updateOrderStatus
};