import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, ChevronDown, ChevronUp, Star } from 'lucide-react'; // Thêm Star
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ReviewModal } from '../components/ReviewModal';

export const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]); 
    
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    useEffect(() => {
        if (user) {
            axios.get(`${import.meta.env.VITE_API_URL}/api/orders/user/${user.id}`)
                .then(res => {
                    setOrders(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [user]);

    // HÀM TẢI LẠI ITEM
    const refreshOrderItems = async (orderId: string) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/items`);
            setOrderItems(res.data);
        } catch (error) {
            console.error("Lỗi tải chi tiết đơn:", error);
        }
    };

    const toggleExpand = async (orderId: string) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null); 
            setOrderItems([]);
        } else {
            setExpandedOrder(orderId);
            await refreshOrderItems(orderId); // Gọi hàm chung
        }
    };

    if (!user) return <div className="p-12 text-center">Vui lòng đăng nhập để xem đơn hàng.</div>;
    if (loading) return <div className="p-12 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen bg-[#FFFBF7]">
            <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3 text-gray-800">
                <div className="bg-orange-100 p-3 rounded-xl"><Package className="text-orange-600" size={32}/></div>
                Đơn hàng của tôi
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-gray-800">Chưa có đơn hàng nào</h3>
                    <p className="text-gray-500 mt-2 mb-6">Bạn chưa mua gì cả. Hãy dạo một vòng nhé!</p>
                    <Link to="/products" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden transition hover:shadow-md">
                            
                            {/* Header Đơn Hàng */}
                            <div className="p-6 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-50 p-3 rounded-full text-orange-600 font-bold text-lg">#{order.id}</div>
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.created_at).toLocaleDateString()}</p>
                                            <p className="font-bold text-gray-800 text-lg">{formatCurrency(order.total_amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2">
                                            <Truck size={14}/> {order.status}
                                        </span>
                                        {expandedOrder === order.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                    </div>
                                </div>
                            </div>

                            {/* Chi tiết mở rộng */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                                        <div>
                                            <p className="font-bold text-gray-800">Thông tin giao hàng:</p>
                                            <p>{order.customer_name} - {order.customer_phone}</p>
                                            <p>{order.customer_address}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">Thanh toán:</p>
                                            <p className="uppercase">{order.payment_method}</p>
                                            <p className="italic">Note: {order.note || 'Không'}</p>
                                        </div>
                                    </div>

                                    {/* DANH SÁCH SẢN PHẨM */}
                                    <h4 className="font-bold text-gray-800 mb-3">Sản phẩm đã mua:</h4>
                                    <div className="space-y-4">
                                        {orderItems.length === 0 ? <p>Đang tải sản phẩm...</p> : 
                                         orderItems.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image_url} alt="" className="w-12 h-12 rounded object-cover border"/>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                        <p className="text-xs text-gray-500">SL: {item.quantity} x {formatCurrency(item.price)}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* --- LOGIC HIỂN THỊ NÚT HOẶC ĐÃ ĐÁNH GIÁ --- */}
                                                {order.status === 'Hoàn thành' && (
                                                    item.rating ? (
                                                        // Nếu ĐÃ có rating -> Hiện kết quả
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 mb-1">
                                                                Đã đánh giá
                                                            </span>
                                                            <div className="flex text-yellow-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={12} fill={i < item.rating ? "currentColor" : "none"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Nếu CHƯA có rating -> Hiện nút Viết đánh giá
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedProduct(item);
                                                                setIsReviewOpen(true);
                                                            }} 
                                                            className="text-sm font-bold text-orange-600 hover:text-orange-800 underline bg-orange-50 px-3 py-1 rounded-lg"
                                                        >
                                                            Viết đánh giá
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* --- MODAL ĐÁNH GIÁ  --- */}
            {selectedProduct && (
                <ReviewModal 
                    isOpen={isReviewOpen} 
                    onClose={() => setIsReviewOpen(false)} 
                    product={selectedProduct} 
                    userId={user.id} 
                    onSuccess={() => refreshOrderItems(expandedOrder!)} 
                />
            )}
        </div>
    );
};