// controllers/wishlistController.js
const db = require('../config/database');

const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const [data] = await db.query(
            `SELECT w.id as wishlist_id, w.created_at as added_at, p.* 
             FROM wishlists w 
             JOIN products p ON w.product_id = p.id 
             WHERE w.user_id = ? AND p.is_deleted = 0
             ORDER BY w.created_at DESC`,
            [userId]
        );
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải danh sách yêu thích" });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ status: "Fail", message: "Thiếu productId" });

        await db.query(
            "INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)",
            [userId, productId]
        );
        return res.json({ status: "Success", message: "Đã thêm vào yêu thích" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi thêm yêu thích" });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        await db.query(
            "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
            [userId, productId]
        );
        return res.json({ status: "Success", message: "Đã bỏ yêu thích" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi bỏ yêu thích" });
    }
};

const getWishlistIds = async (req, res) => {
    try {
        const userId = req.user.id;
        const [data] = await db.query(
            "SELECT product_id FROM wishlists WHERE user_id = ?",
            [userId]
        );
        const ids = data.map(row => row.product_id);
        return res.json(ids);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi" });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, getWishlistIds };
