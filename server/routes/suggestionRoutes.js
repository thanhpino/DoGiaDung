// routes/suggestionRoutes.js
const express = require('express');
const router = express.Router();
const { getComboSuggestion, getAdvancedComboSuggestion } = require('../controllers/suggestionController');

/**
 * @swagger
 * /api/suggestions/combo:
 *   post:
 *     tags: [Suggestion]
 *     summary: Gợi ý combo sản phẩm (CSP Backtracking Algorithm)
 *     description: Sử dụng thuật toán CSP + Forward Checking để tìm combo tối ưu trong ngân sách
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [budget, categories]
 *             properties:
 *               budget:
 *                 type: number
 *                 example: 5000000
 *                 description: Ngân sách tối đa (VNĐ)
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Nhà bếp", "Phòng khách"]
 *     responses:
 *       200:
 *         description: Danh sách combo gợi ý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 solutions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       items:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Product'
 *                       totalPrice:
 *                         type: number
 *                       remaining:
 *                         type: number
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     executionTime:
 *                       type: string
 *                     exploredNodes:
 *                       type: integer
 */
router.post('/suggestions/combo', getComboSuggestion);

/**
 * @swagger
 * /api/suggestions/combo-advanced:
 *   post:
 *     tags: [Suggestion]
 *     summary: Gợi ý combo nâng cao (thêm ràng buộc màu/thương hiệu)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budget:
 *                 type: number
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredColor:
 *                 type: string
 *               preferredBrand:
 *                 type: string
 *     responses:
 *       200:
 *         description: Combo nâng cao
 */
router.post('/suggestions/combo-advanced', getAdvancedComboSuggestion);

module.exports = router;