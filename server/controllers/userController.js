// controllers/userController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const [data] = await db.query("SELECT id, name, email, phone, address, created_at FROM users WHERE role = 'customer'");
        return res.json(data);
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi tải danh sách user" });
    }
};

const getUserById = async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT id, name, email, phone, address, role, created_at, avatar, password FROM users WHERE id = ?",
            [req.params.id]
        );
        if (data.length === 0) return res.status(404).json("User not found");

        // Trả về kèm flag hasPassword (nếu password không rỗng)
        const user = data[0];
        const hasPassword = !!(user.password && user.password.trim() !== '');

        // Ẩn hash password đi trước khi gửi về client
        delete user.password;

        return res.json({ ...user, hasPassword });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        await db.query("UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?", [name, phone, address, req.params.id]);
        return res.json("Cập nhật thành công");
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi cập nhật" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.id;

        const [data] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (data.length === 0) return res.status(404).json("User not found");

        const currentPassword = data[0].password;
        const hasPassword = !!(currentPassword && currentPassword.trim() !== '');

        if (hasPassword) {
            // Nếu đã có mật khẩu, BẮT BUỘC phải gửi và check oldPassword
            if (!oldPassword) {
                return res.status(400).json({ status: "Fail", message: "Vui lòng nhập mật khẩu hiện tại" });
            }
            const isMatch = bcrypt.compareSync(oldPassword, currentPassword);
            if (!isMatch) return res.json({ status: "Fail", message: "Mật khẩu cũ không đúng" });
        }

        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);

        await db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, userId]);
        return res.json({ status: "Success", message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Lỗi server" });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, changePassword };