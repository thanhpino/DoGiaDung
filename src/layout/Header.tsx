import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, Package, LayoutDashboard } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
        logout();
        navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            
            {/* 1. LOGO */}
            <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition group">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition duration-300">
                  <ShoppingBag size={20} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Gia Dụng <span className="text-orange-600">TMT</span>
              </span>
            </Link>

            {/* 2. MENU GIỮA */}
            <div className="hidden md:flex items-center gap-8 font-bold text-gray-500">
              <Link to="/home" className="hover:text-orange-600 transition">Trang chủ</Link>
              <Link to="/products" className="hover:text-orange-600 transition">Sản phẩm</Link>
            </div>

            {/* 3. USER & GIỎ HÀNG */}
            <div className="flex items-center gap-3">
              
              {/* --- NÚT ADMIN --- */}
              {user?.role === 'admin' && (
                <Link 
                    to="/admin" 
                    className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black transition shadow-lg mr-2"
                >
                    <LayoutDashboard size={14}/> Admin Site
                </Link>
              )}

              {/* Giỏ hàng */}
              <Link to="/checkout" className="relative p-2.5 rounded-full hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition group">
                <ShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform group-hover:scale-110 transition">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Logic hiển thị User */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 md:pl-4 md:border-l md:border-gray-200">
                  
                  {/* Nút Profile */}
                  <Link to="/profile" className="hidden md:flex items-center gap-2 font-bold text-gray-700 hover:text-orange-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full transition hover:shadow-md">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <User size={14} />
                    </div>
                    <span className="text-sm truncate max-w-[100px]">{user.name}</span>
                  </Link>
                  
                  {/* Icon Mobile */}
                  <Link to="/profile" className="md:hidden p-2 text-gray-600 hover:text-orange-600">
                    <User size={22}/>
                  </Link>

                  {/* Nút Đơn hàng */}
                  <Link to="/order-history" title="Đơn hàng của tôi" className="p-2 text-gray-400 hover:text-blue-600 transition">
                    <Package size={22} />
                  </Link>

                  {/* Đăng xuất */}
                  <button onClick={handleLogout} title="Đăng xuất" className="p-2 text-gray-400 hover:text-red-500 transition">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="hidden md:block text-gray-600 font-bold hover:text-orange-600 px-3">Đăng nhập</Link>
                  <Link to="/register" className="bg-orange-600 text-white px-5 py-2 rounded-full font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 text-sm">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    </nav>
  );
};