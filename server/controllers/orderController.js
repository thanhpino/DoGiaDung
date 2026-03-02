// controllers/orderController.js
const db = require('../config/database');
const { sendOrderEmail } = require('../utils/emailService');

let io;

const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

const getAllOrders = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT o.*, u.name as customer_name 
             FROM orders o LEFT JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải đơn hàng" });
    }
};

const getLatestOrders = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT o.*, u.name as customer_name 
             FROM orders o LEFT JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC LIMIT 5`
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const getOrdersByUserId = async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [req.params.userId]
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải đơn hàng" });
    }
};

const getOrderItems = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT oi.*, p.name, p.image_url, r.rating, r.comment, r.created_at as review_date 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             JOIN orders o ON oi.order_id = o.id 
             LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = o.user_id 
             WHERE oi.order_id = ?`,
            [req.params.id]
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải chi tiết đơn" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
        if (data.length === 0) return res.status(404).json("Không tìm thấy đơn hàng");
        return res.json(data[0]);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const createOrder = async (req, res) => {
    try {
        const { user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, items } = req.body;

        // Lấy email user
        const [resUser] = await db.query("SELECT email FROM users WHERE id = ?", [user_id]);
        const userEmail = (resUser && resUser.length > 0) ? resUser[0].email : null;

        // Tạo đơn hàng
        const sqlOrder = "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, status) VALUES (?)";
        const valuesOrder = [user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, 'Chờ xác nhận'];
        const [orderResult] = await db.query(sqlOrder, [valuesOrder]);
        const orderId = orderResult.insertId;

        // Emit socket
        if (io) {
            io.emit("NEW_ORDER", {
                message: `Có đơn hàng mới #${orderId} từ ${customer_name}`,
                orderId, customer_name, total: total_amount
            });
        }

        // Lưu chi tiết
        const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
        const valuesItems = items.map(item => [orderId, item.id, item.quantity, item.price]);
        await db.query(sqlItems, [valuesItems]);

        // Gửi email
        if (userEmail) sendOrderEmail(userEmail, orderId, items, total_amount, customer_name);

        return res.json({ status: "Success", orderId });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tạo đơn hàng" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        await db.query("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
        return res.json("Cập nhật thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật trạng thái" });
    }
};

module.exports = {
    setSocketIO, getAllOrders, getLatestOrders, getOrdersByUserId,
    getOrderItems, getOrderById, createOrder, updateOrderStatus
};