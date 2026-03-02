// middleware/errorHandler.js
const logger = require('../config/logger');

/**
 * Middleware xử lý lỗi tập trung
 * Bắt tất cả lỗi từ next(error) hoặc lỗi throw
 * Phải đặt SAU tất cả routes trong index.js
 */
const errorHandler = (err, req, res, next) => {
    // Log lỗi chi tiết (stack trace)
    logger.error(`${err.message}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        stack: err.stack
    });

    // Xử lý theo loại lỗi
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'Fail',
            message: err.message || 'Dữ liệu không hợp lệ'
        });
    }

    if (err.name === 'UnauthorizedError' || err.status === 401) {
        return res.status(401).json({
            status: 'Fail',
            message: 'Không có quyền truy cập'
        });
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            status: 'Fail',
            message: 'Dữ liệu đã tồn tại'
        });
    }

    // Lỗi mặc định: 500 Internal Server Error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Lỗi server, vui lòng thử lại sau'
            : err.message
    });
};

/**
 * Middleware xử lý route không tồn tại (404)
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'Fail',
        message: `Route ${req.originalUrl} không tồn tại`
    });
};

module.exports = { errorHandler, notFoundHandler };
