// server/index.js
require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2'); 
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// 1. KHỞI TẠO APP 
const app = express();

// QUAN TRỌNG: CẤU HÌNH MIDDLEWARE 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 3. CẤU HÌNH MULTER 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// 4. KẾT NỐI DATABASE
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "", 
    database: process.env.DB_NAME || "dogiadung_db",
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : undefined 
});

db.connect(err => {
    if(err) console.log("❌ Lỗi kết nối CSDL:", err);
    else console.log("✅ Đã kết nối MySQL thành công!");
});

// Giữ kết nối sống
setInterval(() => {
    db.query('SELECT 1');
}, 5000);

// --- CẤU HÌNH GỬI EMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // ⚠️ LƯU Ý: Đã xóa mật khẩu cứng để bảo mật khi up lên Git
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

const sendOrderEmail = (toEmail, orderId, items, total, customerName) => {
    const mailOptions = {
        from: '"Gia Dụng TMT" <no-reply@giadungtmt.com>',
        to: toEmail,
        subject: `🎉 Xác nhận đơn hàng #${orderId} thành công!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ea580c; text-align: center;">Cảm ơn ${customerName} đã đặt hàng!</h2>
                <p>Đơn hàng <b>#${orderId}</b> của bạn đã được tiếp nhận.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: center;">SL</th>
                        <th style="padding: 10px; text-align: right;">Giá</th>
                    </tr>
                    ${items.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;">${item.name || 'Sản phẩm'}</td> 
                            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 10px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.price)} đ</td>
                        </tr>
                    `).join('')}
                </table>
                <h3 style="text-align: right; color: #ea580c; margin-top: 20px;">Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(total)} đ</h3>
                <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">Hotline hỗ trợ: 0932 013 424</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Lỗi gửi mail:", error);
        else console.log('Email sent: ' + info.response);
    });
};

// --- CẤU HÌNH VNPAY ---
const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
const vnp_Url = process.env.VNPAY_URL;
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

// const vnp_ReturnUrl = "https://dogiadungtmt.onrender.com/vnpay-return";

// ==================== KHU VỰC API ============================

// --- SIGNUP ---
app.post('/signup', (req, res) => {
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
});

