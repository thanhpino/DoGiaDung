import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, Package, LayoutDashboard, Sparkles } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  // State cho ô tìm kiếm combo AI
  const [budgetSearch, setBudgetSearch] = useState('');

  const handleLogout = () => {
    if (logout) {
        logout();
        navigate('/');
    }
  };

  // Hàm xử lý tìm kiếm combo
  const handleComboSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetSearch.trim()) {
        // Điều hướng sang trang gợi ý kèm budget
        navigate(`/combo-suggestion?budget=${budgetSearch}`);
        setBudgetSearch('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm h-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full gap-4">
            
            {/* 1. LOGO */}
            <Link to="/home" className="flex items-center gap-2 hover:opacity-90 transition group shrink-0">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition duration-300">
                  <ShoppingBag size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight hidden sm:block">
                Gia Dụng <span className="text-orange-600">TMT</span>
              </span>
            </Link>

            {/* 2. THANH TÌM KIẾM AI (Mới thêm) */}
            <div className="flex-1 max-w-xl px-4 hidden md:block">
                <form onSubmit={handleComboSearch} className="relative group w-full">
                    <input 
                        type="number" 
                        placeholder="Nhập ngân sách (VD: 5.000.000)..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-full border border-orange-200 bg-orange-50/30 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm text-sm font-medium text-orange-900 placeholder-gray-400"
                        value={budgetSearch}
                        onChange={(e) => setBudgetSearch(e.target.value)}
                    />
                    <Sparkles className="absolute left-3.5 top-2.5 text-orange-500 animate-pulse" size={18} />
                    
                    {/* Tooltip gợi ý khi hover */}
                    <div className="absolute top-full left-0 mt-2 w-full bg-white p-3 rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform translate-y-2 group-hover:translate-y-0">
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <Sparkles size={12} className="text-orange-500"/> Gợi ý Combo AI (CSP):
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Nhập số tiền bạn có, hệ thống sẽ tự động tìm trọn bộ sản phẩm tối ưu nhất.</p>
                    </div>
                </form>
            </div>

            {/* 3. MENU LINK (Vẫn giữ lại) */}
            <div className="hidden lg:flex items-center gap-6 font-bold text-gray-500 text-sm shrink-0">
                 <Link to="/home" className="hover:text-orange-600 transition">Trang chủ</Link>
                 <Link to="/products" className="hover:text-orange-600 transition">Sản phẩm</Link>
            </div>

            {/* 4. USER & GIỎ HÀNG */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              
              {/* --- NÚT ADMIN --- */}
              {user?.role === 'admin' && (
                <Link 
                    to="/admin" 
                    className="hidden xl:flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-black transition shadow-lg"
                >
                    <LayoutDashboard size={14}/> Admin
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
                <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-4 md:border-l md:border-gray-200">
                  
                  {/* Avatar/Name */}
                  <Link to="/profile" className="hidden lg:flex items-center gap-2 font-bold text-gray-700 hover:text-orange-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full transition hover:shadow-md">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <User size={14} />
                    </div>
                    <span className="text-sm truncate max-w-[80px]">{user.name}</span>
                  </Link>
                  
                  {/* Mobile User Icon */}
                  <Link to="/profile" className="lg:hidden p-2 text-gray-600 hover:text-orange-600">
                    <User size={22}/>
                  </Link>

                  <Link to="/order-history" title="Đơn hàng" className="hidden sm:block p-2 text-gray-400 hover:text-blue-600 transition">
                    <Package size={22} />
                  </Link>

                  <button onClick={handleLogout} title="Đăng xuất" className="p-2 text-gray-400 hover:text-red-500 transition">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="hidden lg:block text-gray-600 font-bold hover:text-orange-600 px-3">Đăng nhập</Link>
                  <Link to="/register" className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 text-sm whitespace-nowrap">
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