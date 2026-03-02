// controllers/chatController.js
const { createChatModel } = require('../config/gemini');
const productService = require('../services/productService');
const logger = require('../config/logger');

// Lưu chat history theo session
const chatSessions = new Map();

// Track thời gian request gần nhất để tránh rate limit
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 giây giữa các requests

/**
 * Trích xuất số tiền từ message (hỗ trợ "500k", "500000", "5 triệu", "1tr")
 */
function extractPrice(msg) {
    let match;
    match = msg.match(/(\d+)\s*triệu/);
    if (match) return parseInt(match[1]) * 1000000;
    match = msg.match(/(\d+)\s*tr\b/);
    if (match) return parseInt(match[1]) * 1000000;
    match = msg.match(/(\d+)\s*k\b/);
    if (match) return parseInt(match[1]) * 1000;
    match = msg.match(/(\d{6,})/);
    if (match) return parseInt(match[1]);
    return null;
}

/**
 * Fallback rule-based khi Gemini bị rate limit
 */
function getFallbackResponse(message) {
    const msg = message.toLowerCase().trim();

    // --- CHÀO HỎI ---
    if (msg.includes('xin chào') || msg.includes('hello') || msg === 'hi' || msg.startsWith('hi ') || msg.includes('chào shop') || msg.includes('chào bạn') || msg.includes('chào ad')) {
        return { intent: 'greeting', reply: 'Dạ Gia Dụng TMT xin chào anh/chị! Em có thể tìm sản phẩm, tư vấn combo hoặc giải đáp thắc mắc cho mình ạ 🤖', keyword: '' };
    }
    if (msg.includes('cảm ơn') || msg.includes('thanks') || msg.includes('ok') || msg.includes('tuyệt')) {
        return { intent: 'thanks', reply: 'Dạ không có gì ạ! Cần gì cứ nhắn em nhé ❤️', keyword: '' };
    }
    if (msg.includes('bye') || msg.includes('tạm biệt') || msg.includes('ngủ ngon')) {
        return { intent: 'farewell', reply: 'Dạ bye anh/chị! Hẹn gặp lại sớm nha 👋', keyword: '' };
    }

    // --- SHOP IDENTITY ---
    if (msg.includes('shop là') || msg.includes('của ai') || msg.includes('bạn là ai') || msg.includes('bạn là gì') || msg.includes('giới thiệu')) {
        return { intent: 'shop_info', reply: '🏠 Em là HomeBot — trợ lý AI của **Gia Dụng TMT**! Shop chuyên đồ gia dụng chất lượng, địa chỉ 670/32 Đoàn Văn Bơ, Q.4, TP.HCM. Hotline ☎️ 0932 013 424 ạ!', keyword: '' };
    }

    // --- SHIP / VẬN CHUYỂN ---
    if (msg.includes('ship') || msg.includes('vận chuyển') || msg.includes('giao hàng') || msg.includes('phí')) {
        return { intent: 'shop_info', reply: 'Dạ phí ship nội thành 30k, ngoại thành 50k. Đơn trên 2 triệu em FreeShip luôn ạ! 🚚', keyword: '' };
    }

    // --- ĐỊA CHỈ / LIÊN HỆ ---
    if (msg.includes('địa chỉ') || msg.includes('ở đâu') || msg.includes('liên hệ') || msg.includes('hotline') || msg.includes('số điện thoại')) {
        return { intent: 'shop_info', reply: '🏠 670/32 Đoàn Văn Bơ, Q.4, TP.HCM\n☎️ Hotline/Zalo: 0932 013 424 (Anh Thành)\nGhé shop chơi nha anh/chị!', keyword: '' };
    }

    // --- BẢO HÀNH / ĐỔI TRẢ ---
    if (msg.includes('bảo hành') || msg.includes('đổi trả') || msg.includes('hư') || msg.includes('sửa chữa')) {
        return { intent: 'shop_info', reply: '🛡️ Bảo hành 12 tháng chính hãng, lỗi 1 đổi 1 trong 7 ngày đầu ạ! Anh/chị cứ yên tâm mua sắm!', keyword: '' };
    }

    // --- THANH TOÁN ---
    if (msg.includes('thanh toán') || msg.includes('trả tiền') || msg.includes('chuyển khoản') || msg.includes('tiền mặt')) {
        return { intent: 'shop_info', reply: '💳 Bên em nhận: COD (tiền mặt), VNPay (QR/ATM), chuyển khoản ngân hàng ạ!', keyword: '' };
    }

    // --- CÁCH ĐẶT HÀNG ---
    if (msg.includes('đặt hàng') || msg.includes('mua sao') || msg.includes('cách mua') || msg.includes('cách đặt')) {
        return { intent: 'shop_info', reply: 'Dạ đơn giản lắm ạ:\n1. Chọn sản phẩm ưng ý\n2. Bấm "Thêm vào giỏ" 🛒\n3. Vào giỏ hàng → Thanh toán là xong!', keyword: '' };
    }

    // --- KHUYẾN MÃI ---
    if (msg.includes('khuyến mãi') || msg.includes('giảm giá') || msg.includes('voucher') || msg.includes('sale')) {
        return { intent: 'shop_info', reply: '🔥 Đang có giảm 10% cho đơn hàng đầu tiên khi đăng ký thành viên đó ạ!', keyword: '' };
    }

    // --- GIỜ MỞ CỬA ---
    if (msg.includes('mấy giờ') || msg.includes('mở cửa') || msg.includes('làm việc')) {
        return { intent: 'shop_info', reply: '⏰ Shop mở cửa 8h00 - 20h00, làm việc cả tuần không nghỉ ạ!', keyword: '' };
    }

    // --- SẢN PHẨM BÁN CHẠY ---
    if (msg.includes('bán chạy') || msg.includes('hot') || msg.includes('xu hướng') || msg.includes('top') || msg.includes('nổi bật')) {
        return { intent: 'top_products', reply: 'Dạ đây là những sản phẩm bán chạy nhất hiện tại ạ:', keyword: '' };
    }

    // --- HÀNG MỚI ---
    if (msg.includes('hàng mới') || msg.includes('món mới') || msg.includes('new') || msg.includes('mới về')) {
        return { intent: 'new_products', reply: 'Dạ hàng mới về nóng hổi đây ạ:', keyword: '' };
    }

    // --- GIÁ RẺ ---
    if (msg.includes('rẻ') || msg.includes('tiết kiệm') || msg.includes('sinh viên') || msg.includes('dưới 500')) {
        return { intent: 'cheap_products', reply: 'Dạ đây là các sản phẩm giá hạt dẻ cho anh/chị:', keyword: '', maxPrice: 500000 };
    }

    // --- CAO CẤP ---
    if (msg.includes('cao cấp') || msg.includes('xịn') || msg.includes('đắt nhất') || msg.includes('premium')) {
        return { intent: 'premium_products', reply: 'Dạ đây là các dòng cao cấp nhất bên em ạ:', keyword: '' };
    }

    // --- BUDGET / "có X triệu nên mua gì" ---
    const price = extractPrice(msg);
    if (price && (msg.includes('mua') || msg.includes('gợi ý') || msg.includes('nên') || msg.includes('tư vấn') || msg.includes('budget') || msg.includes('ngân sách'))) {
        return { intent: 'cheap_products', reply: `Dạ với ngân sách ${(price / 1000000).toFixed(0)} triệu, em gợi ý anh/chị xem mấy món này:`, keyword: '', maxPrice: price };
    }
    // Có giá nhưng không có từ khóa mua → vẫn hiểu
    if (price && price >= 100000) {
        return { intent: 'cheap_products', reply: `Dạ để em tìm sản phẩm phù hợp với khoảng giá của anh/chị nha:`, keyword: '', maxPrice: price };
    }

    // --- TÌM KIẾM SẢN PHẨM THEO TÊN ---
    const productKeywords = ['nồi', 'chảo', 'quạt', 'robot', 'bếp', 'lò', 'máy giặt', 'máy',
        'tủ lạnh', 'máy lạnh', 'máy hút', 'hút bụi', 'ấm', 'cốc', 'ly', 'bình', 'dao', 'thớt',
        'nồi cơm', 'nồi chiên', 'bàn ủi', 'máy xay', 'máy ép', 'lò vi sóng', 'bàn là'];
    for (const kw of productKeywords) {
        if (msg.includes(kw)) {
            return { intent: 'search_product', reply: `Dạ để em tìm ${kw} cho anh/chị nha:`, keyword: kw };
        }
    }

    // --- "NÊN MUA GÌ" / GỢI Ý CHUNG ---
    if (msg.includes('mua gì') || msg.includes('gợi ý') || msg.includes('tư vấn') || msg.includes('giúp')) {
        return { intent: 'top_products', reply: 'Dạ anh/chị xem thử mấy món đang hot bên em nha:', keyword: '' };
    }

    // --- FALLBACK CUỐI ---
    return { intent: 'search_product', reply: 'Dạ để em tìm kiếm cho anh/chị nha:', keyword: msg.split(' ').slice(0, 3).join(' ') };
}

