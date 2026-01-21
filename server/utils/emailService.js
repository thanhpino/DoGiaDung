// utils/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
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
        if (error) console.log("❌ Lỗi gửi mail:", error);
        else console.log('✅ Email sent: ' + info.response);
    });
};

const sendResetPasswordEmail = (toEmail, token) => {
    // Link trỏ về Frontend để người dùng đặt lại mật khẩu
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    const mailOptions = {
        from: '"Gia Dụng TMT" <no-reply@giadungtmt.com>',
        to: toEmail,
        subject: '🔐 Yêu cầu đặt lại mật khẩu',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Bạn quên mật khẩu?</h2>
                <p>Hãy nhấn vào nút bên dưới để đặt lại mật khẩu mới:</p>
                <a href="${resetLink}" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">ĐẶT LẠI MẬT KHẨU</a>
                <p style="color: #666; font-size: 12px;">Link này chỉ có hiệu lực trong 1 giờ.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Lỗi gửi mail reset:", error);
        else console.log('Reset Email sent: ' + info.response);
    });
};

module.exports = { sendOrderEmail, sendResetPasswordEmail };