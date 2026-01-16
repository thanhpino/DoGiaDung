import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package } from 'lucide-react';
import { useEffect, useRef } from 'react'; 
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast'; // Dùng toast thông báo popup

export const AdminLayout = () => {
  const location = useLocation();
  
  // --- LOGIC THÔNG BÁO ĐƠN MỚI ---
  const previousOrderCount = useRef<number>(0); // Lưu số lượng đơn cũ
  const isFirstLoad = useRef<boolean>(true); // Check lần đầu load trang

  useEffect(() => {
    // Hàm kiểm tra đơn hàng
    const checkNewOrders = async () => {
        try {
            // Gọi API thống kê để lấy tổng số đơn
            const res = await axios.get('${import.meta.env.VITE_API_URL}/api/stats');
            const currentCount = res.data.orders; // API stats trả về { revenue, orders, users }

            if (isFirstLoad.current) {
                // Lần đầu vào trang thì chỉ lưu lại số lượng, không báo gì cả
                previousOrderCount.current = currentCount;
                isFirstLoad.current = false;
            } else {
                // Nếu số đơn hiện tại > số đơn cũ -> CÓ ĐƠN MỚI!
                if (currentCount > previousOrderCount.current) {
                    // 1. Phát âm thanh
                    const audio = new Audio('/ting.mp3'); 
                    audio.play().catch(() => console.log("Trình duyệt chặn auto-play phát âm thanh, cần tương tác trước"));
                    
                    // 2. Hiện thông báo
                    toast.success(`🔔 Có ${currentCount - previousOrderCount.current} đơn hàng mới!`, {
                        duration: 5000,
                        position: 'top-right',
                        style: { border: '1px solid #ea580c', padding: '16px', color: '#ea580c' },
                    });

                    // 3. Cập nhật lại số lượng cũ
                    previousOrderCount.current = currentCount;
                }
            }
        } catch (error) {
            console.error("Lỗi check đơn mới:", error);
        }
    };

    // Chạy ngay 1 cái lúc mới mount
    checkNewOrders();

    // Cài đặt lặp lại mỗi 15 giây (15000ms)
    const intervalId = setInterval(checkNewOrders, 15000);

    // Dọn dẹp khi thoát component
    return () => clearInterval(intervalId);
  }, []);

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng Quan' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Đơn Hàng' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Sản Phẩm' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Khách Hàng' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cài Đặt' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Toaster/> {/* Toaster để hiện thông báo */}
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1a1c23] text-white flex flex-col fixed h-full z-10 shadow-xl">
        <div className="h-24 flex flex-col items-center justify-center border-b border-gray-800">
            <h1 className="text-2xl font-extrabold text-orange-600 tracking-wider">ADMIN TMT</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Quản lý hệ thống</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                            isActive 
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 font-bold' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <div className={`absolute left-0 top-0 h-full w-1 bg-white transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <Link to="/home" className="flex items-center gap-3 text-gray-400 hover:text-white transition px-4 py-2 hover:bg-gray-800 rounded-lg group">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/> 
                <span className="font-medium">Về Trang Chủ</span>
            </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
};