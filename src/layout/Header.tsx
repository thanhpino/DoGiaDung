import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, Package, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  // State cho mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [budgetSearch, setBudgetSearch] = useState('');

  const handleLogout = () => {
    if (logout) {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    }
  };

  const handleComboSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetSearch.trim()) {
        navigate(`/combo-suggestion?budget=${budgetSearch}`);
        setBudgetSearch('');
        setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            
            {/* 1. LOGO */}
            <Link to="/home" className="flex items-center gap-2 hover:opacity-90 transition group shrink-0">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <ShoppingBag size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">
                Gia Dụng <span className="text-orange-600">TMT</span>
              </span>
            </Link>

            {/* 2. DESKTOP SEARCH */}
            <div className="flex-1 max-w-xl px-4 hidden lg:block">
                <form onSubmit={handleComboSearch} className="relative group w-full">
                    <input 
                        type="number" 
                        placeholder="Nhập ngân sách của bạn(VD: 5000000)..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-full border border-orange-200 bg-orange-50/30 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm text-sm font-medium text-orange-900 placeholder-gray-400"
                        value={budgetSearch}
                        onChange={(e) => setBudgetSearch(e.target.value)}
                    />
                    <Sparkles className="absolute left-3.5 top-2.5 text-orange-500 animate-pulse" size={18} />
                </form>
            </div>

            {/* 3. DESKTOP MENU & ACTIONS */}
            <div className="hidden lg:flex items-center gap-6">
                 {/* Links */}
                 <div className="flex items-center gap-6 font-bold text-gray-500 text-sm">
                     <Link to="/home" className="hover:text-orange-600 transition">Trang chủ</Link>
                     <Link to="/products" className="hover:text-orange-600 transition">Sản phẩm</Link>
                 </div>

                 {/* User & Cart */}
                 <div className="flex items-center gap-3">
                    {/* Admin Link */}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-black transition shadow-lg">
                            <LayoutDashboard size={14}/> Admin
                        </Link>
                    )}

                    {/* Cart */}
                    <Link to="/checkout" className="relative p-2.5 rounded-full hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition group">
                        <ShoppingCart size={22} />
                        {cartItems.length > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform group-hover:scale-110 transition">
                            {cartItems.length}
                          </span>
                        )}
                    </Link>

                    {/* Auth */}
                    {user ? (
                        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                            <Link to="/profile" className="flex items-center gap-2 font-bold text-gray-700 hover:text-orange-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full transition hover:shadow-md">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                    <User size={14} />
                                </div>
                                <span className="text-sm truncate max-w-[80px]">{user.name}</span>
                            </Link>
                            <Link to="/order-history" title="Đơn hàng của bạn" className="p-2 text-gray-400 hover:text-blue-600 transition">
                                <Package size={22} />
                            </Link>
                            <button onClick={handleLogout} title="Đăng xuất" className="p-2 text-gray-400 hover:text-red-500 transition">
                                <LogOut size={22} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-gray-600 font-bold hover:text-orange-600 px-3">Đăng nhập</Link>
                            <Link to="/register" className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 text-sm whitespace-nowrap">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                 </div>
            </div>

            {/* 4. MOBILE TOGGLE BUTTON */}
            <div className="flex items-center gap-2 lg:hidden">
                <Link to="/checkout" className="relative p-2 text-gray-600 hover:text-orange-600">
                    <ShoppingCart size={24} />
                    {cartItems.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {cartItems.length}
                        </span>
                    )}
                </Link>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-orange-50 rounded-lg transition"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-5 duration-200 absolute w-full left-0 top-20 h-screen overflow-y-auto pb-20">
                <div className="p-4 space-y-4">
                    {/* Mobile Search */}
                    <form onSubmit={handleComboSearch} className="relative group w-full">
                        <input 
                            type="number" 
                            placeholder="Nhập ngân sách của bạn..." 
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-orange-200 bg-gray-50 focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium"
                            value={budgetSearch}
                            onChange={(e) => setBudgetSearch(e.target.value)}
                        />
                        <Sparkles className="absolute left-3.5 top-3.5 text-orange-500" size={18} />
                    </form>

                    <div className="grid grid-cols-1 gap-2">
                        <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-orange-50 rounded-lg font-bold text-gray-700">Trang chủ</Link>
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-orange-50 rounded-lg font-bold text-gray-700">Sản phẩm</Link>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 hover:bg-gray-50 rounded-lg font-medium text-gray-600">Quản lý hồ sơ</Link>
                                <Link to="/order-history" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 hover:bg-gray-50 rounded-lg font-medium text-gray-600">Lịch sử đơn hàng</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 hover:bg-gray-50 rounded-lg font-bold text-blue-600">Vào trang Admin</Link>
                                )}
                                <button onClick={handleLogout} className="w-full text-left p-3 hover:bg-red-50 text-red-600 rounded-lg font-bold">Đăng xuất</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Đăng nhập</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200">Đăng ký ngay</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </nav>
  );
};