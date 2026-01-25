import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import axios from 'axios'; 
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast'; 
import { ProductSimulation } from '../components/ProductSimulation';

export const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
          .then(res => {
              const data = res.data;
              // Map dữ liệu để dùng chung logic camelCase
              if (data.image_url) data.img = data.image_url;
              if (data.old_price) data.oldPrice = data.old_price; 
              if (data.review_count) data.reviewCount = data.review_count;
              
              setProduct(data);
              setLoading(false);
          })
          .catch(err => {
              console.error("Lỗi lấy chi tiết:", err);
              setLoading(false);
          });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, img: product.image_url || product.img });
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-orange-500`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <img className="h-14 w-14 rounded-xl object-cover border border-gray-100" src={product.img || product.image_url} alt="" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-bold text-gray-900">Đã thêm vào giỏ!</p>
                <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.name}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/checkout');
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-orange-600 hover:text-white hover:bg-orange-500 focus:outline-none transition-colors"
            >
              Thanh toán
            </button>
          </div>
        </div>
      ), { duration: 3000 });
    }
  };

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF7]">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFFBF7]">
        <h2 className="text-2xl font-bold text-gray-800">Sản phẩm không tồn tại!</h2>
        <button onClick={() => navigate('/home')} className="text-orange-600 underline hover:text-orange-700">Quay về trang chủ</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF7] font-sans text-gray-800 pb-20">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold transition group">
          <div className="bg-gray-100 p-2 rounded-full group-hover:bg-orange-100 transition"><ArrowLeft size={20} /></div>
          Quay lại
        </button>
        <div className="font-bold text-lg text-gray-800 hidden md:block truncate max-w-md">{product.name}</div>
        <div className="w-10"></div> {/* Spacer */}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- CỘT TRÁI: ẢNH & SIMULATION  --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Ảnh sản phẩm chính */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex items-center justify-center relative overflow-hidden group">
                <img 
                    src={product.img || product.image_url} 
                    alt={product.name} 
                    className="w-full h-[400px] object-contain mix-blend-multiply group-hover:scale-105 transition duration-500 ease-in-out" 
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="p-3 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition hover:shadow-lg"><Heart size={20}/></button>
                </div>
                
                {/* LOGIC : Chỉ hiện Badge góc trái khi có giảm giá */}
                {product.oldPrice && product.oldPrice > product.price && (
                    <span className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-red-200 shadow-lg z-10">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                )}
            </div>

            {/* --- KHU VỰC TRẢI NGHIỆM ẢO  --- */}
            <div className="h-[320px] w-full rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 bg-white">
               <ProductSimulation product={product} />
            </div>

          </div>

          {/* --- CỘT PHẢI: THÔNG TIN & MUA HÀNG --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8 p-6 bg-white rounded-[2rem] shadow-xl shadow-orange-100/50 border border-orange-50">
                
                {/* Header Info */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                            {product.category || 'Chính Hãng'}
                        </span>
                        <div className="flex items-center text-yellow-400 text-xs gap-0.5">
                            <Star size={14} fill="currentColor"/>
                            <span className="text-gray-500 font-medium ml-1">4.8 (128 đánh giá)</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">{product.name}</h1>
                    
                    {/* Hiển thị giá giảm và chưa giảm*/}
                    <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                        <span className="text-4xl font-extrabold text-orange-600">{formatCurrency(product.price)}</span>
                        {product.oldPrice && product.oldPrice > product.price && (
                            <>
                                <span className="text-lg text-gray-400 line-through mb-1.5">{formatCurrency(product.oldPrice)}</span>
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold mb-2 ml-2">
                                    Giảm {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Mô tả ngắn */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        Mô tả nổi bật
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {product.description || "Sản phẩm công nghệ cao cấp, thiết kế hiện đại, phù hợp với mọi gia đình Việt."}
                    </p>
                </div>

                {/* Chính sách */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                        <ShieldCheck className="text-green-600" size={20}/>
                        <span className="text-xs font-bold text-green-800">Bảo hành 12 tháng</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <Truck className="text-blue-600" size={20}/>
                        <span className="text-xs font-bold text-blue-800">Freeship toàn quốc</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={22} /> Thêm Vào Giỏ Ngay
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">Cam kết chính hãng 100% • Hoàn tiền nếu phát hiện hàng giả</p>
                </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};