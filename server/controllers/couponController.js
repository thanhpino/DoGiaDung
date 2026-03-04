// controllers/couponController.js
const db = require('../config/database');
const logger = require('../config/logger');

// Validate mã giảm giá (customer)
const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal, order_total } = req.body;
        const totalValue = orderTotal || order_total || 0;
        const userId = req.user.id;

        if (!code) return res.status(400).json({ status: "Fail", message: "Vui lòng nhập mã giảm giá" });

        const [coupons] = await db.query(
            "SELECT * FROM coupons WHERE code = ? AND is_active = 1",
            [code.toUpperCase()]
        );

        if (coupons.length === 0) {
            return res.status(404).json({ status: "Fail", message: "Mã giảm giá không tồn tại hoặc đã hết hạn" });
        }

        const coupon = coupons[0];

        // Check hết hạn
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ status: "Fail", message: "Mã giảm giá đã hết hạn" });
        }

        // Check số lần dùng
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ status: "Fail", message: "Mã giảm giá đã hết lượt sử dụng" });
        }

        // Check đơn tối thiểu
        if (totalValue && totalValue < coupon.min_order) {
            return res.status(400).json({
                status: "Fail",
                message: `Đơn hàng tối thiểu ${coupon.min_order.toLocaleString('vi-VN')}đ để dùng mã này`
            });
        }

        // Check user đã dùng chưa
        const [usage] = await db.query(
            "SELECT id FROM coupon_usage WHERE coupon_id = ? AND user_id = ?",
            [coupon.id, userId]
        );
        if (usage.length > 0) {
            return res.status(400).json({ status: "Fail", message: "Bạn đã sử dụng mã này rồi" });
        }

        // Tính discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percent') {
            discountAmount = Math.round(totalValue * coupon.discount_value / 100);
        } else {
            discountAmount = coupon.discount_value;
        }

        return res.json({
            status: "Success",
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: discountAmount
            }
        });
    } catch (err) {
        logger.error(`Validate coupon error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi kiểm tra mã giảm giá" });
    }
};

// Admin: Lấy danh sách coupons
const getCoupons = async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
        return res.json(data);
    } catch (err) {
        console.error("LỖI RỒI BRO ƠI:", err);
        res.status(500).json({ status: "Error", message: "Lỗi tải mã giảm giá" });
    }
};

// Admin: Tạo coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discount_type, discount_value, min_order, max_uses, expires_at } = req.body;
        if (!code || !discount_value) {
            return res.status(400).json({ status: "Fail", message: "Thiếu thông tin mã giảm giá" });
        }

        await db.query(
            "INSERT INTO coupons (code, discount_type, discount_value, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
            [code.toUpperCase(), discount_type || 'percent', discount_value, min_order || 0, max_uses || null, expires_at || null]
        );
        return res.json({ status: "Success", message: "Tạo mã giảm giá thành công" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ status: "Fail", message: "Mã đã tồn tại" });
        logger.error(`Create coupon error: ${err.message}`);
        res.status(500).json({ status: "Error", message: "Lỗi tạo mã giảm giá" });
    }
};

// Admin: Cập nhật coupon
const updateCoupon = async (req, res) => {
    try {
        const { discount_type, discount_value, min_order, max_uses, expires_at, is_active } = req.body;
        await db.query(
            "UPDATE coupons SET discount_type=?, discount_value=?, min_order=?, max_uses=?, expires_at=?, is_active=? WHERE id=?",
            [discount_type, discount_value, min_order, max_uses, expires_at, is_active, req.params.id]
        );
        return res.json({ status: "Success", message: "Cập nhật thành công" });
    } catch (err) {
        console.error("LỖI RỒI BRO ƠI:", err);
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật" });
    }
};

// Admin: Xóa coupon
const deleteCoupon = async (req, res) => {
    try {
        await db.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
        return res.json({ status: "Success", message: "Đã xóa mã giảm giá" });
    } catch (err) {
        console.error("LỖI RỒI BRO ƠI:", err);
        res.status(500).json({ status: "Error", message: "Lỗi xóa" });
    }
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
