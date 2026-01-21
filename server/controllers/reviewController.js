// controllers/reviewController.js
const db = require('../config/database');

const createReview = (req, res) => {
    const { product_id, user_id, rating, comment } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const sql = "INSERT INTO reviews (product_id, user_id, rating, comment, image_url) VALUES (?)";
    const values = [product_id, user_id, rating, comment, image_url];
    
    db.query(sql, [values], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Đánh giá thành công");
    });
};

const getReviewsByProduct = (req, res) => {
    const sql = `SELECT r.*, u.name as user_name 
                 FROM reviews r 
                 JOIN users u ON r.user_id = u.id 
                 WHERE r.product_id = ? 
                 ORDER BY r.created_at DESC`;
    db.query(sql, [req.params.productId], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
};

module.exports = {
    createReview,
    getReviewsByProduct
};