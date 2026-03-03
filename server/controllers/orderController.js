// controllers/orderController.js
const db = require('../config/database');
const { reserveStock, releaseStock } = require('../services/inventoryService');
const { queueOrderEmail } = require('../queues/emailQueue');
const { invalidateCache } = require('../middleware/cacheMiddleware');
const logger = require('../config/logger');

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

        // 1. KIỂM TRA TỒN KHO (Redis Atomic)
        const stockResult = await reserveStock(items);
        if (!stockResult.success) {
            // Tìm tên sản phẩm hết hàng
            const [failedProduct] = await db.query(
                "SELECT name FROM products WHERE id = ?",
                [stockResult.failedProductId]
            );
            const productName = failedProduct?.[0]?.name || `#${stockResult.failedProductId}`;
            return res.status(400).json({
                status: "Fail",
                message: `Sản phẩm "${productName}" đã hết hàng hoặc không đủ số lượng!`
            });
        }

        // 2. Lấy email user
        const [resUser] = await db.query("SELECT email FROM users WHERE id = ?", [user_id]);
        const userEmail = (resUser && resUser.length > 0) ? resUser[0].email : null;

        // 3. Tạo đơn hàng
        const sqlOrder = "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, status) VALUES (?)";
        const valuesOrder = [user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, 'Chờ xác nhận'];
        const [orderResult] = await db.query(sqlOrder, [valuesOrder]);
        const orderId = orderResult.insertId;

        // 4. Emit socket
        if (io) {
            io.emit("NEW_ORDER", {
                message: `Có đơn hàng mới #${orderId} từ ${customer_name}`,
                orderId, customer_name, total: total_amount
            });
        }

        // 5. Lưu chi tiết
        const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
        const valuesItems = items.map(item => [orderId, item.id, item.quantity, item.price]);
        await db.query(sqlItems, [valuesItems]);

        // 6. Gửi email qua BullMQ Queue (KHÔNG block response)
        if (userEmail) {
            queueOrderEmail(userEmail, orderId, items, total_amount, customer_name)
                .catch(err => logger.error(`Queue email error: ${err.message}`));
        }

        // 7. Invalidate product cache (stock đã thay đổi)
        invalidateCache('cache:/products*').catch(() => { });
        invalidateCache('cache:/api/stats*').catch(() => { });

        return res.json({ status: "Success", orderId });
    } catch (err) {
        logger.error(`Create order error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi tạo đơn hàng" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Nếu hủy đơn → hoàn lại stock
        if (status === 'Đã hủy') {
            const [items] = await db.query(
                "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
                [orderId]
            );
            if (items.length > 0) {
                await releaseStock(items);
            }
        }

        await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

        // Invalidate cache
        invalidateCache('cache:/api/stats*').catch(() => { });

        return res.json("Cập nhật thành công");
    } catch (err) {
        logger.error(`Update order status error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật trạng thái" });
    }
};

module.exports = {
    setSocketIO, getAllOrders, getLatestOrders, getOrdersByUserId,
    getOrderItems, getOrderById, createOrder, updateOrderStatus
};