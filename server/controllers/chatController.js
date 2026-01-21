// controllers/chatbotController.js
const db = require('../config/database');

const handleChat = (req, res) => {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Dạ HomeBot đang lắng nghe đây ạ?" });
    
    const msg = message.toLowerCase().trim();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // --- 1. NHÓM CÂU HỎI VỀ SẢN PHẨM ---
    // A. Món bán chạy / Hot trend
    if (msg.includes('bán chạy') || msg.includes('hot') || msg.includes('xu hướng') || msg.includes('top')) {
        let sql = "SELECT * FROM products ORDER BY id DESC LIMIT 3";
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ 
                reply: getRandom([
                    "Dạ đây là những siêu phẩm đang 'làm mưa làm gió' tại shop em ạ:",
                    "Top Best-seller bên em đây ạ, anh/chị xem qua nhé:",
                    "Dân tình đang săn lùng mấy món này dữ lắm ạ:"
                ]), 
                products: data 
            });
            return res.json({ reply: "Dạ hiện tại chưa có dữ liệu món bán chạy ạ." });
        });
        return;
    }
    
    // B. Món mới về
    if (msg.includes('món mới') || msg.includes('hàng mới') || msg.includes('new')) {
        let sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 3";
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ 
                reply: getRandom([
                    "Dạ hàng vừa cập bến nóng hổi đây ạ:",
                    "Mấy em này mới lên kệ, xinh lung linh luôn ạ:",
                    "Update mẫu mới nhất cho anh/chị đây ạ:"
                ]), 
                products: data 
            });
            return res.json({ reply: "Dạ hiện chưa có hàng mới về ạ." });
        });
        return;
    }
    
    // C. Tìm theo giá (Rẻ / Dưới 500k)
    if (msg.includes('dưới 500k') || msg.includes('rẻ') || msg.includes('sinh viên') || msg.includes('tiết kiệm')) {
        let sql = "SELECT * FROM products WHERE price < 500000 LIMIT 3";
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ 
                reply: getRandom([
                    "Dạ đây là các món giá hạt dẻ mà chất lượng 5 sao ạ:",
                    "Deal hời giá tốt dưới 500k cho mình đây ạ:",
                    "Ngon - Bổ - Rẻ là mấy em này đây ạ:"
                ]), 
                products: data 
            });
            return res.json({ reply: "Dạ hiện tại em không thấy món nào dưới 500k ạ." });
        });
        return;
    }
    
    // D. Tìm theo giá (Đắt / Cao cấp)
    if (msg.includes('đắt nhất') || msg.includes('giá cao') || msg.includes('xịn') || msg.includes('cao cấp')) {
        let sql = "SELECT * FROM products ORDER BY price DESC LIMIT 3";
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json("Lỗi Chatbot");
            if (data.length > 0) return res.json({ 
                reply: "Dạ đây là các dòng cao cấp nhất (Flagship) của bên em ạ:", 
                products: data 
            });
            return res.json({ reply: "Dạ không tìm thấy sản phẩm." });
        });
        return;
    }

    // --- 2. NHÓM CÂU HỎI THÔNG TIN SHOP ---
    if (msg.includes('ship') || msg.includes('vận chuyển') || msg.includes('giao hàng') || msg.includes('phí')) {
        return res.json({ 
            reply: getRandom([
                "Dạ phí ship nội thành là 30k, ngoại thành 50k. Đặc biệt đơn trên 2 triệu em FreeShip luôn ạ! 🚚",
                "Bên em đồng giá ship 30k nội thành. Anh/chị ở xa thì 50k ạ. Mua nhiều em miễn phí vận chuyển nha!",
                "Dạ ship nhanh 30k - 50k tùy khu vực ạ. Đặt hàng ngay để em gói sớm nha!"
            ])
        });
    }
    
    if (msg.includes('địa chỉ') || msg.includes('ở đâu') || msg.includes('đến shop') || msg.includes('map') || msg.includes('liên hệ')) {
        return res.json({ 
            reply: "🏠 Shop em ở: 670/32 Đoàn Văn Bơ, Q.4, TP.HCM.\n☎️ Hotline/Zalo: 0932 013 424 (Anh Thành).\nAnh/chị ghé chơi nhé!" 
        });
    }
    
    if (msg.includes('khuyến mãi') || msg.includes('giảm giá') || msg.includes('voucher') || msg.includes('coupon')) {
        return res.json({ 
            reply: getRandom([
                "🔥 Tin nóng: Giảm ngay 10% cho đơn hàng đầu tiên khi đăng ký thành viên đó ạ!",
                "Dạ hiện tại đang có mã giảm giá 10% cho thành viên mới. Anh/chị đăng ký nhanh kẻo hết nha!",
                "Bên em đang sale 10% cho khách mới ạ. Giá đã tốt nay còn tốt hơn!"
            ])
        });
    }
    
    if (msg.includes('cách đặt') || msg.includes('mua sao') || msg.includes('đặt hàng')) {
        return res.json({ 
            reply: "Dạ đơn giản lắm ạ:\n1. Chọn món đồ ưng ý\n2. Bấm 'Thêm vào giỏ'\n3. Vào giỏ hàng bấm 'Thanh toán' là xong ngay!" 
        });
    }
    
    if (msg.includes('thanh toán') || msg.includes('chuyển khoản') || msg.includes('tiền mặt') || msg.includes('trả tiền')) {
        return res.json({ 
            reply: "💳 Bên em nhận đủ món ăn chơi: Tiền mặt (COD), Chuyển khoản ngân hàng, Quét QR Momo/ZaloPay và cả PayPal nữa ạ!" 
        });
    }
    
    if (msg.includes('bảo hành') || msg.includes('hư') || msg.includes('đổi trả') || msg.includes('sửa chữa')) {
        return res.json({ 
            reply: "🛡️ Yên tâm ạ! Hàng chính hãng bảo hành 12 tháng. Lỗi 1 đổi 1 trong 7 ngày đầu nếu do nhà sản xuất. Anh/chị cứ xài thả ga!" 
        });
    }
    
    if (msg.includes('mấy giờ') || msg.includes('làm việc') || msg.includes('mở cửa')) {
        return res.json({ 
            reply: "⏰ Shop mở cửa từ 8h00 sáng đến 20h00 tối, làm việc xuyên suốt tuần không nghỉ ngày nào ạ!" 
        });
    }
    
    if (msg.includes('tôi là ai') || msg.includes('bạn biết gì về tôi')) {
        return res.json({ 
            reply: "Dạ anh/chị là khách hàng quý giá của Gia Dụng TMT! Em rất vui được phục vụ anh/chị ạ! 🤖❤️" 
        });
    }

    if (msg.includes('bạn là ai') || msg.includes('bạn là gì') || msg.includes('giới thiệu về bạn')) {
        return res.json({ 
            reply: "Dạ em là HomeBot - trợ lý ảo của Gia Dụng TMT, luôn sẵn sàng hỗ trợ anh/chị tìm kiếm sản phẩm và giải đáp thắc mắc 24/7 nha! 🤖" 
        });
    }

    if (msg.includes('làm gì') || msg.includes('giúp gì') || msg.includes('hỗ trợ gì')) {
        return res.json({ 
            reply: "Dạ em có thể giúp anh/chị tìm kiếm sản phẩm theo tên, theo giá, giới thiệu món bán chạy, món mới về và giải đáp các thắc mắc thường gặp về shop ạ!" 
        });
    }

    // --- 3. NHÓM XÃ GIAO ---
    if (msg.includes('cảm ơn') || msg.includes('thanks') || msg.includes('ok shop') || msg.includes('tuyệt')) {
        return res.json({ 
            reply: getRandom([
                "Dạ không có gì ạ! Cần gì cứ ới em nhé! ❤️",
                "Dạ cảm ơn anh/chị đã quan tâm. Chúc anh/chị một ngày vui vẻ!",
                "Dạ vâng ạ, em cảm ơn anh chị đã mua hàng ạ! 🥰"
            ])
        });
    }
    
    if (msg.includes('bye') || msg.includes('tạm biệt') || msg.includes('ngủ ngon')) {
        return res.json({ reply: "Dạ bye bye anh/chị! Hẹn gặp lại sớm nha! 👋" });
    }
    
    const greetingKeywords = ['xin chào', 'hello', 'chào shop', 'hi shop', 'chào ad'];
    const isGreeting = greetingKeywords.some(kw => msg.includes(kw)) || msg === 'hi' || msg.startsWith('hi ');

    if (isGreeting) {
        return res.json({ 
            reply: getRandom([
                "Dạ Gia Dụng TMT xin chào! Em có thể giúp gì cho mình ạ? 🤖",
                "Hello anh/chị! Cần tìm đồ gia dụng xịn sò thì cứ bảo em nha!",
                "Chào bạn! Chúc bạn một ngày tốt lành. Bạn đang tìm món gì đấy?"
            ])
        });
    }
    
    // --- 4. TÌM KIẾM THEO TÊN ---    
    let keyword = '';
    if (msg.includes('nồi')) keyword = '%nồi%';
    else if (msg.includes('chảo')) keyword = '%chảo%';
    else if (msg.includes('robot') || msg.includes('hút bụi')) keyword = '%robot%';
    else if (msg.includes('quạt')) keyword = '%quạt%';
    else if (msg.includes('bếp')) keyword = '%bếp%';
    else if (msg.includes('ly') || msg.includes('cốc')) keyword = '%ly%';
    else keyword = `%${msg}%`; 

    let sqlSearch = "SELECT * FROM products WHERE name LIKE ?";
    db.query(sqlSearch, [keyword], (err, data) => {
        if (err) return res.status(500).json("Lỗi Chatbot");
        
        if (data.length > 0) {
            return res.json({ 
                reply: `Dạ em tìm thấy ${Math.min(3, data.length)} sản phẩm có vẻ hợp lý nè:`, 
                products: data.slice(0, 3) 
            });
        } else {
            return res.json({ 
                reply: getRandom([
                    "Hic, em tìm không ra món này. Hay anh/chị thử từ khóa khác xem sao ạ? (Ví dụ: nồi, chảo, robot...)",
                    "Món này bên em tạm hết hoặc chưa nhập về. Anh/chị xem thử mấy món 'bán chạy' nha?",
                    "Em chưa hiểu ý mình lắm. Anh/chị muốn tìm sản phẩm hay hỏi phí ship ạ?"
                ])
            });
        }
    });
};

module.exports = { handleChat };