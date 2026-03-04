import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import api from '../utils/axiosConfig';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const WishlistPage = () => {
    const { user } = useAuth();
    const { toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/api/wishlist');
            setItems(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { if (user) fetchWishlist(); }, [user]);

    const handleRemove = async (productId: number) => {
        await toggleWishlist(productId);
        setItems(prev => prev.filter(item => item.id !== productId));
        toast.success('Đã xóa khỏi yêu thích');
    };

    const handleAddToCart = (product: any) => {
        addToCart(product);
        toast.success('Đã thêm vào giỏ hàng!');
    };

    const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-lg">Vui lòng đăng nhập để xem danh sách yêu thích</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sản phẩm yêu thích</h1>
                <span className="text-gray-500">({items.length})</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có sản phẩm yêu thích nào</p>
                    <a href="/products" className="text-orange-600 font-semibold hover:underline mt-2 inline-block">
                        Khám phá sản phẩm →
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 group hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img src={item.image_url || 'https://placehold.co/400x400?text=No+Image'} alt={item.name}
                                    className="w-full h-48 object-cover" />
                                <button onClick={() => handleRemove(item.id)}
                                    className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-red-50 transition cursor-pointer">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{item.name}</h3>
                                <p className="text-orange-600 font-bold text-lg">{formatPrice(item.price)}</p>
                                <button onClick={() => handleAddToCart(item)}
                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                    <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
