import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../utils/axiosConfig';
import { formatCurrency } from '../utils/format';
import { Helmet } from 'react-helmet-async';

export const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Mouse movement for background effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Load data
    useEffect(() => {
        api.get('/products?limit=8')
            .then(res => {
                if (res.data && res.data.data) {
                    setProducts(res.data.data);
                } else {
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải trang chủ:", err);
                setLoading(false);
            });
    }, []);

    // Scroll Reveal Logic
    useEffect(() => {
        if (!loading && typeof window !== 'undefined') {
            const revealCallback = (entries: IntersectionObserverEntry[]) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Optional: stop observing once revealed
                        // observerRef.current?.unobserve(entry.target);
                    }
                });
            };

            const options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
            observerRef.current = new IntersectionObserver(revealCallback, options);
            
            const targets = document.querySelectorAll('.reveal');
            targets.forEach(t => observerRef.current?.observe(t));

            return () => {
                if (observerRef.current) {
                    observerRef.current.disconnect();
                }
            };
        }
    }, [loading, products]);

    return (
        <div className="min-h-screen bg-[#FFFBF7] dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 transition-colors overflow-x-hidden">
            <Helmet>
                <title>Gia Dụng TMT - Mua sắm thông minh cho ngôi nhà của bạn</title>
                <meta name="description" content="Chuyên cung cấp các sản phẩm đồ gia dụng chính hãng, giá tốt, bảo hành dài hạn." />
            </Helmet>

            <main className="max-w-7xl mx-auto px-6 py-8 pb-8 relative">
                {/* Cursor Glow Effect */}
                <div 
                    className="fixed w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-[100px] pointer-events-none z-0 transition-transform duration-300 ease-out hidden lg:block"
                    style={{ 
                        transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)` 
                    }}
                />

                {/* Banner Quảng Cáo */}
                <div className="bg-orange-50 dark:bg-gray-900 rounded-[3rem] p-8 md:p-16 flex flex-col-reverse md:flex-row items-center justify-between mb-16 shadow-2xl overflow-hidden relative group animate-fadeInUp border border-orange-100/50 dark:border-gray-800">
                    
                    {/* Floating Orbs */}
                    <div className="absolute top-[-10%] right-[10%] w-64 h-64 bg-orange-200/40 dark:bg-orange-900/20 rounded-full blur-3xl animate-orbFloat -z-10"></div>
                    <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-red-100/40 dark:bg-red-900/10 rounded-full blur-3xl animate-orbFloat delay-1000 -z-10"></div>

                    <div className="z-10 mt-6 md:mt-0 text-center md:text-left">
                        <span className="inline-block px-4 py-1 rounded-full bg-orange-600 text-white text-xs font-black mb-6 animate-bounce shadow-lg uppercase tracking-widest">Siêu Ưu Đãi 🎁</span>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                            GIẢM GIÁ <br />
                            <span className="text-shimmer">SỐC 50%!</span>
                        </h1>
                        <p className="mb-10 text-gray-600 dark:text-gray-400 text-xl max-w-md font-medium leading-relaxed">Nâng tầm không gian sống với những thiết bị thông minh bậc nhất.</p>
                        <button 
                            onClick={() => navigate('/products')} 
                            className="bg-orange-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-orange-700 hover:scale-105 transition-all shadow-xl group/btn relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">Khám Phá Ngay <ArrowRight size={22} className="group-hover/btn:translate-x-2 transition-transform"/></span>
                        </button>
                    </div>

                    <div className="relative w-full md:w-[450px] aspect-video md:aspect-square flex items-center justify-center rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <img 
                            src="/images/kitchen_banner.png" 
                            alt="Premium Kitchen" 
                            className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-1000" 
                        />
                    </div>
                </div>

                {/* Header Section Sản phẩm */}
                <div className="reveal flex justify-between items-end mb-10 border-b border-gray-100 dark:border-gray-800 pb-6 opacity-0 translate-y-10 transition-all duration-700">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-1 bg-orange-600 rounded-full"></div>
                             <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">Phổ biến</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Bộ Sưu Tập Nổi Bật</h2>
                    </div>
                    <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-black hover:text-orange-600 transition group py-2">
                        XEM TẤT CẢ <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {/* Grid Sản Phẩm */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-96 bg-gray-100 dark:bg-gray-800 rounded-[2rem] relative overflow-hidden animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-0 translate-y-10 transition-all duration-700 delay-300">
                        {products.map((product, index) => (
                            <div 
                                key={product.id} 
                                className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col hover-tilt"
                                style={{ animationDelay: `${(index % 4) * 100}ms` }}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="relative mb-4 overflow-hidden rounded-[1.5rem] h-56 bg-gray-50 flex items-center justify-center p-4">
                                    <img src={product.image_url || product.img} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 dark:text-gray-100">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-auto pt-4">
                                        <span className="text-red-600 font-black text-xl">{formatCurrency(product.price)}</span>
                                        <button className="bg-gray-900 dark:bg-orange-600 text-white p-3 rounded-2xl">
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};