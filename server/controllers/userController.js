// controllers/userController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const getAllUsers = (req, res) => {
    const sql = "SELECT id, name, email, phone, address, created_at FROM users WHERE role = 'customer'";
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
};

const getUserById = (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT id, name, email, phone, address, role, created_at, avatar FROM users WHERE id = ?";
    
    db.query(sql, [userId], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("User not found");
        return res.json(data[0]); 
    });
};

const updateUser = (req, res) => {
    const { name, phone, address } = req.body;
    const sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
    
    db.query(sql, [name, phone, address, req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
};

const changePassword = (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    const sqlGet = "SELECT password FROM users WHERE id = ?";
    db.query(sqlGet, [userId], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("User not found");
        
        const currentHash = data[0].password;
        const isMatch = bcrypt.compareSync(oldPassword, currentHash);
        
        if(!isMatch) return res.json({ status: "Fail", message: "Mật khẩu cũ không đúng" });
        
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);
        
        const sqlUpdate = "UPDATE users SET password = ? WHERE id = ?";
        db.query(sqlUpdate, [newHash, userId], (err) => {
            if(err) return res.status(500).json(err);
            return res.json({ status: "Success", message: "Đổi mật khẩu thành công" });
        });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    changePassword
};