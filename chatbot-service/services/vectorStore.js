// services/vectorStore.js
// In-memory Vector Store với Cosine Similarity Search
const logger = require('../config/logger');

/**
 * Vector Store - Lưu trữ và tìm kiếm embeddings bằng cosine similarity
 */
class VectorStore {
    constructor() {
        // Map<productId, { vector: number[], metadata: Object }>
        this.store = new Map();
    }

    /**
     * Thêm/cập nhật embedding của sản phẩm
     * @param {number} productId
     * @param {number[]} vector - Embedding vector (768 chiều)
     * @param {Object} metadata - Thông tin sản phẩm (name, price, category...)
     */
    addProduct(productId, vector, metadata) {
        this.store.set(productId, { vector, metadata });
    }

    /**
     * Xóa sản phẩm khỏi store
     */
    removeProduct(productId) {
        this.store.delete(productId);
    }

    /**
     * Tính Cosine Similarity giữa 2 vector
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number} Giá trị từ -1 đến 1 (1 = giống nhất)
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) return 0;

        return dotProduct / denominator;
    }

    /**
     * Tìm kiếm sản phẩm gần nhất với query vector
     * @param {number[]} queryVector - Embedding của câu hỏi
     * @param {number} topK - Số kết quả trả về (mặc định 5)
     * @param {number} minScore - Điểm tối thiểu (mặc định 0.3)
     * @returns {Array<{productId: number, score: number, metadata: Object}>}
     */
    search(queryVector, topK = 5, minScore = 0.3) {
        if (this.store.size === 0) {
            logger.warn('VectorStore trống, chưa có embedding nào');
            return [];
        }

        const scores = [];

        for (const [productId, { vector, metadata }] of this.store) {
            const score = this.cosineSimilarity(queryVector, vector);
            if (score >= minScore) {
                scores.push({ productId, score, metadata });
            }
        }

        // Sắp xếp theo score giảm dần, lấy top-K
        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }

    /**
     * Xóa toàn bộ store
     */
    clear() {
        this.store.clear();
    }

    /**
     * Số lượng sản phẩm đã embed
     */
    size() {
        return this.store.size;
    }

    /**
     * Kiểm tra sản phẩm đã có embedding chưa
     */
    has(productId) {
        return this.store.has(productId);
    }
}

// Singleton instance - dùng chung toàn bộ chatbot-service
const vectorStore = new VectorStore();

module.exports = vectorStore;
