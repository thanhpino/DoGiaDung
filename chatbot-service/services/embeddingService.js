// services/embeddingService.js
// Gemini Embedding Service - Tạo vector embeddings cho sản phẩm và câu hỏi
// Dùng REST API v1 trực tiếp (SDK mặc định dùng v1beta không hỗ trợ text-embedding-004)
const logger = require('../config/logger');

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;

// Rate limiting
let lastEmbedTime = 0;
const MIN_EMBED_INTERVAL = 1500; // 1.5s giữa các embed requests

/**
 * Throttle để tránh rate limit Gemini API
 */
async function throttle() {
    const now = Date.now();
    const elapsed = now - lastEmbedTime;
    if (elapsed < MIN_EMBED_INTERVAL) {
        await new Promise(r => setTimeout(r, MIN_EMBED_INTERVAL - elapsed));
    }
    lastEmbedTime = Date.now();
}

/**
 * Embed một đoạn text → vector (768 chiều)
 * Gọi trực tiếp REST API v1 thay vì SDK (v1beta không hỗ trợ text-embedding-004)
 * @param {string} text - Nội dung cần embed
 * @returns {Promise<number[]>} Vector embedding
 */
async function embedText(text) {
    await throttle();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: `models/${EMBEDDING_MODEL}`,
                content: { parts: [{ text }] }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini Embedding API error ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.embedding.values;

    } catch (err) {
        // Retry 1 lần nếu rate limit (429)
        if (err.message?.includes('429')) {
            logger.warn('Embedding rate limited, retrying sau 3s...');
            await new Promise(r => setTimeout(r, 3000));
            lastEmbedTime = Date.now();

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: `models/${EMBEDDING_MODEL}`,
                    content: { parts: [{ text }] }
                })
            });

            if (!response.ok) {
                throw new Error(`Retry failed: ${response.status}`);
            }

            const data = await response.json();
            return data.embedding.values;
        }
        throw err;
    }
}

/**
 * Tạo text đại diện cho sản phẩm để embed
 * @param {Object} product - Sản phẩm từ DB
 * @returns {string} Text đại diện
 */
function buildProductText(product) {
    const parts = [product.name];
    if (product.category) parts.push(product.category);
    if (product.description) parts.push(product.description);
    return parts.join(' - ');
}

/**
 * Embed batch sản phẩm (có rate limiting)
 * @param {Array} products - Danh sách sản phẩm
 * @param {Function} onProgress - Callback tiến độ (index, total, product)
 * @returns {Promise<Array<{productId: number, vector: number[], metadata: Object}>>}
 */
async function embedProducts(products, onProgress = null) {
    const results = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const text = buildProductText(product);

        try {
            const vector = await embedText(text);
            results.push({
                productId: product.id,
                vector,
                metadata: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image_url: product.image_url,
                    description: product.description
                }
            });

            if (onProgress) {
                onProgress(i + 1, products.length, product);
            }
        } catch (err) {
            logger.error(`Lỗi embed sản phẩm #${product.id} "${product.name}": ${err.message}`);
            // Tiếp tục với sản phẩm tiếp theo, không dừng cả batch
        }
    }

    return results;
}

module.exports = { embedText, embedProducts, buildProductText };
