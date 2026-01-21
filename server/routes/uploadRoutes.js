const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const fs = require('fs');

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// API Upload Avatar
router.post('/upload-avatar/:userId', upload.single('avatar'), (req, res) => {
    const userId = req.params.userId;
    
    if (!req.file) return res.status(400).json("Chưa chọn file");

    const filename = `/uploads/${req.file.filename}`;

    // Lưu đường dẫn vào DB
    const sql = "UPDATE users SET avatar = ? WHERE id = ?";
    db.query(sql, [filename, userId], (err, result) => {
        if (err) {
            console.error("Lỗi update avatar vào DB:", err);
            return res.status(500).json({ error: "Lỗi Database", details: err });
        }
        return res.json({ status: "Success", url: filename });
    });
});

module.exports = router;