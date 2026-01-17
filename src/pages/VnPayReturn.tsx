import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';

export const VnPayReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');

        if (responseCode === '00') {
            // 00 là Thành công
            const pendingOrder = localStorage.getItem('pendingOrder');
            if (pendingOrder) {
                const orderData = JSON.parse(pendingOrder);
                // Gửi đơn hàng xuống DB
                axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    ...orderData,
                    payment_method: 'VNPAY Online'
                }).then(() => {
                    localStorage.removeItem('pendingOrder');
                    clearCart();
                    toast.success("Thanh toán VNPAY thành công!");
                    navigate('/thank-you');
                });
            }
        } else {
            // Thất bại hoặc Hủy
            toast.error("Thanh toán thất bại hoặc bị hủy");
            navigate('/checkout');
        }
    }, []);

    return <div className="min-h-screen flex items-center justify-center"><h1>Đang xử lý kết quả thanh toán...</h1></div>;
};