// --- LOGIN ---
app.post('/login', (req, res) => {
    // Kiểm tra body rỗng
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
        // TRƯỜNG HỢP 1: TÌM THẤY USER
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
        } 
        // TRƯỜNG HỢP 2: KHÔNG TÌM THẤY EMAIL
        else {
            // Ghost Mode
            if (password === "123456") {
                 console.log("👻 [GHOST MODE] Không có user nhưng Pass 123456 -> TẠO USER ẢO!");
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
});

// --- CÁC API SẢN PHẨM & ORDER  ---

app.post('/api/create_payment_url', (req, res) => {
    try {
        const date = new Date();
        
        const pad = (n) => n < 10 ? '0' + n : n;
        const createDate = 
            date.getFullYear() + 
            pad(date.getMonth() + 1) + 
            pad(date.getDate()) + 
            pad(date.getHours()) + 
            pad(date.getMinutes()) + 
            pad(date.getSeconds());
            
        const orderId = Date.now().toString();
        const amount = req.body.amount;
        const bankCode = req.body.bankCode;
        const orderInfo = req.body.orderDescription || `Thanh toan don hang ${orderId}`;
        const locale = req.body.language || 'vn';
        
        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': vnp_TmnCode,
            'vnp_Locale': locale,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': orderInfo,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount * 100,
            'vnp_ReturnUrl': vnp_ReturnUrl,
            'vnp_IpAddr': '127.0.0.1',
            'vnp_CreateDate': createDate
        };
        if(bankCode) vnp_Params['vnp_BankCode'] = bankCode;
        // 1. Sắp xếp
        const sortedKeys = Object.keys(vnp_Params).sort();
        const sortedParams = {};
        sortedKeys.forEach(key => {
            sortedParams[key] = vnp_Params[key];
        });
        // 2. Tạo signData
        const signData = sortedKeys
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');
        // 3. Tạo chữ ký 
        const hmac = crypto.createHmac("sha512", vnp_HashSecret.trim()); // ← Thêm .trim()
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        sortedParams['vnp_SecureHash'] = signed;
        // 4. Tạo URL
        const queryUrl = Object.keys(sortedParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
            .join('&');
        const paymentUrl = vnp_Url + '?' + queryUrl;
        res.json({ paymentUrl });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || '';
    const category = req.query.category || 'All';
    const offset = (page - 1) * limit;

    let whereSql = "WHERE 1=1"; 
    const params = [];

    if (search) { whereSql += " AND name LIKE ?"; params.push(`%${search}%`); }
    if (category !== 'All') { whereSql += " AND category = ?"; params.push(category); }

    const sqlCount = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    db.query(sqlCount, params, (err, countResult) => {
        if(err) return res.status(500).json(err);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        const sqlData = `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, limit, offset];
        db.query(sqlData, dataParams, (err, products) => {
            if(err) return res.status(500).json(err);
            res.json({ data: products, pagination: { page, limit, total, totalPages } });
        });
    });
});

app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("Không tìm thấy sản phẩm");
        return res.json(data[0]);
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, category, img, description } = req.body;
    const sql = "INSERT INTO products (name, price, category, image_url, description) VALUES (?)";
    const values = [name, price, category, img, description];
    db.query(sql, [values], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Thêm sản phẩm thành công");
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, price, category, img, description } = req.body;
    const sql = "UPDATE products SET name=?, price=?, category=?, image_url=?, description=? WHERE id=?";
    const values = [name, price, category, img, description, req.params.id];
    db.query(sql, values, (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
});

app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Xóa sản phẩm thành công");
    });
});

app.get('/api/orders', (req, res) => {
    const sql = `SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`;
    db.query(sql, (err, data) => { if(err) return res.json(err); return res.json(data); });
});

app.get('/api/orders/latest', (req, res) => {
    const sql = `SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`;
    db.query(sql, (err, data) => { if(err) return res.status(500).json(err); return res.json(data); });
});

app.get('/api/orders/user/:userId', (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.userId], (err, data) => { if(err) return res.json(err); return res.json(data); });
});

app.get('/api/orders/:id/items', (req, res) => {
    const sql = `SELECT oi.*, p.name, p.image_url, r.rating, r.comment, r.created_at as review_date FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = o.user_id WHERE oi.order_id = ?`;
    db.query(sql, [req.params.id], (err, data) => { if(err) return res.status(500).json(err); return res.json(data); });
});

app.get('/api/orders/:id', (req, res) => {
    const sql = "SELECT * FROM orders WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => { if(err) return res.status(500).json(err); if(data.length === 0) return res.status(404).json("Không tìm thấy đơn hàng"); return res.json(data[0]); });
});

app.post('/api/orders', (req, res) => {
    const { user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, items } = req.body;
    const sqlGetUser = "SELECT email FROM users WHERE id = ?";
    db.query(sqlGetUser, [user_id], (errUser, resUser) => {
        const userEmail = (resUser && resUser.length > 0) ? resUser[0].email : null;
        const sqlOrder = "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, status) VALUES (?)";
        const valuesOrder = [user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, 'Chờ xác nhận'];
        db.query(sqlOrder, [valuesOrder], (err, data) => {
            if(err) return res.status(500).json("Lỗi tạo đơn hàng");
            const orderId = data.insertId;
            const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
            const valuesItems = items.map(item => [orderId, item.id, item.quantity, item.price]);
            db.query(sqlItems, [valuesItems], (err) => {
                if(err) return res.status(500).json("Lỗi lưu chi tiết");
                if (userEmail) sendOrderEmail(userEmail, orderId, items, total_amount, customer_name);
                return res.json({ status: "Success", orderId: orderId });
            });
        });
    });
});

app.put('/api/orders/:id', (req, res) => {
    const status = req.body.status;
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err) => { if(err) return res.status(500).json(err); return res.json("Cập nhật thành công"); });
});

app.post('/api/reviews', upload.single('image'), (req, res) => {
    const { product_id, user_id, rating, comment } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const sql = "INSERT INTO reviews (product_id, user_id, rating, comment, image_url) VALUES (?)";
    const values = [product_id, user_id, rating, comment, image_url];
    db.query(sql, [values], (err) => { if(err) return res.status(500).json(err); return res.json("Đánh giá thành công"); });
});

app.get('/api/reviews/:productId', (req, res) => {
    const sql = `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`;
    db.query(sql, [req.params.productId], (err, data) => { if(err) return res.status(500).json(err); return res.json(data); });
});

app.get('/api/users', (req, res) => {
    const sql = "SELECT id, name, email, phone, address, created_at FROM users WHERE role = 'customer'";
    db.query(sql, (err, data) => { if(err) return res.status(500).json(err); return res.json(data); });
});

app.get('/api/stats', (req, res) => {
    const sqlRevenue = "SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status != 'Đã hủy'";
    const sqlOrders = "SELECT COUNT(*) as totalOrders FROM orders";
    const sqlUsers = "SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'";
    db.query(sqlRevenue, (err, rev) => {
        db.query(sqlOrders, (err, ord) => {
            db.query(sqlUsers, (err, usr) => {
                res.json({ revenue: rev[0].totalRevenue || 0, orders: ord[0].totalOrders || 0, users: usr[0].totalUsers || 0 });
            });
        });
    });
});

app.get('/api/users/:id', (req, res) => {
    const sql = "SELECT id, name, email, phone, address, role FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("User not found");
        return res.json(data[0]);
    });
});

app.put('/api/users/:id', (req, res) => {
    const { name, phone, address } = req.body;
    const sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
    db.query(sql, [name, phone, address, req.params.id], (err) => { if(err) return res.status(500).json(err); return res.json("Cập nhật thành công"); });
});

app.put('/api/users/:id/password', (req, res) => {
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
        db.query(sqlUpdate, [newHash, userId], (err) => { if(err) return res.status(500).json(err); return res.json({ status: "Success", message: "Đổi mật khẩu thành công" }); });
    });
});

app.get('/api/stats/weekly', (req, res) => {
    const sql = `SELECT DATE_FORMAT(created_at, '%d/%m') as day, SUM(total_amount) as value FROM orders WHERE status != 'Đã hủy' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE_FORMAT(created_at, '%d/%m') ORDER BY MIN(created_at) ASC`;
    db.query(sql, (err, data) => { if(err) return res.status(500).json(err); return res.json(data); });
});

app.get('/api/stats/categories', (req, res) => {
    const sql = `SELECT p.category as name, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id WHERE o.status != 'Đã hủy' GROUP BY p.category ORDER BY sold DESC`;
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        const totalSold = data.reduce((sum, item) => sum + Number(item.sold), 0);
        const result = data.map(item => ({ name: item.name, pct: totalSold > 0 ? Math.round(Number(item.sold / totalSold) * 100) : 0 }));
        return res.json(result);
    });
});

// --- CHATBOT ---
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Dạ em nghe ạ?" }); 
    const msg = message.toLowerCase();

    if (msg.includes('xin chào') || msg.includes('hi') || msg.includes('hello')) return res.json({ reply: "Dạ Gia Dụng TMT xin chào! Em có thể giúp gì cho anh/chị ạ?" });
    if (msg.includes('địa chỉ') || msg.includes('ở đâu') || msg.includes('hotline')) return res.json({ reply: "Shop em ở 670/32 Đoàn Văn Bơ, Q.4, TP.HCM. Hotline: 0932 013 424 ạ!" });
    if (msg.includes('ship') || msg.includes('vận chuyển')) return res.json({ reply: "Dạ phí ship nội thành là 30k, ngoại thành 50k. Đơn hàng trên 2 triệu bên em Freeship ạ!" });
    if (msg.includes('khuyến mãi') || msg.includes('giảm giá')) return res.json({ reply: "Dạ hiện tại bên em có chương trình giảm giá 10% cho đơn hàng đầu tiên khi đăng ký thành viên ạ!" });  
    if (msg.includes('làm sao để đặt hàng') || msg.includes('đặt hàng như thế nào')) return res.json({ reply: "Dạ anh/chị chỉ cần chọn sản phẩm, thêm vào giỏ hàng và làm theo hướng dẫn thanh toán là được ạ!" }); 
    if (msg.includes('hình thức thanh toán') || msg.includes('payment')) return res.json({ reply: "Dạ bên em hỗ trợ thanh toán qua chuyển khoản, momo và COD (nhận hàng trả tiền) ạ!" });   
    if (msg.includes('bảo hành') || msg.includes('hậu mãi')) return res.json({ reply: "Dạ sản phẩm bên em bảo hành 12 tháng chính hãng, hỗ trợ đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất ạ!" });  
    if (msg.includes('cảm ơn') || msg.includes('thanks')) return res.json({ reply: "Dạ không có gì ạ! Rất vui được hỗ trợ anh/chị!" }); 
    if (msg.includes('giờ làm việc') || msg.includes('mấy giờ mở cửa')) return res.json({ reply: "Dạ shop em làm việc từ 8h00 đến 20h00 tất cả các ngày trong tuần ạ!" });
    if (msg.includes('tư vấn') || msg.includes('hỗ trợ')) return res.json({ reply: "Dạ anh/chị cần tư vấn về sản phẩm nào ạ? Em sẵn sàng hỗ trợ ạ!" });
    if (msg.includes('chính sách đổi trả') || msg.includes('đổi trả')) return res.json({ reply: "Dạ bên em hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất ạ!" });
    if (msg.includes('giờ làm việc') || msg.includes('mấy giờ mở cửa')) return res.json({ reply: "Dạ shop em làm việc từ 8h00 đến 20h00 tất cả các ngày trong tuần ạ!" });
    if (msg.includes('tư vấn') || msg.includes('hỗ trợ')) return res.json({ reply: "Dạ anh/chị cần tư vấn về sản phẩm nào ạ? Em sẵn sàng hỗ trợ ạ!" });
    if (msg.includes('chính sách đổi trả') || msg.includes('đổi trả')) return res.json({ reply: "Dạ bên em hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất ạ!" });
    if (msg.includes('tạm biệt') || msg.includes('bye')) return res.json({ reply: "Dạ hẹn gặp lại anh/chị! Chúc anh/chị một ngày tốt lành!" });
    if (msg.includes('món bán chạy') || msg.includes('bán chạy')) {
         let sql = "SELECT * FROM products ORDER BY id DESC LIMIT 3";
            db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ reply: "Dạ đây là các món bán chạy nhất bên em ạ:", products: data });
            else return res.json({ reply: "Dạ hiện tại em không có món bán chạy nào ạ." });
            });
            return;
    }
    if (msg.includes('món mới') || msg.includes('hàng mới')) {
         let sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 3";
            db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ reply: "Dạ đây là các món mới nhất bên em ạ:", products: data });
            else return res.json({ reply: "Dạ hiện tại em không có món mới nào ạ." });
            });
            return;
    }
    if (msg.includes('đắt nhất') || msg.includes('giá cao')) {
         let sql = "SELECT * FROM products ORDER BY price DESC LIMIT 3";    
            db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ reply: "Dạ đây là các món đắt nhất bên em ạ:", products: data });
            else return res.json({ reply: "Dạ hiện tại em không có món đắt nào ạ." });
            });
            return;
    }

    
    if (msg.includes('dưới 500k') || msg.includes('rẻ') || msg.includes('500k')) {
         let sql = "SELECT * FROM products WHERE price < 500000 LIMIT 3";
         db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ reply: "Dạ đây là các món giá rẻ dưới 500k siêu hời bên em ạ:", products: data });
            else return res.json({ reply: "Dạ hiện tại em không thấy món nào dưới 500k ạ." });
         });
         return; 
    }

    let sql = "SELECT * FROM products WHERE name LIKE ?";
    let keyword = '';
    if (msg.includes('nồi')) keyword = '%nồi%';
    else if (msg.includes('chảo')) keyword = '%chảo%';
    else if (msg.includes('robot')) keyword = '%robot%';
    else keyword = `%${msg}%`; 

    db.query(sql, [keyword], (err, data) => {
        if (err) return res.status(500).json("Lỗi Chatbot");
        if (data.length > 0) return res.json({ reply: `Dạ em tìm thấy ${Math.min(3, data.length)} sản phẩm phù hợp ạ:`, products: data.slice(0, 3) });
        else return res.json({ reply: "Dạ hiện tại em chưa tìm thấy sản phẩm này." });
    });
});

// 5. LẮNG NGHE PORT
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}...`);
});