/**
 * Gọi Gemini với timeout và retry
 */
async function callGeminiSafe(model, prompt) {
    // Throttle: đảm bảo ít nhất 2s giữa các request
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL) {
        await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
    }
    lastRequestTime = Date.now();

    // Timeout 15s cho Gemini call
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
    );

    try {
        const result = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise
        ]);
        return result.response.text().trim();
    } catch (err) {
        if (err.status === 429 || err.message === 'TIMEOUT') {
            throw { isRateLimit: true, message: err.message };
        }
        throw err;
    }
}

/**
 * Phân tích intent + tạo response trong 1 lần gọi Gemini
 */
async function analyzeAndRespond(model, message, chatHistory) {
    const historyText = chatHistory.slice(-4).map(h =>
        `${h.role === 'user' ? 'Khách' : 'HomeBot'}: ${h.text}`
    ).join('\n');

    const prompt = `Bạn là HomeBot — trợ lý AI của Gia Dụng TMT.
${historyText ? `Chat gần đây:\n${historyText}\n` : ''}Khách: "${message}"

Trả về JSON (không có backticks):
{
  "intent": "search_product"|"top_products"|"new_products"|"cheap_products"|"premium_products"|"category_filter"|"shop_info"|"greeting"|"farewell"|"thanks"|"general_chat",
  "keyword": "tên sản phẩm nếu tìm kiếm, hoặc rỗng",
  "maxPrice": null hoặc số nguyên,
  "category": "danh mục hoặc rỗng",
  "reply": "câu trả lời 1-2 câu tiếng Việt, xưng em, thân thiện, có emoji. Nếu intent là search/top/new/cheap/premium thì kết thúc bằng dấu hai chấm(:)"
}

Shop info: Ship 30k-50k, FreeShip đơn >2tr, địa chỉ 670/32 Đoàn Văn Bơ Q4, 8h-20h, bảo hành 12 tháng, COD/VNPay.
CHỈ trả về JSON.`;

    const text = await callGeminiSafe(model, prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}

/**
 * Main handler
 */
const handleChat = async (req, res) => {
    const { message, sessionId } = req.body;
    if (!message) {
        return res.json({ reply: 'Dạ HomeBot đang lắng nghe đây ạ! 🤖' });
    }

    const session = sessionId || 'default';
    logger.info(`[${session}] User: ${message}`);

    // Lấy/khởi tạo chat history
    if (!chatSessions.has(session)) {
        chatSessions.set(session, []);
    }
    const chatHistory = chatSessions.get(session);

    let aiResult;
    let usedFallback = false;

    try {
        const model = createChatModel();
        aiResult = await analyzeAndRespond(model, message, chatHistory);
        logger.info(`[${session}] Gemini → Intent: ${aiResult.intent}`);
    } catch (err) {
        // Fallback khi Gemini rate-limited hoặc timeout
        logger.warn(`[${session}] Gemini ${err.isRateLimit ? 'rate-limited' : 'error'}, dùng fallback`);
        aiResult = getFallbackResponse(message);
        usedFallback = true;
    }

    // Query sản phẩm từ DB
    let products = [];
    try {
        switch (aiResult.intent) {
            case 'search_product':
                if (aiResult.keyword) products = await productService.searchProducts(aiResult.keyword);
                break;
            case 'top_products':
                products = await productService.getTopProducts();
                break;
            case 'new_products':
                products = await productService.getNewProducts();
                break;
            case 'cheap_products':
                products = await productService.getProductsByPrice(aiResult.maxPrice || 500000);
                break;
            case 'premium_products':
                products = await productService.getPremiumProducts();
                break;
            case 'category_filter':
                if (aiResult.category) products = await productService.getProductsByCategory(aiResult.category);
                break;
        }
    } catch (dbErr) {
        logger.error(`DB query error: ${dbErr.message}`);
    }

    // Lưu history
    chatHistory.push({ role: 'user', text: message });
    chatHistory.push({ role: 'bot', text: aiResult.reply });
    if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);

    logger.info(`[${session}] Reply: ${aiResult.reply.substring(0, 60)}... (fallback: ${usedFallback})`);

    res.json({
        reply: aiResult.reply,
        products: products.length > 0 ? products : undefined,
        intent: aiResult.intent,
        ai: !usedFallback
    });
};

module.exports = { handleChat };
