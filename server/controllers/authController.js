// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/emailService');

// Helper: Tạo JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const sql = "INSERT INTO users (name, email, password, role) VALUES (?)";
        const values = [name, email, hashedPassword, 'customer'];

        await db.query(sql, [values]);
        return res.json({ status: "Success", message: "Đăng ký thành công" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ status: "Fail", message: "Email đã tồn tại" });
        return res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const login = async (req, res) => {
    try {
        const email = req.body.email.trim();
        const password = req.body.password;

        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (data.length === 0) {
            return res.json({ status: "Fail", message: "Email không tồn tại" });
        }

        const user = data[0];
        const checkPass = bcrypt.compareSync(password, user.password);
        if (!checkPass) {
            return res.json({ status: "Fail", message: "Sai mật khẩu" });
        }

        const token = generateToken(user);
        const { password: userPass, reset_token, reset_expires, ...userData } = user;
        return res.json({ status: "Success", data: userData, token });
    } catch (err) {
        return res.status(500).json({ status: "Error", message: "Lỗi DB" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ status: "Fail", message: "Vui lòng nhập email" });

        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (data.length === 0) return res.json({ status: "Fail", message: "Email không tồn tại trong hệ thống" });

        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000;

        await db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [token, expires, email]);
        sendResetPasswordEmail(email, token);
        return res.json({ status: "Success", message: "Đã gửi hướng dẫn vào email của bạn!" });
    } catch (err) {
        return res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const [data] = await db.query("SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?", [token, Date.now()]);
        if (data.length === 0) {
            return res.json({ status: "Fail", message: "Link đổi mật khẩu không hợp lệ hoặc đã hết hạn" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        await db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hashedPassword, data[0].id]);
        return res.json({ status: "Success", message: "Đổi mật khẩu thành công! Hãy đăng nhập lại." });
    } catch (err) {
        return res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

module.exports = { signup, login, forgotPassword, resetPassword };