const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');

jest.setTimeout(15000);

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

// ============================================
// PHẦN 1: KIỂM TRA AUTHENTICATION (AUTH)
// ============================================
describe('KIỂM TRA AUTH API', () => {

    // --- SIGNUP ---
    test('POST /signup - Thiếu field → 400', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ email: 'test@test.com' }); // thiếu name, password
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual('Fail');
    });

    test('POST /signup - Email không hợp lệ → 400', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ name: 'Test', email: 'not-email', password: '123456' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual('Fail');
    });

    test('POST /signup - Password quá ngắn → 400', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ name: 'Test', email: 'test@test.com', password: '123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('6 ký tự');
    });

    // --- LOGIN ---
    test('POST /login - Thiếu email → 400', async () => {
        const res = await request(app)
            .post('/login')
            .send({ password: '123456' }); // thiếu email
        expect(res.statusCode).toEqual(400);
    });

    test('POST /login - Email không tồn tại → Fail', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'nonexistent999@email.com', password: '123456' });
        expect(res.body.status).toEqual('Fail');
    });

    test('POST /login - Sai mật khẩu hoặc email → Fail', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'tt3145539@gmail.com', password: 'wrongpassword123' });
        expect(res.body.status).toEqual('Fail');
    });

    test('POST /login - Đăng nhập thành công (nếu tài khoản tồn tại) → trả về token', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'tt3145539@gmail.com', password: '@Thanhquynh170456' });

        expect(res.statusCode).toEqual(200);
        // Kiểm tra response có đúng format không
        expect(res.body).toHaveProperty('status');
        // Nếu tài khoản tồn tại và password đúng → có token
        if (res.body.status === 'Success') {
            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');
            expect(res.body).toHaveProperty('data');
        }
    });

    // --- PROTECTED ROUTE ---
    test('GET /api/users - Không có token → 401', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/users - Token sai → 401', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer invalidtoken123');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/users - Token hết hạn → 401', async () => {
        const expiredToken = jwt.sign(
            { id: 1, email: 'test@test.com', role: 'admin' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '-10s' }
        );
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(res.statusCode).toEqual(401);
    });
});

