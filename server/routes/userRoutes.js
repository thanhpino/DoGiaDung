// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    changePassword
} = require('../controllers/userController');

router.get('/api/users', getAllUsers);
router.get('/api/users/:id', getUserById);
router.put('/api/users/:id', updateUser);
router.put('/api/users/:id/password', changePassword);

module.exports = router;