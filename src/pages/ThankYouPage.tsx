import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-orange-100 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Cảm ơn bạn!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Đơn hàng của bạn đã được tiếp nhận và đang xử lý. Chúng tôi sẽ sớm liên hệ để giao hàng.
        </p>

        <div className="space-y-3">
          <Link to="/order-history" className="block w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
            <ShoppingBag size={20}/> Xem đơn hàng
          </Link>
          <Link to="/home" className="block w-full bg-white text-gray-600 border border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <Home size={20}/> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};