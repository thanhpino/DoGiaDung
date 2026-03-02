// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

// Security, Logging & Documentation
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Error Handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

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
    credentials: true
}));

// 🛡️ BẢO MẬT & LOGGING

// 1. Helmet: Bảo vệ Header
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// 2. Morgan + Winston: Ghi log chuyên nghiệp
app.use(morgan("combined", { stream: logger.stream }));

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
    logger.info(`⚡ Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
});

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📖 SWAGGER API DOCS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Gia Dụng TMT API Docs'
}));

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
        docs: '/api-docs',
        timestamp: new Date().toISOString()
    });
});

// 6. ERROR HANDLING (phải đặt SAU tất cả routes)
app.use(notFoundHandler);
app.use(errorHandler);

// 7. LẮNG NGHE PORT
const PORT = process.env.PORT || 8081;

if (require.main === module) {
    server.listen(PORT, () => {
        logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        logger.info(`📖 API Docs: http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;