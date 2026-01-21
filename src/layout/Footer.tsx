import React from 'react';
import { ShoppingBag, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2D2420] text-white pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                  <ShoppingBag size={18} strokeWidth={2.5} />
               </div>
               <span className="text-xl font-extrabold tracking-tight">Gia Dụng TMT</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Chuyên cung cấp đồ gia dụng thông minh, chính hãng với giá tốt nhất thị trường. Mang tiện nghi đến mọi nhà.
            </p>
            <div className="flex gap-4 pt-2">
               <a href="https://www.facebook.com/tuyen.tu.12979431/?locale=vi_VN" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition">
                 <Facebook size={18}/>
               </a>
               
               <a href="https://www.instagram.com/tuyen.tu.12979431/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] transition">
                 <Instagram size={18}/>
               </a>
               
               <a href="https://www.youtube.com/@thanh-q4w" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF0000] transition">
                 <Youtube size={18}/>
               </a>
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-[#ea8d35]">Khám Phá</h3>
             <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/home" className="hover:text-[#ea8d35] transition">Trang chủ</Link></li>
                <li><Link to="/products" className="hover:text-[#ea8d35] transition">Sản phẩm bán chạy</Link></li>
                <li><Link to="/products" className="hover:text-[#ea8d35] transition">Khuyến mãi hot</Link></li>
                <li><Link to="/order-history" className="hover:text-[#ea8d35] transition">Tra cứu đơn hàng</Link></li>
             </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#ea8d35]">Hỗ Trợ</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
               <li><Link to="/policy/trung-tam-tro-giup" className="hover:text-[#ea8d35] transition">Trung tâm trợ giúp</Link></li>
               <li><Link to="/policy/chinh-sach-bao-hanh" className="hover:text-[#ea8d35] transition">Chính sách bảo hành</Link></li>
               <li><Link to="/policy/chinh-sach-doi-tra" className="hover:text-[#ea8d35] transition">Chính sách đổi trả</Link></li>
               <li><Link to="/policy/chinh-sach-bao-mat" className="hover:text-[#ea8d35] transition">Chính sách bảo mật</Link></li>
            </ul>
         </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-[#ea8d35]">Liên Hệ</h3>
             <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                   <MapPin size={18} className="text-[#ea8d35] mt-1 shrink-0"/>
                   <span>670/32 Đoàn Văn Bơ phường 16 Quận 4 TPHCM</span>
                </li>
                <li className="flex items-center gap-3">
                   <Phone size={18} className="text-[#ea8d35] shrink-0"/>
                   <span>0932 013 424</span>
                </li>
                <li className="flex items-center gap-3">
                   <Mail size={18} className="text-[#ea8d35] shrink-0"/>
                   <span>tt3145539@gmail.com</span>
                </li>
             </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/10 pt-8 flex flex-col items-center justify-center gap-4 text-xs text-gray-500">
           <p>© 2026 Gia Dụng TMT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};