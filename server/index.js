// server/index.js
require('dotenv').config(); // Load biến môi trường từ .env
const express = require('express');
const mysql = require('mysql'); 
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// 1. KHỞI TẠO APP 
const app = express();

// 2. CẤU HÌNH MIDDLEWARE
app.use(cors());
app.use(express.json());
// Phục vụ file tĩnh từ thư mục 'uploads'
app.use('/uploads', express.static('uploads'));

// 3. CẤU HÌNH MULTER 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        // Đặt tên file = timestamp + đuôi file gốc
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// 4. KẾT NỐI DATABASE
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "@Thanhquynh170456",
    database: process.env.DB_NAME || "dogiadung_db",
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : undefined 
});

db.connect(err => {
    if(err) console.log("Lỗi kết nối CSDL:", err);
    else console.log("Đã kết nối MySQL thành công!");
});

setInterval(() => {
    db.query('SELECT 1');
}, 5000);

// --- CẤU HÌNH GỬI EMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Ưu tiên lấy từ biến môi trường, không có thì lấy chuỗi cứng (khi chạy local)
        user: process.env.EMAIL_USER || 'tt3145539@gmail.com', 
        pass: process.env.EMAIL_PASS || 'xonjfzwxxmlvlghi' 
    }
});
// Hàm gửi email (Viết riêng cho gọn)
const sendOrderEmail = (toEmail, orderId, items, total, customerName) => {
    const mailOptions = {
        from: '"Gia Dụng TMT" <no-reply@giadungtmt.com>',
        to: toEmail,
        subject: `🎉 Xác nhận đơn hàng #${orderId} thành công!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ea580c; text-align: center;">Cảm ơn ${customerName} đã đặt hàng!</h2>
                <p>Đơn hàng <b>#${orderId}</b> của bạn đã được tiếp nhận và đang chờ xử lý.</p>
                
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
                
                <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                    Đây là email tự động, vui lòng không trả lời.<br/>
                    Hotline hỗ trợ: 0932 013 424
                </p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Lỗi gửi mail:", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
// ==================== KHU VỰC API ============================

// --- 1. AUTH (ĐĂNG NHẬP / ĐĂNG KÝ) ---

app.post('/signup', (req, res) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?)";
    const values = [req.body.name, req.body.email, hashedPassword, 'customer'];

    db.query(sql, [values], (err, data) => {
        if(err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json("Email đã tồn tại");
            return res.status(500).json(err);
        }
        return res.json("Đăng ký thành công");
    });
});

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [req.body.email], (err, data) => {
        if(err) return res.status(500).json("Lỗi server");
        
        if(data.length > 0) {
            const user = data[0];
            const checkPass = bcrypt.compareSync(req.body.password, user.password);
            
            if (!checkPass) return res.json({ status: "Fail", message: "Sai mật khẩu" });

            return res.json({
                status: "Success",
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            return res.json({ status: "Fail", message: "Email không tồn tại" });
        }
    });
});

// --- 2. SẢN PHẨM (PRODUCTS) ---

// Lấy danh sách sản phẩm 
app.get('/products', (req, res) => {
    // 1. Lấy tham số phân trang và lọc từ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; // Mặc định 8 sản phẩm/trang
    const search = req.query.search || '';
    const category = req.query.category || 'All';
    const offset = (page - 1) * limit;

    // 2. Xây dựng câu WHERE động dựa trên bộ lọc
    let whereSql = "WHERE 1=1"; 
    const params = [];

    if (search) {
        whereSql += " AND name LIKE ?";
        params.push(`%${search}%`); // Tìm kiếm gần đúng
    }

    if (category !== 'All') {
        whereSql += " AND category = ?";
        params.push(category);
    }

    // 3. Query 1: Đếm tổng số lượng 
    const sqlCount = `SELECT COUNT(*) as total FROM products ${whereSql}`;

    db.query(sqlCount, params, (err, countResult) => {
        if(err) return res.status(500).json(err);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // 4. Query 2: Lấy dữ liệu phân trang
        const sqlData = `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        
        // Thêm limit và offset vào mảng tham số cho query dữ liệu
        const dataParams = [...params, limit, offset];

        db.query(sqlData, dataParams, (err, products) => {
            if(err) return res.status(500).json(err);
            
            // Trả về cấu trúc mới: { data, pagination }
            res.json({
                data: products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        });
    });
});

