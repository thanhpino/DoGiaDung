const request = require('supertest');
const app = require('../index');

// Tắt log console trong quá trình test để đỡ rối mắt
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('KIỂM TRA API BACKEND', () => {

    // --- TEST 1: API SẢN PHẨM ---
    test('GET /products - Phải trả về danh sách sản phẩm và status 200', async () => {
        const res = await request(app).get('/products');
        
        // Mong đợi status là 200 OK
        expect(res.statusCode).toEqual(200);
        
        // Mong đợi trả về dữ liệu dạng JSON
        expect(res.header['content-type']).toMatch(/json/);
        
        // Mong đợi có thuộc tính data là một mảng
        expect(Array.isArray(res.data)).toBe(false); // API trả về {data: [], pagination: {}} nên res.body.data mới đúng
        // Sửa lại logic check data chuẩn theo API của bro:
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // --- TEST 2: API CHATBOT ---
    test('POST /api/chat - Bot phải chào khi khách nói "Xin chào"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Xin chào shop ơi' }); 

        expect(res.statusCode).toEqual(200);
        
        // Kiểm tra xem câu trả lời có chứa 1 trong các từ khóa chào hỏi không
        const validGreetings = ['xin chào', 'Hello', 'Chào bạn'];
        const isGreetingValid = validGreetings.some(word => res.body.reply.includes(word));
        
        expect(isGreetingValid).toBe(true);
    });

    test('POST /api/chat - Bot phải báo giá ship khi hỏi "Phí ship"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Phí ship bao nhiêu vậy?' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.reply).toContain("30k"); // Check keyword quan trọng
    });
    
    // --- TEST 3: CHATBOT THÔNG MINH  ---
    test('POST /api/chat - Bot KHÔNG được nhầm "phi ship" là "hi"', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ message: 'Phi ship ha noi' }); 

        expect(res.statusCode).toEqual(200);
        // Nếu bot trả lời "Gia Dụng TMT xin chào" là SAI (Bug)
        // Nó phải trả lời về phí ship
        expect(res.body.reply).not.toContain("Gia Dụng TMT xin chào");
        expect(res.body.reply).toContain("30k");
    });
});

// Đóng kết nối DB sau khi test xong (để Jest không bị treo)
afterAll(async () => {
    // Vì bro dùng connection pool bình thường, Jest sẽ tự exit. 
    // Nếu dùng pool.end() thì thêm vào đây.
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // Đợi xíu cho chắc
});