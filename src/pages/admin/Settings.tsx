import axios from 'axios';
import { Download, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Settings = () => {
  
  // Hàm xuất dữ liệu ra file Excel (CSV)
  const handleExportCSV = async () => {
    try {
        const res = await axios.get('http://localhost:8081/api/orders');
        const orders = res.data;

        // Tạo nội dung CSV (Tiêu đề + Dữ liệu)
        const headers = ["Mã Đơn,Khách Hàng,Tổng Tiền,Ngày Đặt,Trạng Thái\n"];
        const rows = orders.map((o: any) => {
            return `${o.id},"${o.customer_name}",${o.total_amount},${new Date(o.created_at).toLocaleDateString()},${o.status}`;
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        
        // Tạo link ẩn để tải file
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bao_cao_doanh_thu.csv");
        document.body.appendChild(link);
        link.click();
        
        toast.success("Đã xuất file báo cáo thành công!");
    } catch (err) {
        toast.error("Lỗi khi xuất dữ liệu");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài Đặt Hệ Thống</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. XUẤT BÁO CÁO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-700">Dữ Liệu & Báo Cáo</h3>
              <p className="text-sm text-gray-500 mb-6">Xuất toàn bộ dữ liệu đơn hàng ra file Excel (CSV) để quản lý doanh thu.</p>
              
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition w-full justify-center"
              >
                  <Download size={20}/> Xuất Báo Cáo Doanh Thu (.CSV)
              </button>
          </div>

          {/* 2. CẤU HÌNH CỬA HÀNG  */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-700">Thông Tin Cửa Hàng</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Đã lưu cấu hình!"); }}>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                      <input type="text" className="w-full border p-2 rounded-lg" defaultValue="Gia Dụng TMT" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                      <input type="text" className="w-full border p-2 rounded-lg" defaultValue="0932 013 424" />
                  </div>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
                      <Save size={18}/> Lưu Thay Đổi
                  </button>
              </form>
          </div>

      </div>
    </div>
  );
};