// Lấy chi tiết 1 sản phẩm
app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("Không tìm thấy sản phẩm");
        return res.json(data[0]);
    });
});

// Thêm sản phẩm (Admin)
app.post('/api/products', (req, res) => {
    const { name, price, category, img, description } = req.body;
    const sql = "INSERT INTO products (name, price, category, image_url, description) VALUES (?)";
    const values = [name, price, category, img, description];
    db.query(sql, [values], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Thêm sản phẩm thành công");
    });
});

// API Cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { name, price, category, img, description } = req.body;
    // Câu lệnh SQL cập nhật
    const sql = "UPDATE products SET name=?, price=?, category=?, image_url=?, description=? WHERE id=?";
    const values = [name, price, category, img, description, req.params.id];
    
    db.query(sql, values, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
});


// Xóa sản phẩm (Admin)
app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Xóa sản phẩm thành công");
    });
});

// --- 3. ĐƠN HÀNG (ORDERS) ---

// Lấy danh sách tất cả đơn hàng (Admin)
app.get('/api/orders', (req, res) => {
    const sql = `
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `;
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

// Lấy 5 đơn mới nhất (Dashboard Admin)
app.get('/api/orders/latest', (req, res) => {
    const sql = `
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 5
    `;
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Lấy lịch sử đơn hàng của 1 User
app.get('/api/orders/user/:userId', (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.userId], (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

// Lấy danh sách sản phẩm của 1 đơn hàng (Kèm thông tin Review nếu có)
app.get('/api/orders/:id/items', (req, res) => {
    const sql = `
        SELECT oi.*, p.name, p.image_url, 
               r.rating, r.comment, r.created_at as review_date
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = o.user_id
        WHERE oi.order_id = ?
    `;
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Lấy thông tin chi tiết 1 đơn hàng (để in hóa đơn)
app.get('/api/orders/:id', (req, res) => {
    const sql = "SELECT * FROM orders WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("Không tìm thấy đơn hàng");
        return res.json(data[0]);
    });
});

// Tạo đơn hàng mới
// --- SỬA API TẠO ĐƠN HÀNG ĐỂ GỌI HÀM GỬI MAIL ---
app.post('/api/orders', (req, res) => {
    const { 
        user_id, customer_name, customer_phone, customer_address, 
        total_amount, payment_method, note, items 
    } = req.body;

    // --- BƯỚC QUAN TRỌNG: Cần lấy email của user để gửi ---
    // (Trong thực tế nên lưu email vào bảng orders luôn, nhưng giờ mình query tạm từ bảng users)
    const sqlGetUser = "SELECT email FROM users WHERE id = ?";
    
    db.query(sqlGetUser, [user_id], (errUser, resUser) => {
        // Dù lỗi lấy user hay không, vẫn phải tạo đơn hàng bình thường
        const userEmail = (resUser && resUser.length > 0) ? resUser[0].email : null;

        const sqlOrder = "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, status) VALUES (?)";
        const valuesOrder = [user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, note, 'Chờ xác nhận'];

        db.query(sqlOrder, [valuesOrder], (err, data) => {
            if(err) {
                console.error("Lỗi tạo đơn:", err);
                return res.status(500).json("Lỗi tạo đơn hàng");
            }
            
            const orderId = data.insertId;
            const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
            const valuesItems = items.map(item => [orderId, item.id, item.quantity, item.price]);

            db.query(sqlItems, [valuesItems], (err, data) => {
                if(err) return res.status(500).json("Lỗi lưu chi tiết");
                
                // ===> GỬI EMAIL Ở ĐÂY <===
                if (userEmail) {
                    // Cần gửi cả tên sản phẩm vào hàm email, nhưng items từ frontend gửi lên thường chỉ có ID.
                    // Để đơn giản, bro nên đảm bảo frontend gửi cả {id, name, price, quantity} trong mảng items.
                    // Nếu frontend checkout của bro đã có name trong cartItems thì OK.
                    sendOrderEmail(userEmail, orderId, items, total_amount, customer_name);
                }

                return res.json({ status: "Success", orderId: orderId });
            });
        });
    });
});

// Cập nhật trạng thái đơn (Admin)
app.put('/api/orders/:id', (req, res) => {
    const status = req.body.status;
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
});

// --- 4. ĐÁNH GIÁ (REVIEWS) ---

// Gửi đánh giá (Có ảnh)
app.post('/api/reviews', upload.single('image'), (req, res) => {
    const { product_id, user_id, rating, comment } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO reviews (product_id, user_id, rating, comment, image_url) VALUES (?)";
    const values = [product_id, user_id, rating, comment, image_url];

    db.query(sql, [values], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Đánh giá thành công");
    });
});

// Lấy đánh giá của 1 sản phẩm
app.get('/api/reviews/:productId', (req, res) => {
    const sql = `
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC
    `;
    db.query(sql, [req.params.productId], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- 5. KHÁCH HÀNG & THỐNG KÊ ---

// Lấy danh sách khách hàng
app.get('/api/users', (req, res) => {
    const sql = "SELECT id, name, email, phone, address, created_at FROM users WHERE role = 'customer'";
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Thống kê Dashboard
app.get('/api/stats', (req, res) => {
    const sqlRevenue = "SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status != 'Đã hủy'";
    const sqlOrders = "SELECT COUNT(*) as totalOrders FROM orders";
    const sqlUsers = "SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'";

    db.query(sqlRevenue, (err, rev) => {
        db.query(sqlOrders, (err, ord) => {
            db.query(sqlUsers, (err, usr) => {
                res.json({
                    revenue: rev[0].totalRevenue || 0,
                    orders: ord[0].totalOrders || 0,
                    users: usr[0].totalUsers || 0
                });
            });
        });
    });
});

// ================= API USER PROFILE =================

// 1. Lấy thông tin chi tiết User (Trừ mật khẩu)
app.get('/api/users/:id', (req, res) => {
    const sql = "SELECT id, name, email, phone, address, role FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("User not found");
        return res.json(data[0]);
    });
});

// 2. Cập nhật thông tin cá nhân (Tên, SĐT, Địa chỉ)
app.put('/api/users/:id', (req, res) => {
    const { name, phone, address } = req.body;
    const sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
    db.query(sql, [name, phone, address, req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
});

// 3. Đổi mật khẩu
app.put('/api/users/:id/password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Bước 1: Lấy mật khẩu cũ trong DB ra để check
    const sqlGet = "SELECT password FROM users WHERE id = ?";
    db.query(sqlGet, [userId], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("User not found");

        const currentHash = data[0].password;
        
        // Bước 2: So sánh mật khẩu cũ nhập vào với Hash trong DB
        const isMatch = bcrypt.compareSync(oldPassword, currentHash);
        if(!isMatch) return res.json({ status: "Fail", message: "Mật khẩu cũ không đúng" });

        // Bước 3: Nếu đúng, mã hóa mật khẩu mới và lưu lại
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);
        
        const sqlUpdate = "UPDATE users SET password = ? WHERE id = ?";
        db.query(sqlUpdate, [newHash, userId], (err, result) => {
            if(err) return res.status(500).json(err);
            return res.json({ status: "Success", message: "Đổi mật khẩu thành công" });
        });
    });
});

// 1. API BIỂU ĐỒ DOANH THU THEO TUẦN
app.get('/api/stats/weekly', (req, res) => {
    const sql = `
        SELECT 
            DATE_FORMAT(created_at, '%d/%m') as day, 
            SUM(total_amount) as value 
        FROM orders 
        WHERE status != 'Đã hủy' 
          AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
        GROUP BY DATE_FORMAT(created_at, '%d/%m')
        ORDER BY MIN(created_at) ASC 
    `; 
    
    db.query(sql, (err, data) => {
        if(err) {
            console.error("Lỗi SQL Weekly:", err); // Log lỗi ra terminal để dễ debug
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

// 2. API TOP DANH MỤC BÁN CHẠY
app.get('/api/stats/categories', (req, res) => {
    const sql = `
        SELECT 
            p.category as name, 
            SUM(oi.quantity) as sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'Đã hủy'
        GROUP BY p.category
        ORDER BY sold DESC
    `;
    db.query(sql, (err, data) => {
        if(err) {
            console.error("Lỗi SQL Category:", err);
            return res.status(500).json(err);
        }
        
        const totalSold = data.reduce((sum, item) => sum + item.sold, 0);
        const result = data.map(item => ({
            name: item.name,
            pct: totalSold > 0 ? Math.round((item.sold / totalSold) * 100) : 0
        }));
        
        return res.json(result);
    });
});

// --- 6. CHATBOT AI  ---
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const msg = message.toLowerCase();

    // Logic 1: Chào hỏi
    if (msg.includes('xin chào') || msg.includes('hi') || msg.includes('hello')) {
        return res.json({ reply: "Dạ Gia Dụng TMT xin chào! Em có thể giúp gì cho anh/chị ạ? (Em biết tìm nồi, chảo, hàng giá rẻ...)" });
    }

    // Logic 2: Địa chỉ / Liên hệ
    if (msg.includes('địa chỉ') || msg.includes('ở đâu') || msg.includes('hotline')) {
        return res.json({ reply: "Shop em ở 670/32 Đoàn Văn Bơ, Q.4, TP.HCM. Hotline: 0932 013 424 ạ!" });
    }

    // Logic 3: Phí ship
    if (msg.includes('ship') || msg.includes('vận chuyển')) {
        return res.json({ reply: "Dạ phí ship nội thành là 30k, ngoại thành 50k. Đơn hàng trên 2 triệu bên em Freeship ạ!" });
    }

    // Logic 4: Tìm hàng giá rẻ (Dưới 500k)
    if (msg.includes('dưới 500k') || msg.includes('rẻ') || msg.includes('500k')) {
         let sql = "SELECT * FROM products WHERE price < 500000 LIMIT 3";
         db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) {
                return res.json({ 
                    reply: "Dạ đây là các món giá rẻ dưới 500k siêu hời bên em ạ:", 
                    products: data // Gửi kèm dữ liệu sản phẩm
                });
            } else {
                 return res.json({ reply: "Dạ hiện tại em không thấy món nào dưới 500k ạ." });
            }
         });
         return; 
    }

    // Logic 5: TƯ VẤN SẢN PHẨM THEO TỪ KHÓA
    let sql = "SELECT * FROM products WHERE name LIKE ?";
    let keyword = '';

    if (msg.includes('nồi')) keyword = '%nồi%';
    else if (msg.includes('chảo')) keyword = '%chảo%';
    else if (msg.includes('robot') || msg.includes('hút bụi')) keyword = '%robot%';
    else if (msg.includes('máy ép')) keyword = '%ép%';
    else if (msg.includes('quạt')) keyword = '%quạt%';
    else if (msg.includes('ấm siêu tốc') || msg.includes('bình siêu tốc')) keyword = '%ấm%';
    else if (msg.includes('nồi chiên')) keyword = '%chiên%';
    else if (msg.includes('bếp từ') || msg.includes('bếp điện từ')) keyword = '%bếp từ%';
    else if (msg.includes('bếp gas')) keyword = '%bếp gas%';
    else if (msg.includes('lò vi sóng')) keyword = '%lò vi sóng%';
    else if (msg.includes('lò nướng')) keyword = '%lò nướng%';
    else if (msg.includes('máy xay')) keyword = '%xay%';
    else if (msg.includes('máy lọc không khí')) keyword = '%lọc không khí%';
    else if (msg.includes('máy nước nóng')) keyword = '%nước nóng%';
    else if (msg.includes('tủ lạnh')) keyword = '%tủ lạnh%';
    else if (msg.includes('máy giặt')) keyword = '%giặt%';
    else if (msg.includes('máy rửa chén')) keyword = '%rửa chén%';
    else if  (msg.includes('đồ gia dụng')) keyword = '%đồ gia dụng%';

    else keyword = `%${msg}%`; 

    db.query(sql, [keyword], (err, data) => {
        if (err) return res.status(500).json("Lỗi Chatbot");

        if (data.length > 0) {
            const products = data.slice(0, 3); // Lấy 3 sản phẩm
            return res.json({ 
                reply: `Dạ em tìm thấy ${data.length} sản phẩm phù hợp ạ:`,
                products: products 
            });
        } else {
            return res.json({ reply: "Dạ hiện tại em chưa tìm thấy sản phẩm này. Anh/chị thử tìm từ khóa ngắn gọn hơn như 'nồi', 'chảo' xem sao ạ?" });
        }
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}...`);
});