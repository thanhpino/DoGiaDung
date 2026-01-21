// routes/vnpayRoutes.js
const express = require('express');
const router = express.Router();
const { createPaymentUrl } = require('../controllers/vnpayController');

router.post('/api/create_payment_url', createPaymentUrl);

module.exports = router;