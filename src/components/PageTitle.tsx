import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = "Gia Dụng TMT 🏠";
    // Logic đặt tiêu đề dựa trên đường dẫn
    if (path === '/' || path === '/home') {
        title = "Trang Chủ - Gia Dụng TMT 🏠";
    } else if (path.startsWith('/admin')) {
        title = "Admin Dashboard | Quản Lý Hệ Thống 🛡️";
    } else if (path === '/login') {
        title = "Đăng Nhập 🔐";
    } else if (path === '/checkout') {
        title = "Giỏ Hàng Của Bạn - Thanh Toán 🛒";
    } else if (path.startsWith('/products')) {
        title = "Chi Tiết Sản Phẩm 🎁";
    } else if (path === '/order-history') {
        title = "Lịch Sử Đơn Hàng 📦";
    } else if (path === '/profile') {
        title = "Hồ Sơ Của Tôi 👤";
    } else if (path === '/register') {
        title = "Đăng Ký Tài Khoản 📝";
    } else if (path === '/thank-you') {
        title = "Cảm Ơn Bạn Đã Mua Hàng! 🙏";
    }
    // Cập nhật tiêu đề trang
    document.title = title;
  }, [location]); 
  return null; 
};
export default PageTitle;