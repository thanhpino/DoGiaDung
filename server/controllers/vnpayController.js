// controllers/vnpayController.js
const crypto = require('crypto');
const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = require('../config/vnpay');

const createPaymentUrl = (req, res) => {
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

        // 1. Sắp xếp tham số
        const sortedKeys = Object.keys(vnp_Params).sort();

        // 2. Tạo chuỗi ký
        const signData = sortedKeys.map(key => {
            return encodeURIComponent(key) + "=" + encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+");
        }).join('&');

        // 3. Tạo chữ ký 
        const hmac = crypto.createHmac("sha512", vnp_HashSecret.trim()); 
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        // 4. Tạo URL
        const queryUrl = sortedKeys.map(key => {
            return encodeURIComponent(key) + "=" + encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+");
        }).join('&');

        const paymentUrl = vnp_Url + '?' + queryUrl + '&vnp_SecureHash=' + signed;
        
        res.json({ paymentUrl });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPaymentUrl };