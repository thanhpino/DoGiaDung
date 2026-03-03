-- Migration: Thêm cột stock vào bảng products
-- Chạy: mysql -u root -p dogiadung_db < migrations/add_stock_column.sql

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 100;

-- Cập nhật stock mặc định cho các sản phẩm hiện có
UPDATE products SET stock = 100 WHERE stock IS NULL OR stock = 0;
