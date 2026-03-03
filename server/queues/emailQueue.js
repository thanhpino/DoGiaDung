// queues/emailQueue.js
// BullMQ Email Queue — Gửi email background, auto retry
const { Queue, Worker } = require('bullmq');
const redis = require('../config/redisClient');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');

// Queue
const emailQueue = new Queue('email-queue', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,  // Giữ 50 jobs gần nhất
        removeOnFail: 100
    }
});

// Transporter
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

// Worker — xử lý email background
const emailWorker = new Worker('email-queue', async (job) => {
    const { type, data } = job.data;
    logger.info(`📧 [Email Worker] Đang gửi: ${type} → ${data.to}`);

    let mailOptions;

    if (type === 'order') {
        mailOptions = {
            from: '"Gia Dụng TMT" <no-reply@giadungtmt.com>',
            to: data.to,
            subject: `🎉 Xác nhận đơn hàng #${data.orderId} thành công!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #ea580c; text-align: center;">Cảm ơn ${data.customerName} đã đặt hàng!</h2>
                    <p>Đơn hàng <b>#${data.orderId}</b> của bạn đã được tiếp nhận.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background-color: #f3f4f6;"><th style="padding: 10px; text-align: left;">Sản phẩm</th><th style="padding: 10px; text-align: center;">SL</th><th style="padding: 10px; text-align: right;">Giá</th></tr>
                        ${data.items.map(item => `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px;">${item.name || 'Sản phẩm'}</td><td style="padding: 10px; text-align: center;">${item.quantity}</td><td style="padding: 10px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.price)} đ</td></tr>`).join('')}
                    </table>
                    <h3 style="text-align: right; color: #ea580c; margin-top: 20px;">Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.total)} đ</h3>
                    <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">Hotline hỗ trợ: 0932 013 424</p>
                </div>`
        };
    } else if (type === 'reset_password') {
        mailOptions = {
            from: '"Gia Dụng TMT" <no-reply@giadungtmt.com>',
            to: data.to,
            subject: '🔐 Yêu cầu đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Bạn quên mật khẩu?</h2>
                    <p>Hãy nhấn vào nút bên dưới để đặt lại mật khẩu mới:</p>
                    <a href="${data.resetLink}" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">ĐẶT LẠI MẬT KHẨU</a>
                    <p style="color: #666; font-size: 12px;">Link này chỉ có hiệu lực trong 1 giờ.</p>
                </div>`
        };
    }

    await transporter.sendMail(mailOptions);
    logger.info(`✅ [Email Worker] Đã gửi: ${type} → ${data.to}`);
}, {
    connection: redis,
    concurrency: 2  // Tối đa 2 email cùng lúc
});

emailWorker.on('failed', (job, err) => {
    logger.error(`❌ [Email Worker] Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
});

/**
 * Thêm job gửi email đơn hàng vào queue
 */
async function queueOrderEmail(toEmail, orderId, items, total, customerName) {
    await emailQueue.add('send-order-email', {
        type: 'order',
        data: { to: toEmail, orderId, items, total, customerName }
    });
    logger.info(`📮 Đã queue email đơn hàng #${orderId} → ${toEmail}`);
}

/**
 * Thêm job gửi email reset password vào queue
 */
async function queueResetEmail(toEmail, resetLink) {
    await emailQueue.add('send-reset-email', {
        type: 'reset_password',
        data: { to: toEmail, resetLink }
    });
    logger.info(`📮 Đã queue email reset password → ${toEmail}`);
}

module.exports = { emailQueue, queueOrderEmail, queueResetEmail };
