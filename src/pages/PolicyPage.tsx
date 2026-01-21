import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, FileText, HelpCircle, ArrowLeft } from 'lucide-react';

export const PolicyPage = () => {
  const { slug } = useParams(); // Lấy tham số từ URL

  // Cấu hình nội dung giả
  const contentMap: any = {
    'trung-tam-tro-giup': { 
      title: 'Trung Tâm Trợ Giúp', 
      icon: <HelpCircle size={48} className="text-orange-500"/>,
      desc: 'Chúng tôi có thể giúp gì cho bạn?' 
    },
    'chinh-sach-bao-hanh': { 
      title: 'Chính Sách Bảo Hành', 
      icon: <ShieldCheck size={48} className="text-blue-500"/>,
      desc: 'Bảo hành 12 tháng cho tất cả sản phẩm điện tử.' 
    },
    'chinh-sach-doi-tra': { 
      title: 'Chính Sách Đổi Trả', 
      icon: <RefreshCw size={48} className="text-green-500"/>,
      desc: 'Đổi trả miễn phí trong vòng 7 ngày nếu lỗi NSX.' 
    },
    'chinh-sach-bao-mat': { 
      title: 'Chính Sách Bảo Mật', 
      icon: <FileText size={48} className="text-purple-500"/>,
      desc: 'Cam kết bảo mật thông tin khách hàng tuyệt đối.' 
    },
  };

  const currentData = contentMap[slug || ''] || { 
    title: 'Đang cập nhật', 
    icon: <FileText size={48} className="text-gray-400"/>,
    desc: 'Nội dung đang được biên soạn.' 
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu khi vào trang
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <Link to="/" className="flex items-center text-gray-500 hover:text-orange-600 mb-6 transition">
            <ArrowLeft size={18} className="mr-2"/> Quay lại trang chủ
        </Link>

        <div className="text-center mb-10">
            <div className="flex justify-center mb-4">{currentData.icon}</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{currentData.title}</h1>
            <p className="text-gray-500">{currentData.desc}</p>
        </div>

        {/* Nội dung giả (Lorem Ipsum) cho dài trang ra nhìn cho uy tín */}
        <div className="space-y-4 text-gray-600 leading-relaxed text-justify">
            <p>1. <strong>Quy định chung:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>2. <strong>Phạm vi áp dụng:</strong> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>3. <strong>Điều kiện:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
            <p className="italic bg-orange-50 p-4 rounded-lg border border-orange-100">
                Lưu ý: Đây là nội dung demo phục vụ cho đồ án môn học. Các chính sách trên chưa có hiệu lực thực tế.
            </p>
        </div>
      </div>
    </div>
  );
};