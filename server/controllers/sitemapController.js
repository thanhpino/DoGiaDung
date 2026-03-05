// controllers/sitemapController.js
const db = require('../config/database');
const logger = require('../config/logger');

const getSitemap = async (req, res) => {
    try {
        const [products] = await db.query("SELECT id FROM products");

        const baseUrl = process.env.CLIENT_URL || 'https://dogiadung-vwp8.onrender.com';

        // Tạo nội dung XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Trang chủ
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/home</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Trang danh sách sản phẩm
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/products</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';

        // Các trang chi tiết sản phẩm
        products.forEach(product => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/product/${product.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.9</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        return res.send(xml);

    } catch (err) {
        logger.error(`Sitemap generation error: ${err.message}`);
        return res.status(500).send("Lỗi tạo sitemap");
    }
};

module.exports = { getSitemap };
