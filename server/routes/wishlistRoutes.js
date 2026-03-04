// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getWishlist, addToWishlist, removeFromWishlist, getWishlistIds } = require('../controllers/wishlistController');

router.get('/api/wishlist', verifyToken, getWishlist);
router.get('/api/wishlist/ids', verifyToken, getWishlistIds);
router.post('/api/wishlist', verifyToken, addToWishlist);
router.delete('/api/wishlist/:productId', verifyToken, removeFromWishlist);

module.exports = router;
