// middleware/validators.js
const { body, validationResult } = require('express-validator');

// Helper: Xử lý kết quả validation
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "Fail",
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

// === AUTH VALIDATORS ===
const validateSignup = [
    body('name')
        .trim().notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    body('email')
        .trim().isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự'),
    handleValidation
];

const validateLogin = [
    body('email')
        .trim().notEmpty().withMessage('Vui lòng nhập email')
        .isEmail().withMessage('Email không hợp lệ'),
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu'),
    handleValidation
];

// === PRODUCT VALIDATORS ===
const validateProduct = [
    body('name')
        .trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
    body('price')
        .notEmpty().withMessage('Giá không được để trống')
        .isNumeric().withMessage('Giá phải là số')
        .custom(val => val > 0).withMessage('Giá phải lớn hơn 0'),
    body('category')
        .trim().notEmpty().withMessage('Danh mục không được để trống'),
    handleValidation
];

// === ORDER VALIDATORS ===
const validateOrder = [
    body('user_id')
        .notEmpty().withMessage('Thiếu user_id'),
    body('customer_name')
        .trim().notEmpty().withMessage('Tên khách hàng không được để trống'),
    body('customer_phone')
        .trim().notEmpty().withMessage('Số điện thoại không được để trống'),
    body('items')
        .isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
    handleValidation
];

// === USER VALIDATORS ===
const validateChangePassword = [
    body('oldPassword')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu cũ'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải ít nhất 6 ký tự'),
    handleValidation
];

module.exports = {
    validateSignup, validateLogin,
    validateProduct, validateOrder,
    validateChangePassword
};
