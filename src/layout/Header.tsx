import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard, Sparkles, Menu, X, Sun, Moon, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationBell } from '../components/NotificationBell';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems } = useCart();
    const { isDark, toggleTheme } = useTheme();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isCartBouncing, setIsCartBouncing] = useState(false);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [budgetSearch, setBudgetSearch] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        const t = setTimeout(() => setIsLoadingPage(false), 800);
        return () => clearTimeout(t);
    }, [location.pathname]);

    const prevCartCount = useRef(cartItems.length);
    useEffect(() => {
        if (cartItems.length > prevCartCount.current) {
            setIsCartBouncing(true);
            const t = setTimeout(() => setIsCartBouncing(false), 600);
            return () => clearTimeout(t);
        }
        prevCartCount.current = cartItems.length;
    }, [cartItems.length]);

    const handleLogout = () => {
        if (logout) { logout(); navigate('/'); setIsMobileMenuOpen(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (budgetSearch.trim()) {
            navigate(`/combo-suggestion?budget=${budgetSearch}`);
            setBudgetSearch('');
            setIsMobileMenuOpen(false);
        }
    };

    const scrollClasses = isScrolled 
        ? 'h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg border-b border-orange-100/30' 
        : 'h-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-orange-100 dark:border-gray-700';

    return (
        <header className={`sticky top-0 z-50 transition-all duration-500 font-sans w-full flex items-center ${scrollClasses}`}>
            {isLoadingPage && (
                <div className="absolute top-0 left-0 w-full h-[3px] z-[60] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 animate-loadingProgress" />
                </div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center w-full gap-4 transition-all duration-500">
                    <Link to="/home" className="flex items-center gap-2 hover:opacity-90 transition-all group shrink-0">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                            <ShoppingBag size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">
                            Gia Dụng <span className="text-orange-600">TMT</span>
                        </span>
                    </Link>

                    <div className="flex-1 max-w-xl px-4 hidden lg:block">
                        <form onSubmit={handleSearch} className="relative group w-full">
                            <input
                                type="number"
                                placeholder="Nhập ngân sách của bạn..."
                                className="w-full pl-11 pr-4 py-2 rounded-full border border-orange-200 bg-orange-50/30 focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                value={budgetSearch}
                                onChange={(e) => setBudgetSearch(e.target.value)}
                            />
                            <Sparkles className="absolute left-3.5 top-2.5 text-orange-500 animate-pulse" size={18} />
                        </form>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/home" className="font-bold text-gray-600 dark:text-gray-300 text-sm hover:text-orange-600">Trang chủ</Link>
                        <Link to="/products" className="font-bold text-gray-600 dark:text-gray-300 text-sm hover:text-orange-600">Sản phẩm</Link>
                        
                        <div className="flex items-center gap-2 ml-4">
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="group relative p-2.5 rounded-full bg-gray-900 text-white hover:scale-105 transition shadow-lg">
                                    <LayoutDashboard size={18} />
                                    <span className="tooltip-text">Quản trị Admin <span className="tooltip-arrow" /></span>
                                </Link>
                            )}
                            <button onClick={toggleTheme} className="group relative p-2.5 rounded-full hover:bg-orange-50 text-gray-500 transition">
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="tooltip-text">{isDark ? 'Chế độ sáng' : 'Chế độ tối'} <span className="tooltip-arrow" /></span>
                            </button>
                            <NotificationBell />
                            <Link to="/wishlist" className="group relative p-2.5 rounded-full hover:bg-orange-50 text-gray-500 transition">
                                <Heart size={20} />
                                <span className="tooltip-text">Yêu thích <span className="tooltip-arrow" /></span>
                            </Link>
                            <Link to="/checkout" className={`group relative p-2.5 rounded-full hover:bg-orange-50 transition ${isCartBouncing ? 'animate-cartBounce' : ''}`}>
                                <ShoppingCart size={22} />
                                <span className="tooltip-text">Giỏ hàng <span className="tooltip-arrow" /></span>
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center gap-2 pl-2">
                                    <Link to="/profile" className="flex items-center gap-2 font-bold px-3 py-1.5 bg-white border rounded-full hover:shadow-md transition">
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><User size={14} /></div>
                                        <span className="text-sm">{user.name}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="group relative p-2 text-gray-400 hover:text-red-500">
                                        <LogOut size={20} />
                                        <span className="tooltip-text">Đăng xuất <span className="tooltip-arrow" /></span>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="bg-orange-600 text-white px-5 py-2 rounded-full font-bold shadow-lg text-sm">Đăng nhập</Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-gray-900 absolute top-full left-0 w-full border-t shadow-xl p-6 space-y-6">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input type="number" placeholder="Ngân sách..." className="w-full pl-11 py-3 rounded-xl border bg-gray-50 outline-none" value={budgetSearch} onChange={(e) => setBudgetSearch(e.target.value)} />
                        <Sparkles className="absolute left-3.5 top-3.5 text-orange-500" size={18} />
                    </form>
                    <div className="grid grid-cols-1 gap-4 font-bold">
                        <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</Link>
                        {user ? (
                            <button onClick={handleLogout} className="text-left text-red-600">Đăng xuất</button>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};