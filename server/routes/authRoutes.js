// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validators');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;