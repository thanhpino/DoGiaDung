import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package } from 'lucide-react';
import { useEffect } from 'react'; 
import { Toaster, toast } from 'react-hot-toast'; 
import { io } from "socket.io-client";

export const AdminLayout = () => {
  const location = useLocation(); 

  // --- LOGIC SOCKET.IO  ---
  useEffect(() => {
    // 1. Kết nối Socket
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8081"; 
    const socket = io(socketUrl);

    socket.on("connect", () => {
        console.log("🟢 Admin đã kết nối Socket để nhận đơn!");
    });

    // 2. Lắng nghe sự kiện "NEW_ORDER" từ Server
    socket.on("NEW_ORDER", (data: any) => {
        // A. Phát âm thanh Ting Ting
        const audio = new Audio('/ting.mp3'); 
        audio.play().catch(_e => console.log("Cần tương tác để phát âm thanh"));

        // B. Hiện thông báo đẹp
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-green-500`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {/* Icon tiền bay */}
                            <span className="text-3xl">💰</span>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-gray-900">
                                Ting ting! Đơn hàng mới #{data.orderId}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Khách: <span className="font-semibold text-green-700">{data.customer_name}</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Tổng tiền: <span className="font-bold text-orange-600">{new Intl.NumberFormat('vi-VN').format(data.total)} đ</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button 
                        onClick={() => toast.dismiss(t.id)} 
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-right' });
    });

    // 3. Dọn dẹp khi thoát trang Admin
    return () => {
        socket.disconnect();
    };
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
      <Toaster/> 
      
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