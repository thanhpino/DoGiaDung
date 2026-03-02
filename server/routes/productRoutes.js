// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateProduct } = require('../middleware/validators');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Public: Xem sản phẩm
router.get('/products', getProducts);
router.get('/api/products/:id', getProductById);

// Admin only: Thêm/Sửa/Xóa sản phẩm (có validation)
router.post('/api/products', verifyToken, verifyAdmin, validateProduct, createProduct);
router.put('/api/products/:id', verifyToken, verifyAdmin, validateProduct, updateProduct);
router.delete('/api/products/:id', verifyToken, verifyAdmin, deleteProduct);

module.exports = router;