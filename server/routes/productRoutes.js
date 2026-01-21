// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

router.get('/products', getProducts);
router.get('/api/products/:id', getProductById);
router.post('/api/products', createProduct);
router.put('/api/products/:id', updateProduct);
router.delete('/api/products/:id', deleteProduct);

module.exports = router;