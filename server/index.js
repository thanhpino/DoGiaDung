// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

// Security and logging middlewares
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database & Routes
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const vnpayRoutes = require('./routes/vnpayRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

// Import order controller
const { setSocketIO } = require('./controllers/orderController');

// 1. KHỞI TẠO APP
const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// CẤU HÌNH CORS
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://dogiadung-vwp8.onrender.com",
        process.env.CLIENT_URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Cho phép gửi cookie nếu cần
}));

// 🛡️ BẢO MẬT & LOGGING

// 1. Helmet: Bảo vệ Header
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// 2. Morgan: Ghi log
app.use(morgan("common"));

// 3. Rate Limit: Chống spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 2000, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "🚫 Bạn gửi quá nhiều request, vui lòng thử lại sau 15 phút!"
});
app.use(limiter);

// 🔌 SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://dogiadung-vwp8.onrender.com",
            process.env.CLIENT_URL
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

setSocketIO(io);

io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
    });
});

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ĐĂNG KÝ ROUTES
app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', reviewRoutes);
app.use('/', userRoutes);
app.use('/', statsRoutes);
app.use('/', chatbotRoutes);
app.use('/', vnpayRoutes);
app.use('/', uploadRoutes);
app.use('/api', suggestionRoutes);

// 5. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Gia Dụng TMT API is running!',
        timestamp: new Date().toISOString()
    });
});

// 6. LẮNG NGHE PORT
const PORT = process.env.PORT || 8081;

if (require.main === module) {
    server.listen(PORT, () => {
    });
}

module.exports = app;