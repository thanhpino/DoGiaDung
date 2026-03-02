// controllers/reviewController.js
const db = require('../config/database');

const createReview = async (req, res) => {
    try {
        const { product_id, user_id, rating, comment } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = "INSERT INTO reviews (product_id, user_id, rating, comment, image_url) VALUES (?)";
        await db.query(sql, [[product_id, user_id, rating, comment, image_url]]);
        return res.json("Đánh giá thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tạo đánh giá" });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT r.*, u.name as user_name FROM reviews r 
             JOIN users u ON r.user_id = u.id WHERE r.product_id = ? 
             ORDER BY r.created_at DESC`,
            [req.params.productId]
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải đánh giá" });
    }
};

module.exports = { createReview, getReviewsByProduct };