const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Lưu vào thư mục uploads
    },
    filename: (req, file, cb) => {
        // Đặt tên file: avatar-ID-Timestamp.jpg
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// API Upload Avatar
router.post('/upload-avatar/:userId', upload.single('avatar'), (req, res) => {
    const userId = req.params.userId;
    const filename = req.file ? `/uploads/${req.file.filename}` : null;

    if (!filename) return res.status(400).json("Chưa chọn file");

    // Lưu đường dẫn vào DB
    const sql = "UPDATE users SET avatar = ? WHERE id = ?";
    db.query(sql, [filename, userId], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success", url: filename });
    });
});

module.exports = router;