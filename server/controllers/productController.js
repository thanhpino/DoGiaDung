// controllers/productController.js
const db = require('../config/database');
const { invalidateCache } = require('../middleware/cacheMiddleware');
const { queueEmbeddingSync } = require('../queues/embeddingQueue');
const redis = require('../config/redisClient');
const logger = require('../config/logger');

const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search || '';
        const category = req.query.category || 'All';
        const offset = (page - 1) * limit;

        let whereSql = "WHERE is_deleted = 0";
        const params = [];

        if (search) {
            whereSql += " AND name LIKE ?";
            params.push(`%${search}%`);
        }
        if (category !== 'All') {
            whereSql += " AND category = ?";
            params.push(category);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM products ${whereSql}`, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const [products] = await db.query(
            `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({ data: products, pagination: { page, limit, total, totalPages } });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải sản phẩm" });
    }
};

const getProductById = async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (data.length === 0) return res.status(404).json("Không tìm thấy sản phẩm");
        let images = [];
        try {
            const [imgData] = await db.query(
                "SELECT id, image_url, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
                [req.params.id]
            );
            images = imgData;
        } catch (imgErr) {
            console.warn(`⚠️ Cảnh báo: Không thể lấy ảnh cho sản phẩm ${req.params.id} (Có thể bảng product_images chưa tồn tại)`);
        }
        return res.json({ ...data[0], images });
    } catch (err) {
        console.error("Lỗi getProductById:", err);
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, price, category, img, description, stock, model_url } = req.body;
        const sql = "INSERT INTO products (name, price, category, image_url, description, stock, model_url) VALUES (?)";
        const [result] = await db.query(sql, [[name, price, category, img, description, stock || 100, model_url || null]]);

        // Sync stock vào Redis
        const productId = result.insertId;
        redis.set(`stock:product:${productId}`, stock || 100).catch(() => { });

        // Invalidate cache + queue embedding
        invalidateCache('cache:/products*').catch(() => { });
        queueEmbeddingSync('sync_product', productId).catch(() => { });

        return res.json({ status: "Success", message: "Thêm sản phẩm thành công", productId });
    } catch (err) {
        logger.error(`Create product error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi thêm sản phẩm" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price, category, img, description, stock, model_url } = req.body;
        const productId = req.params.id;

        const sql = "UPDATE products SET name=?, price=?, category=?, image_url=?, description=?, model_url=? WHERE id=?";
        await db.query(sql, [name, price, category, img, description, model_url || null, productId]);

        // Cập nhật stock nếu có
        if (stock !== undefined) {
            await db.query("UPDATE products SET stock=? WHERE id=?", [stock, productId]);
            redis.set(`stock:product:${productId}`, stock).catch(() => { });
        }

        // Invalidate cache + queue embedding
        invalidateCache('cache:/products*').catch(() => { });
        invalidateCache(`cache:/api/products/${productId}`).catch(() => { });
        queueEmbeddingSync('sync_product', productId).catch(() => { });

        return res.json("Cập nhật thành công");
    } catch (err) {
        logger.error(`Update product error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật sản phẩm" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const sql = "UPDATE products SET is_deleted = 1 WHERE id = ?";
        const [result] = await db.query(sql, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json("Không tìm thấy sản phẩm");

        // Xóa stock khỏi Redis + invalidate cache
        redis.del(`stock:product:${req.params.id}`).catch(() => { });
        invalidateCache('cache:/products*').catch(() => { });

        return res.json("Đã xóa sản phẩm thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi xóa sản phẩm" });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };