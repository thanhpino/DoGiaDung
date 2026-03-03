// scripts/testSemanticSearch.js
// Test so sánh Semantic Search (Gemini Embedding) vs LIKE Search (MySQL)
// Chạy: node scripts/testSemanticSearch.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const productService = require('../services/productService');
const { syncEmbeddings } = require('./syncEmbeddings');

const TEST_QUERIES = [
    // Câu hỏi tự nhiên (LIKE search sẽ miss)
    'đồ nấu cơm',
    'thiết bị làm sạch nhà',
    'đồ dùng nhà bếp',
    'đồ trang trí phòng ngủ',
    'thiết bị chăm sóc sức khỏe',

    // Câu hỏi khớp từ khóa (cả 2 đều tìm được)
    'nồi cơm điện',
    'robot hút bụi',
    'máy xay sinh tố',
];

async function runTest() {
    console.log('🔄 Đang đồng bộ embeddings...\n');
    const count = await syncEmbeddings();
    console.log(`✅ Đã embed ${count} sản phẩm\n`);
    console.log('='.repeat(80));
    console.log('📊 SO SÁNH: Semantic Search (MỚI) vs LIKE Search (CŨ)');
    console.log('='.repeat(80));

    for (const query of TEST_QUERIES) {
        console.log(`\n🔍 Câu hỏi: "${query}"`);
        console.log('-'.repeat(60));

        // Semantic Search (mới)
        const semanticResults = await productService.semanticSearch(query, 3);
        console.log(`  🧠 Semantic Search (${semanticResults.length} kết quả):`);
        if (semanticResults.length > 0) {
            semanticResults.forEach((p, i) =>
                console.log(`     ${i + 1}. ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ`)
            );
        } else {
            console.log('     (không tìm thấy)');
        }

        // LIKE Search (cũ)
        const likeResults = await productService.searchProducts(query, 3);
        console.log(`  📝 LIKE Search (${likeResults.length} kết quả):`);
        if (likeResults.length > 0) {
            likeResults.forEach((p, i) =>
                console.log(`     ${i + 1}. ${p.name} - ${Number(p.price).toLocaleString('vi-VN')}đ`)
            );
        } else {
            console.log('     (không tìm thấy)');
        }

        // Đánh giá
        if (semanticResults.length > likeResults.length) {
            console.log(`  ✅ Semantic Search TỐT HƠN (+${semanticResults.length - likeResults.length} kết quả)`);
        } else if (semanticResults.length === likeResults.length && semanticResults.length > 0) {
            console.log(`  🟰 Cả hai đều tìm được ${semanticResults.length} kết quả`);
        } else if (likeResults.length > semanticResults.length) {
            console.log(`  ⚠️ LIKE Search nhiều hơn`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test hoàn tất!');
    process.exit(0);
}

runTest().catch(err => {
    console.error('💥 Lỗi:', err.message);
    process.exit(1);
});
