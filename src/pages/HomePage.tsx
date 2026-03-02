import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../utils/axiosConfig';
import { formatCurrency } from '../utils/format';

export const HomePage = () => {
    const navigate = useNavigate();
    // Header chính lo việc hiển thị User
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu từ API khi component load
    useEffect(() => {
        // Gọi API với limit=8 để lấy đúng 8 sản phẩm mới nhất
        api.get('/products?limit=8')
            .then(res => {
                // API mới trả về { data: [...], pagination: ... }
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

    return (
        <div className="min-h-screen bg-[#FFFBF7] dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 transition-colors">


            <main className="max-w-7xl mx-auto px-6 py-8 pb-8">

                {/* Banner Quảng Cáo */}
                <div className="bg-orange-100 dark:bg-gray-800 rounded-3xl p-8 md:p-12 flex flex-col-reverse md:flex-row items-center justify-between mb-12 shadow-sm hover:shadow-md transition duration-500 overflow-hidden relative group">
                    <div className="z-10 mt-6 md:mt-0 text-center md:text-left">
                        <span className="inline-block px-4 py-1 rounded-full bg-orange-200 text-orange-800 text-sm font-bold mb-4 animate-pulse">Hot Deal 🔥</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-900 mb-4 leading-tight">GIẢM GIÁ SỐC 50%!</h1>
                        <p className="mb-8 text-orange-800 text-lg max-w-md">Cơ hội sở hữu đồ gia dụng thông minh với giá hủy diệt. Chỉ duy nhất hôm nay.</p>
                        <button onClick={() => navigate('/products')} className="bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-700 hover:scale-105 transition shadow-lg shadow-orange-300">
                            Mua Ngay Kẻo Lỡ
                        </button>
                    </div>
                    {/* Ảnh banner có hiệu ứng scale khi hover */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <div className="absolute inset-0 bg-orange-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <img src="/images/noicom.jpg" alt="Banner" className="w-full h-full object-contain mix-blend-multiply relative z-10 group-hover:scale-110 transition duration-700 drop-shadow-2xl" />
                    </div>
                </div>

                {/* Header Section Sản phẩm */}
                <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Sản phẩm nổi bật</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Được mua nhiều nhất tuần qua</p>
                    </div>
                    <button onClick={() => navigate('/products')} className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 hover:underline transition">
                        Xem tất cả <ArrowRight size={20} />
                    </button>
                </div>

                {/* Grid Sản Phẩm */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product.id}`)}>

                                {/* Vùng Ảnh */}
                                <div className="relative mb-4 overflow-hidden rounded-xl h-56 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-4">
                                    {product.old_price && product.old_price > product.price && (
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                                            -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                                        </span>
                                    )}
                                    <img src={product.image_url || product.img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">{product.category}</p>
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 dark:text-gray-100 flex-1 group-hover:text-orange-600 transition">{product.name}</h3>

                                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-600 font-bold text-xl">{formatCurrency(product.price)}</span>
                                            </div>
                                            {product.old_price && product.old_price > product.price && (
                                                <div className="text-gray-400 text-sm line-through decoration-gray-300">{formatCurrency(product.old_price)}</div>
                                            )}
                                        </div>
                                        <button className="bg-orange-50 text-orange-600 p-2.5 rounded-xl hover:bg-orange-600 hover:text-white transition shadow-sm">
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Nút xem tất cả cho Mobile */}
                <div className="mt-8 md:hidden">
                    <button onClick={() => navigate('/products')} className="w-full py-3 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 text-orange-600 rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-gray-700">
                        Xem tất cả sản phẩm
                    </button>
                </div>
            </main>
        </div>
    );
};