// controllers/productController.js
const db = require('../config/database');

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
        return res.json(data[0]);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, price, category, img, description } = req.body;
        const sql = "INSERT INTO products (name, price, category, image_url, description) VALUES (?)";
        await db.query(sql, [[name, price, category, img, description]]);
        return res.json("Thêm sản phẩm thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi thêm sản phẩm" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price, category, img, description } = req.body;
        const sql = "UPDATE products SET name=?, price=?, category=?, image_url=?, description=? WHERE id=?";
        await db.query(sql, [name, price, category, img, description, req.params.id]);
        return res.json("Cập nhật thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật sản phẩm" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const sql = "UPDATE products SET is_deleted = 1 WHERE id = ?";
        const [result] = await db.query(sql, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json("Không tìm thấy sản phẩm");
        return res.json("Đã xóa sản phẩm thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi xóa sản phẩm" });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };