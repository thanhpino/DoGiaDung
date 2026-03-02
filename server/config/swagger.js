// config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🏠 Gia Dụng TMT API',
            version: '2.0.0',
            description: `
API Documentation cho hệ thống Thương mại điện tử Gia Dụng TMT.

## Tính năng chính
- 🔐 **Authentication**: JWT-based (Bearer Token)
- 🛒 **Products**: CRUD sản phẩm (phân trang, tìm kiếm, lọc)
- 📦 **Orders**: Quản lý đơn hàng + real-time notification
- 👤 **Users**: Quản lý tài khoản + đổi mật khẩu
- 🤖 **Chatbot**: AI tư vấn sản phẩm
- 💳 **VNPay**: Thanh toán trực tuyến
- ⭐ **Reviews**: Đánh giá sản phẩm
- 📊 **Statistics**: Dashboard admin
- 💡 **Combo Suggestion**: Thuật toán CSP Backtracking

## Authentication
Sử dụng JWT Bearer Token. Gửi token trong header:
\`\`\`
Authorization: Bearer <token>
\`\`\`
            `,
            contact: {
                name: 'Trương Minh Thành',
                email: 'tt3145539@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:8081',
                description: 'Development Server'
            },
            {
                url: 'https://dogiadungtmt.onrender.com',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Nhập JWT token nhận được sau khi login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Nguyễn Văn A' },
                        email: { type: 'string', example: 'user@email.com' },
                        phone: { type: 'string', example: '0901234567' },
                        address: { type: 'string', example: '670/32 Đoàn Văn Bơ, Q.4' },
                        role: { type: 'string', enum: ['customer', 'admin'] },
                        avatar: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Nồi chiên không dầu' },
                        price: { type: 'number', example: 1500000 },
                        category: { type: 'string', example: 'Nhà bếp' },
                        image_url: { type: 'string' },
                        description: { type: 'string' },
                        is_deleted: { type: 'integer', enum: [0, 1] },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        customer_name: { type: 'string' },
                        customer_phone: { type: 'string' },
                        customer_address: { type: 'string' },
                        total_amount: { type: 'number' },
                        payment_method: { type: 'string' },
                        status: { type: 'string', enum: ['Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'] },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'Fail' },
                        message: { type: 'string', example: 'Lỗi xảy ra' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Đăng ký, Đăng nhập, Quên mật khẩu' },
            { name: 'Products', description: 'CRUD Sản phẩm' },
            { name: 'Orders', description: 'Quản lý đơn hàng' },
            { name: 'Users', description: 'Quản lý người dùng' },
            { name: 'Reviews', description: 'Đánh giá sản phẩm' },
            { name: 'Stats', description: 'Thống kê (Admin)' },
            { name: 'Chatbot', description: 'AI Chatbot tư vấn' },
            { name: 'Suggestion', description: 'Gợi ý Combo (CSP Algorithm)' },
            { name: 'VNPay', description: 'Thanh toán VNPay' }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
