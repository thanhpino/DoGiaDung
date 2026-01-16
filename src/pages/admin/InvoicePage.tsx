import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Phone, MapPin } from 'lucide-react';

export const InvoicePage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi song song 2 API để lấy thông tin đơn hàng và sản phẩm
                const [orderRes, itemsRes] = await Promise.all([
                    axios.get(`http://localhost:8081/api/orders/${id}`),
                    axios.get(`http://localhost:8081/api/orders/${id}/items`)
                ]);

                setOrder(orderRes.data);
                setItems(itemsRes.data);
                setLoading(false);

                // Tự động mở hộp thoại in sau khi tải xong dữ liệu (delay 500ms để render kịp)
                setTimeout(() => {
                    window.print();
                }, 500);

            } catch (error) {
                console.error("Lỗi tải hóa đơn:", error);
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Đang tạo hóa đơn...</div>;
    if (!order) return <div className="text-center mt-10">Không tìm thấy đơn hàng #{id}</div>;

    return (
        <div className="bg-white text-black font-sans p-8 max-w-[210mm] mx-auto min-h-screen relative">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-widest text-gray-900">Hóa Đơn</h1>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p><span className="font-bold">Mã đơn:</span> #{order.id}</p>
                        <p><span className="font-bold">Ngày đặt:</span> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                        <p><span className="font-bold">Trạng thái:</span> {order.status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-orange-600 flex items-center justify-end gap-2">
                        <ShoppingBag size={20}/> GIA DỤNG TMT
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">670/32 Đoàn Văn Bơ, P.16, Q.4, TP.HCM</p>
                    <p className="text-sm text-gray-500">Hotline: 0932 013 424</p>
                    <p className="text-sm text-gray-500">Email: tt3145539@gmail.com</p>
                </div>
            </div>

            {/* --- THÔNG TIN KHÁCH HÀNG --- */}
            <div className="mb-8 grid grid-cols-2 gap-12">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm uppercase mb-3 border-b pb-1 inline-block">Thông tin khách hàng</h3>
                    <div className="text-sm space-y-1">
                        <p className="font-bold text-lg">{order.customer_name}</p>
                        <p className="flex items-start gap-2 text-gray-600">
                            <MapPin size={14} className="mt-1 shrink-0"/> {order.customer_address}
                        </p>
                        <p className="flex items-center gap-2 text-gray-600">
                            <Phone size={14}/> {order.customer_phone}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-gray-800 text-sm uppercase mb-3 border-b pb-1 inline-block">Thông tin thanh toán</h3>
                    <div className="text-sm space-y-1">
                        <p><span className="text-gray-500">Phương thức:</span> <span className="font-bold">{order.payment_method}</span></p>
                        {order.note && (
                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-left italic border border-dashed border-gray-300">
                                <span className="font-bold not-italic">Ghi chú:</span> {order.note}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- BẢNG SẢN PHẨM --- */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                        <th className="text-left py-3 px-2">Sản phẩm</th>
                        <th className="text-center py-3 px-2">SL</th>
                        <th className="text-right py-3 px-2">Đơn giá</th>
                        <th className="text-right py-3 px-2">Thành tiền</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-2 font-medium">{item.name}</td>
                            <td className="text-center py-3 px-2">{item.quantity}</td>
                            <td className="text-right py-3 px-2">{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                            <td className="text-right py-3 px-2 font-bold">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- TỔNG KẾT --- */}
            <div className="flex justify-end">
                <div className="w-1/2 space-y-2">
                    {/* Nếu bro có lưu phí ship vào DB thì hiện ở đây, tạm thời mình để 30k hoặc 0 */}
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Phí vận chuyển:</span>
                        <span>30.000 ₫</span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-xl border-t-2 border-gray-800 text-gray-900">
                        <span>Tổng cộng:</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="mt-20 text-center space-y-2">
                <p className="font-bold text-gray-800">Cảm ơn quý khách đã mua hàng!</p>
                <div className="text-xs text-gray-500">
                    <p>Vui lòng kiểm tra kỹ hàng hóa trước khi nhận.</p>
                    <p>Mọi thắc mắc xin liên hệ hotline hoặc website dogiadungtmt.com</p>
                </div>
                <div className="pt-4">
                    {/* Bro có thể tạo QR code dẫn về web hoặc check đơn hàng ở đây nếu thích */}
                    <p className="font-mono text-[10px] text-gray-400">INVOICE ID: {order.id} | PRINTED: {new Date().toLocaleString()}</p>
                </div>
            </div>
            
            {/* CSS ĐỂ ẨN CÁC PHẦN KHÔNG CẦN KHI IN */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; background-color: white; }
                    /* Ẩn các nút bấm nếu có */
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
};