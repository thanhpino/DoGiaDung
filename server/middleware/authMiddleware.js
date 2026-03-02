// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT Token
 * Kiểm tra header: Authorization: Bearer <token>
 * Nếu hợp lệ → gắn req.user = { id, email, role }
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: "Fail", message: "Không có token xác thực. Vui lòng đăng nhập!" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: "Fail", message: "Token đã hết hạn. Vui lòng đăng nhập lại!" });
        }
        return res.status(401).json({ status: "Fail", message: "Token không hợp lệ!" });
    }
};

/**
 * Middleware kiểm tra quyền Admin
 * Phải dùng sau verifyToken
 */
const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ status: "Fail", message: "Bạn không có quyền truy cập! (Chỉ Admin)" });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };
