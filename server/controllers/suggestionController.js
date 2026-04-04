// server/controllers/suggestionController.js
const db = require('../config/database');

/**
 * Thuật toán CSP (Constraint Satisfaction Problem) với Backtracking
 */
const getComboSuggestion = async (req, res) => {
    try {
        // 1. Nhận và ép kiểu
        const budget = Number(req.body.budget);
        const categories = req.body.categories;

        // Validation
        if (!budget || isNaN(budget) || !categories || categories.length === 0) {
            return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ!" });
        }

        // 2. Fetch Data: Lấy sản phẩm & SẮP XẾP GIÁ TĂNG DẦN
        const sql = "SELECT * FROM products WHERE price <= ? ORDER BY price ASC";

        const [allProducts] = await db.query(sql, [budget]);

        // 3. Map sản phẩm vào danh mục
        const domainMap = {};
        categories.forEach(reqCat => {
            domainMap[reqCat] = allProducts.filter(p =>
                p.category && p.category.toLowerCase().includes(reqCat.toLowerCase())
            );
        });

        // Kiểm tra xem có danh mục nào bị rỗng không
        for (const cat of categories) {
            if (!domainMap[cat] || domainMap[cat].length === 0) {
                return res.json({
                    success: true,
                    solutions: [],
                    message: `Rất tiếc, kho không có sản phẩm loại "${cat}" nào dưới ${budget.toLocaleString('vi-VN')}đ`
                });
            }
        }

        // 4. CHẠY THUẬT TOÁN CSP (BACKTRACKING)
        const solutions = [];
        let exploredNodes = 0;
        const DISCOUNT_RATE = 0.9; // Giảm giá 10% cho Combo

        const backtrack = (index, currentCombo, currentOriginalTotal) => {
            exploredNodes++;

            // Base case: Đã chọn đủ số lượng món theo danh mục
            if (index === categories.length) {
                const totalAfterDiscount = Math.round(currentOriginalTotal * DISCOUNT_RATE);
                
                if (totalAfterDiscount <= budget && totalAfterDiscount > 0) {
                    solutions.push({
                        items: [...currentCombo],
                        originalPrice: currentOriginalTotal,
                        totalPrice: totalAfterDiscount,
                        savings: currentOriginalTotal - totalAfterDiscount,
                        remaining: budget - totalAfterDiscount
                    });
                }
                return;
            }

            const currentCategory = categories[index];
            const items = domainMap[currentCategory];

            // TỐI ƯU: Chỉ lấy 20 sản phẩm RẺ NHẤT
            const optimizedItems = items.slice(0, 20);

            for (const item of optimizedItems) {
                const itemPrice = Number(item.price);
                const nextOriginalTotal = currentOriginalTotal + itemPrice;
                const nextTotalAfterDiscount = Math.round(nextOriginalTotal * DISCOUNT_RATE);

                // Forward Checking: Nếu giá SAU GIẢM của combo này vẫn nằm trong ngân sách
                if (nextTotalAfterDiscount <= budget) {
                    currentCombo.push(item);
                    backtrack(index + 1, currentCombo, nextOriginalTotal);
                    currentCombo.pop();
                } else {
                    // Vì domainMap đã sắp xếp giá tăng dần, nếu món này cộng vào vượt budget thì các món sau cũng vượt
                    break;
                }
            }
        };

        const startTime = Date.now();
        backtrack(0, [], 0);
        const executionTime = Date.now() - startTime;

        // 5. Sắp xếp kết quả: Ưu tiên bộ sản phẩm có giá trị cao nhất (sát budget)
        solutions.sort((a, b) => a.remaining - b.remaining);

        const topSolutions = solutions.slice(0, 6);

        return res.json({
            success: true,
            count: topSolutions.length,
            solutions: topSolutions,
            metadata: { executionTime: `${executionTime}ms`, exploredNodes, discountRate: "10%" }
        });

    } catch (error) {
        console.error("❌ Lỗi CSP:", error);
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

// Api advanced
const getAdvancedComboSuggestion = async (req, res) => {
    try {
        const { budget, categories, preferredColor, preferredBrand } = req.body;
        const budgetNum = Number(budget);
        const DISCOUNT_RATE = 0.9;

        if (!budgetNum || !categories || categories.length === 0)
            return res.status(400).json({ success: false, message: "Thiếu thông tin!" });

        const sql = "SELECT * FROM products WHERE price <= ? ORDER BY price ASC";
        const [allProducts] = await db.query(sql, [budgetNum]);

        const domainMap = {};
        categories.forEach(reqCat => {
            domainMap[reqCat] = allProducts.filter(p => p.category && p.category.toLowerCase().includes(reqCat.toLowerCase()));
        });

        for (const cat of categories) {
            if (!domainMap[cat] || domainMap[cat].length === 0)
                return res.json({ success: true, solutions: [], message: `Không tìm thấy sản phẩm "${cat}"` });
        }

        const solutions = [];

        const backtrack = (index, currentCombo, currentOriginalTotal) => {
            if (index === categories.length) {
                const totalAfterDiscount = Math.round(currentOriginalTotal * DISCOUNT_RATE);
                
                if (totalAfterDiscount <= budgetNum && totalAfterDiscount > 0) {
                    // Check Color
                    if (preferredColor) {
                        const allSameColor = currentCombo.every(item => item.color && item.color.toLowerCase() === preferredColor.toLowerCase());
                        if (!allSameColor) return;
                    }
                    // Check Brand
                    if (preferredBrand) {
                        const allSameBrand = currentCombo.every(item => item.brand && item.brand.toLowerCase() === preferredBrand.toLowerCase());
                        if (!allSameBrand) return;
                    }
                    solutions.push({ 
                        items: [...currentCombo], 
                        originalPrice: currentOriginalTotal,
                        totalPrice: totalAfterDiscount, 
                        savings: currentOriginalTotal - totalAfterDiscount,
                        remaining: budgetNum - totalAfterDiscount 
                    });
                }
                return;
            }

            const currentCategory = categories[index];
            const items = domainMap[currentCategory].slice(0, 15);

            for (const item of items) {
                const itemPrice = Number(item.price);
                const nextOriginalTotal = currentOriginalTotal + itemPrice;
                const nextTotalAfterDiscount = Math.round(nextOriginalTotal * DISCOUNT_RATE);

                if (nextTotalAfterDiscount <= budgetNum) {
                    currentCombo.push(item);
                    backtrack(index + 1, currentCombo, nextOriginalTotal);
                    currentCombo.pop();
                } else {
                    break;
                }
            }
        };

        backtrack(0, [], 0);
        solutions.sort((a, b) => a.remaining - b.remaining);

        return res.json({ success: true, count: solutions.length, solutions: solutions.slice(0, 5), discountRate: "10%" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports = { getComboSuggestion, getAdvancedComboSuggestion };