// ============================================
// PHẦN 2: KIỂM TRA PRODUCT CRUD
// ============================================
describe('KIỂM TRA PRODUCT API', () => {

    // --- PUBLIC: GET SẢN PHẨM ---
    test('GET /products - Trả về danh sách sản phẩm 200', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
    });

    test('GET /products?limit=3 - Phân trang hoạt động', async () => {
        const res = await request(app).get('/products?limit=3');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBeLessThanOrEqual(3);
    });

    test('GET /api/products/:id - Lấy sản phẩm theo ID', async () => {
        // Lấy ID sản phẩm đầu tiên
        const listRes = await request(app).get('/products?limit=1');
        if (listRes.body.data && listRes.body.data.length > 0) {
            const productId = listRes.body.data[0].id;
            const res = await request(app).get(`/api/products/${productId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('price');
        }
    });

    test('GET /api/products/99999 - Sản phẩm không tồn tại → 404', async () => {
        const res = await request(app).get('/api/products/99999');
        expect(res.statusCode).toEqual(404);
    });

    // --- PROTECTED: CẦN TOKEN ---
    test('POST /api/products - Không có token → 401', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ name: 'Test', price: 100000, category: 'Kitchen' });
        expect(res.statusCode).toEqual(401);
    });

    test('POST /api/products - Token customer (không phải admin) → 403', async () => {
        const customerToken = jwt.sign(
            { id: 999, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ name: 'Test', price: 100000, category: 'Kitchen' });
        expect(res.statusCode).toEqual(403);
    });

    test('POST /api/products - Admin nhưng thiếu name → 400', async () => {
        const adminToken = jwt.sign(
            { id: 1, email: 'admin@test.com', role: 'admin' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 100000, category: 'Kitchen' }); // thiếu name
        expect(res.statusCode).toEqual(400);
    });

    test('POST /api/products - Admin nhưng giá âm → 400', async () => {
        const adminToken = jwt.sign(
            { id: 1, email: 'admin@test.com', role: 'admin' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test', price: -1, category: 'Kitchen' });
        expect(res.statusCode).toEqual(400);
    });

    // --- DELETE ---
    test('DELETE /api/products/:id - Không có token → 401', async () => {
        const res = await request(app).delete('/api/products/1');
        expect(res.statusCode).toEqual(401);
    });
});

// ============================================
// PHẦN 3: KIỂM TRA CHATBOT (giữ nguyên test cũ)
// ============================================
describe('KIỂM TRA CHATBOT API', () => {

    test('POST /api/chat - Bot phải chào khi khách nói "Xin chào"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Xin chào shop ơi' });
        expect(res.statusCode).toEqual(200);
        const validGreetings = ['xin chào', 'Hello', 'Chào bạn'];
        const isGreetingValid = validGreetings.some(word => res.body.reply.includes(word));
        expect(isGreetingValid).toBe(true);
    });

    test('POST /api/chat - Bot phải báo giá ship khi hỏi "Phí ship"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Phí ship bao nhiêu vậy?' });
        expect(res.statusCode).toEqual(200);
        // Bot phải trả lời liên quan đến ship (không phải greeting)
        expect(res.body).toHaveProperty('reply');
        const reply = res.body.reply.toLowerCase();
        const isShipReply = reply.includes('ship') || reply.includes('30k') || reply.includes('vận chuyển');
        expect(isShipReply).toBe(true);
    });

    test('POST /api/chat - Bot KHÔNG được nhầm "phi ship" là "hi"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Phi ship ha noi' });
        expect(res.statusCode).toEqual(200);
        // Phải trả lời về phí ship, KHÔNG được nhầm thành lời chào
        expect(res.body.reply).not.toContain("Gia Dụng TMT xin chào");
    });
});

// ============================================
// PHẦN 4: KIỂM TRA INPUT VALIDATION
// ============================================
describe('KIỂM TRA INPUT VALIDATION', () => {

    test('POST /signup - Tên quá ngắn (1 ký tự) → 400', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ name: 'A', email: 'test@test.com', password: '123456' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('2-50');
    });

    test('POST /login - Email format sai → 400', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'abc', password: '123456' });
        expect(res.statusCode).toEqual(400);
    });
});

// ============================================
// PHẦN 5: KIỂM TRA WISHLIST API
// ============================================
describe('KIỂM TRA WISHLIST API', () => {

    test('GET /api/wishlist - Không có token → 401', async () => {
        const res = await request(app).get('/api/wishlist');
        expect(res.statusCode).toEqual(401);
    });

    test('POST /api/wishlist - Không có token → 401', async () => {
        const res = await request(app)
            .post('/api/wishlist')
            .send({ productId: 1 });
        expect(res.statusCode).toEqual(401);
    });

    test('DELETE /api/wishlist/1 - Không có token → 401', async () => {
        const res = await request(app).delete('/api/wishlist/1');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/wishlist/ids - Có token → 200 + array', async () => {
        const customerToken = jwt.sign(
            { id: 1, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/wishlist/ids')
            .set('Authorization', `Bearer ${customerToken}`);
        // Nên 200 dù rỗng
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

// ============================================
// PHẦN 6: KIỂM TRA COUPON API
// ============================================
describe('KIỂM TRA COUPON API', () => {

    test('POST /api/coupons/validate - Không có token → 401', async () => {
        const res = await request(app)
            .post('/api/coupons/validate')
            .send({ code: 'TEST10', order_total: 100000 });
        expect(res.statusCode).toEqual(401);
    });

    test('POST /api/coupons/validate - Mã không tồn tại → 404', async () => {
        const customerToken = jwt.sign(
            { id: 999, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/coupons/validate')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ code: 'NONEXISTENT_CODE_XYZ', order_total: 100000 });
        expect(res.statusCode).toEqual(404);
    });

    test('POST /api/coupons/validate - Thiếu code → 400', async () => {
        const customerToken = jwt.sign(
            { id: 999, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/coupons/validate')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ order_total: 100000 });
        expect(res.statusCode).toEqual(400);
    });

    test('GET /api/coupons - Customer (không phải admin) → 403', async () => {
        const customerToken = jwt.sign(
            { id: 999, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/coupons')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toEqual(403);
    });

    test('POST /api/coupons - Admin nhưng thiếu code → 400', async () => {
        const adminToken = jwt.sign(
            { id: 1, email: 'admin@test.com', role: 'admin' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .post('/api/coupons')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ discount_value: 10 }); // thiếu code
        expect(res.statusCode).toEqual(400);
    });
});

// ============================================
// PHẦN 7: KIỂM TRA NOTIFICATION API
// ============================================
describe('KIỂM TRA NOTIFICATION API', () => {

    test('GET /api/notifications - Không có token → 401', async () => {
        const res = await request(app).get('/api/notifications');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/notifications/unread-count - Không có token → 401', async () => {
        const res = await request(app).get('/api/notifications/unread-count');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/notifications - Có token → 200', async () => {
        const customerToken = jwt.sign(
            { id: 1, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/notifications/unread-count - Có token → 200 + count', async () => {
        const customerToken = jwt.sign(
            { id: 1, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('count');
        expect(typeof res.body.count).toBe('number');
    });
});

// ============================================
// PHẦN 8: KIỂM TRA STATS ANALYTICS API
// ============================================
describe('KIỂM TRA STATS ANALYTICS API', () => {

    test('GET /api/stats/monthly - Không có token → 401', async () => {
        const res = await request(app).get('/api/stats/monthly');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/stats/monthly - Customer → 403', async () => {
        const customerToken = jwt.sign(
            { id: 999, email: 'customer@test.com', role: 'customer' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/stats/monthly')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toEqual(403);
    });

    test('GET /api/stats/top-products - Không có token → 401', async () => {
        const res = await request(app).get('/api/stats/top-products');
        expect(res.statusCode).toEqual(401);
    });

    test('GET /api/stats/payment - Không có token → 401', async () => {
        const res = await request(app).get('/api/stats/payment');
        expect(res.statusCode).toEqual(401);
    });
});

// Đóng kết nối DB + Redis sau khi test xong
afterAll(async () => {
    const redis = require('../config/redisClient');
    const db = require('../config/database');

    // Disconnect Redis (nếu đang kết nối)
    try {
        if (redis && redis.status === 'ready') {
            await redis.quit();
        } else if (redis) {
            redis.disconnect();
        }
    } catch (e) { /* ignore */ }

    // Close MySQL pool
    try {
        await db.pool ? db.pool.end() : db.end();
    } catch (e) { /* ignore */ }

    await new Promise(resolve => setTimeout(resolve, 500));
});