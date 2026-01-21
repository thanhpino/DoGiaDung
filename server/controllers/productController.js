// controllers/productController.js
const db = require('../config/database');

const getProducts = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || '';
    const category = req.query.category || 'All';
    const offset = (page - 1) * limit;

    let whereSql = "WHERE 1=1";
    const params = [];

    if (search) { 
        whereSql += " AND name LIKE ?"; 
        params.push(`%${search}%`); 
    }
    if (category !== 'All') { 
        whereSql += " AND category = ?"; 
        params.push(category); 
    }

    const sqlCount = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    db.query(sqlCount, params, (err, countResult) => {
        if(err) return res.status(500).json(err);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        const sqlData = `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, limit, offset];
        
        db.query(sqlData, dataParams, (err, products) => {
            if(err) return res.status(500).json(err);
            res.json({ 
                data: products, 
                pagination: { page, limit, total, totalPages } 
            });
        });
    });
};

const getProductById = (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length === 0) return res.status(404).json("Không tìm thấy sản phẩm");
        return res.json(data[0]);
    });
};

const createProduct = (req, res) => {
    const { name, price, category, img, description } = req.body;
    const sql = "INSERT INTO products (name, price, category, image_url, description) VALUES (?)";
    const values = [name, price, category, img, description];
    
    db.query(sql, [values], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Thêm sản phẩm thành công");
    });
};

const updateProduct = (req, res) => {
    const { name, price, category, img, description } = req.body;
    const sql = "UPDATE products SET name=?, price=?, category=?, image_url=?, description=? WHERE id=?";
    const values = [name, price, category, img, description, req.params.id];
    
    db.query(sql, values, (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Cập nhật thành công");
    });
};

const deleteProduct = (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json("Xóa sản phẩm thành công");
    });
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};