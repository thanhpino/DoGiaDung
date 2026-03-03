// controllers/oauthController.js
// Google OAuth Login — Verify ID Token & tạo/đăng nhập user
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../config/logger');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Tạo JWT Token (giống authController)
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * Google Login
 * Frontend gửi id_token từ Google Identity Services
 * Backend verify → tìm/tạo user → trả JWT
 */
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ status: "Fail", message: "Thiếu Google credential" });
        }

        // 1. Verify Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ status: "Fail", message: "Không lấy được email từ Google" });
        }

        // 2. Tìm user theo email
        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        let user;

        if (existingUsers.length > 0) {
            // User đã tồn tại → cập nhật provider info (merge account)
            user = existingUsers[0];

            // Cập nhật avatar + provider nếu chưa có
            if (!user.avatar_url || user.provider === 'local') {
                await db.query(
                    "UPDATE users SET avatar_url = COALESCE(avatar_url, ?), provider_id = COALESCE(provider_id, ?) WHERE id = ?",
                    [picture, googleId, user.id]
                );
                user.avatar_url = picture;
            }

            logger.info(`🔑 Google login (existing): ${email}`);
        } else {
            // User mới → tạo account (không cần password)
            const [result] = await db.query(
                "INSERT INTO users (name, email, password, role, provider, provider_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, email, '', 'customer', 'google', googleId, picture]
            );

            user = {
                id: result.insertId,
                name,
                email,
                role: 'customer',
                provider: 'google',
                provider_id: googleId,
                avatar_url: picture
            };

            logger.info(`🆕 Google login (new user): ${email}`);
        }

        // 3. Tạo JWT Token
        const token = generateToken(user);

        // 4. Trả response (loại bỏ password)
        const { password: _, reset_token: __, reset_expires: ___, ...userData } = user;

        return res.json({
            status: "Success",
            data: userData,
            token
        });

    } catch (err) {
        logger.error(`Google login error: ${err.message}`);

        if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
            return res.status(401).json({ status: "Fail", message: "Google token không hợp lệ hoặc đã hết hạn" });
        }

        return res.status(500).json({ status: "Error", message: "Lỗi đăng nhập Google" });
    }
};

module.exports = { googleLogin };
