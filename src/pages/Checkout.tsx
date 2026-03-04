import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Banknote, QrCode, CreditCard, Trash2, Plus, Minus, Truck, FileText, X, Globe, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatCurrency } from '../utils/format';

export const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // --- COUPON STATE ---
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<{ code: string; discount_type: string; discount_value: number; discount_amount: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // --- STATE QUẢN LÝ FORM ---
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                note: ''
            });
        }
    }, [user]);

    const shippingFee = cartItems.length > 0 ? 30000 : 0;
    const discountAmount = couponApplied?.discount_amount || 0;
    const totalAmount = getCartTotal() + shippingFee - discountAmount;
    const totalAmountUSD = (totalAmount / 26004).toFixed(2);

    // --- HÀM ÁP DỤNG MÃ GIẢM GIÁ ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { toast.error('Nhập mã giảm giá!'); return; }
        setCouponLoading(true);
        try {
            const res = await api.post('/api/coupons/validate', {
                code: couponCode.trim(),
                order_total: getCartTotal()
            });
            const c = res.data.coupon;
            // Tính discount_amount
            let dAmt = 0;
            if (c.discount_type === 'percent') {
                dAmt = Math.round(getCartTotal() * c.discount_value / 100);
            } else {
                dAmt = c.discount_value;
            }
            setCouponApplied({ code: couponCode.trim(), discount_type: c.discount_type, discount_value: c.discount_value, discount_amount: dAmt });
            toast.success(`Áp dụng mã "${couponCode}" thành công! Giảm ${formatCurrency(dAmt)}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Mã giảm giá không hợp lệ');
        } finally { setCouponLoading(false); }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(null);
        setCouponCode('');
        toast.success('Đã hủy mã giảm giá');
    };

    // --- HÀM GỬI ĐƠN HÀNG ---
    const submitOrderToBackend = async (method: string) => {
        // Validate
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
            setIsProcessing(false);
            return;
        }

        // Payload cơ bản
        const orderPayload = {
            user_id: user?.id,
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_address: formData.address,
            total_amount: totalAmount,
            payment_method: method,
            note: formData.note,
            items: cartItems,
            coupon_code: couponApplied?.code || null,
            discount_amount: discountAmount
        };

        try {
            // --- XỬ LÝ RIÊNG CHO VNPAY ---
            if (method === 'vnpay') {
                // Gọi API tạo URL thanh toán từ Backend
                const res = await api.post('/api/create_payment_url', {
                    amount: totalAmount,
                    orderDescription: `Payment order ${Date.now()}`,
                    language: 'vn'
                });

                // Lưu tạm thông tin đơn hàng vào localStorage để khi quay về thì lưu vào DB
                localStorage.setItem('pendingOrder', JSON.stringify(orderPayload));

                // Chuyển hướng sang VNPAY
                window.location.href = res.data.paymentUrl;
                return;
            }

            // --- XỬ LÝ CÁC PHƯƠNG THỨC KHÁC  ---
            await api.post('/api/orders', orderPayload);

            toast.success("Đặt hàng thành công! 🎉");
            clearCart();
            navigate('/thank-you');

        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xử lý đơn hàng, vui lòng thử lại.");
            setIsProcessing(false);
        }
    };

    const handlePlaceOrderClick = () => {
        if (cartItems.length === 0) return toast.error("Giỏ hàng đang trống!");

        if (paymentMethod === 'cod') {
            setIsProcessing(true);
            setTimeout(() => submitOrderToBackend('Tiền mặt (COD)'), 1000);
        }
        else if (paymentMethod === 'qr') {
            if (!formData.name || !formData.phone || !formData.address) return toast.error("Vui lòng điền thông tin giao hàng trước!");
            setShowQR(true);
        }
        else if (paymentMethod === 'vnpay') {
            setIsProcessing(true);
            submitOrderToBackend('vnpay');
        }
    };

    // Link QR Code
    const bankId = 'VCB';
    const accountNo = '1040868320';
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalAmount}&addInfo=TMT ${Date.now().toString().slice(-4)}`;

    return (
        <PayPalScriptProvider options={{ "clientId": "AU-h8a9Gg74tcWPBGoLNSg7e2L5NjQVwykNNgjJH35iheuv9eJwq9m60Er0_ovG30ZO54IoBgcZz5V7e", currency: "USD" }}>
            <div className="min-h-screen bg-[#FDF8F3] dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 p-4 lg:p-8 relative transition-colors">

                {/* QR CODE */}
                {showQR && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in relative">
                            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">Quét mã thanh toán</h3>
                                <p className="text-sm text-gray-500 mb-4">Mở App Ngân hàng để quét</p>
                                <div className="bg-gray-100 p-2 rounded-xl mb-4 inline-block">
                                    <img src={qrUrl} alt="VietQR" className="w-56 h-auto mix-blend-multiply" />
                                </div>
                                <div className="text-xl font-bold text-orange-600 mb-6">{formatCurrency(totalAmount)}</div>
                                <button
                                    onClick={() => submitOrderToBackend('Chuyển khoản QR')}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                                >
                                    Tôi đã chuyển tiền
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                    <div className="text-2xl font-bold text-[#D97706] flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                        <span>🏠</span> GIA DỤNG TMT
                    </div>
                    <div className="text-sm font-medium flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-600" /> Thanh toán bảo mật
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT TRÁI - FORM & CART */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Truck className="text-orange-600" /> Thông tin giao hàng</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Họ tên người nhận" className="w-full border dark:border-gray-600 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-orange-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <input type="text" placeholder="Số điện thoại" className="w-full border dark:border-gray-600 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-orange-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                <input type="text" placeholder="Địa chỉ chi tiết" className="w-full border dark:border-gray-600 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-orange-500 outline-none md:col-span-2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                <div className="md:col-span-2 mt-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><FileText size={16} /> Ghi chú (Tùy chọn)</label>
                                    <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Ví dụ: Giao giờ hành chính..." className="w-full border dark:border-gray-600 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-orange-500 outline-none h-24 resize-none"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Giỏ hàng ({cartItems.length})</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                        <img src={item.img} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100">{item.name}</h4>
                                            <p className="text-orange-600 font-bold text-sm">{formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={14} /></button>
                                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI - THANH TOÁN */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Thanh toán</h2>

                            <div className="space-y-3 mb-6">
                                {/* 1. COD */}
                                <div className={`p-4 border rounded-xl cursor-pointer transition flex items-center gap-3 ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setPaymentMethod('cod')}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-500' : 'border-gray-300'}`}>
                                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-sm"><Banknote size={16} /> Tiền mặt (COD)</div>
                                </div>

                                {/* 2. QR */}
                                <div className={`p-4 border rounded-xl cursor-pointer transition flex items-center gap-3 ${paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setPaymentMethod('qr')}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'qr' ? 'border-blue-500' : 'border-gray-300'}`}>
                                        {paymentMethod === 'qr' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-sm text-blue-700"><QrCode size={16} /> Chuyển khoản QR</div>
                                </div>

                                {/* 3. VNPAY  */}
                                <div className={`p-4 border rounded-xl cursor-pointer transition flex items-center gap-3 ${paymentMethod === 'vnpay' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setPaymentMethod('vnpay')}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'vnpay' ? 'border-red-500' : 'border-gray-300'}`}>
                                        {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                                        <Globe size={16} /> VNPAY / ATM
                                    </div>
                                </div>

                                {/* 4. PAYPAL */}
                                <div className={`p-4 border rounded-xl cursor-pointer transition flex items-center gap-3 ${paymentMethod === 'paypal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setPaymentMethod('paypal')}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-indigo-500' : 'border-gray-300'}`}>
                                        {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-sm text-indigo-700"><CreditCard size={16} /> PayPal / Visa</div>
                                </div>
                            </div>

                            {/* --- MÃ GIẢM GIÁ --- */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Tag size={16} className="text-orange-500" /> Mã giảm giá
                                </label>
                                {couponApplied ? (
                                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 rounded-xl">
                                        <div>
                                            <span className="font-bold text-green-700 dark:text-green-400">{couponApplied.code}</span>
                                            <span className="text-sm text-green-600 dark:text-green-400 ml-2">(-{formatCurrency(couponApplied.discount_amount)})</span>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-600 text-sm font-bold">Hủy</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Nhập mã giảm giá..."
                                            className="flex-1 border dark:border-gray-600 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-orange-500 outline-none text-sm"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition disabled:opacity-50"
                                        >
                                            {couponLoading ? '...' : 'Áp dụng'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{formatCurrency(getCartTotal())}</span></div>
                                <div className="flex justify-between text-gray-500"><span>Phí vận chuyển</span><span>{formatCurrency(shippingFee)}</span></div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold"><span>Giảm giá</span><span>-{formatCurrency(discountAmount)}</span></div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-orange-600 pt-2 border-t mt-2">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            {paymentMethod === 'paypal' ? (
                                <div className="w-full">
                                    <PayPalButtons
                                        style={{ layout: "vertical" }}
                                        createOrder={(_data, actions) => {
                                            if (!formData.name || !formData.phone || !formData.address) {
                                                toast.error("Vui lòng điền thông tin giao hàng!");
                                                return Promise.reject();
                                            }
                                            return actions.order.create({
                                                intent: "CAPTURE",
                                                purchase_units: [{
                                                    amount: { currency_code: "USD", value: totalAmountUSD }
                                                }]
                                            });
                                        }}
                                        onApprove={(_data, actions) => {
                                            return actions.order!.capture().then((details) => {
                                                submitOrderToBackend('PayPal: ' + details.payer?.name?.given_name);
                                            });
                                        }}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={handlePlaceOrderClick}
                                    disabled={isProcessing}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}
                                >
                                    {isProcessing ? 'Đang xử lý...' : <>Thanh Toán Ngay <ShieldCheck size={20} /></>}
                                </button>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </PayPalScriptProvider>
    );
};