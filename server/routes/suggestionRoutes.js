// routes/suggestionRoutes.js
const express = require('express');
const router = express.Router();
const {
    getComboSuggestion,
    getAdvancedComboSuggestion
} = require('../controllers/suggestionController');

// Tìm combo dựa trên ngân sách + danh mục
router.post('/suggestions/combo', getComboSuggestion);

// Thêm ràng buộc màu sắc & thương hiệu
router.post('/suggestions/combo-advanced', getAdvancedComboSuggestion);
module.exports = router;