import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingCart, Users, TrendingUp, Activity, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AdminDashboard = () => {
  // --- 1. STATE LƯU DỮ LIỆU THẬT ---
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0 });
  const [weeklyChart, setWeeklyChart] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

  // Màu sắc cho danh mục (để xoay vòng cho đẹp)
  const categoryColors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500'];

  // --- 2. GỌI API ---
  useEffect(() => {
    fetchData();
    // Tự động cập nhật mỗi 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
        // Gọi song song 3 API cho nhanh
        const [resStats, resChart, resCats] = await Promise.all([
            axios.get('http://localhost:8081/api/stats'),
            axios.get('http://localhost:8081/api/stats/weekly'),
            axios.get('http://localhost:8081/api/stats/categories')
        ]);

        setStats(resStats.data);
        processChartData(resChart.data);
        setTopCategories(resCats.data);

    } catch (err) { console.error("Lỗi tải dashboard:", err); }
  };

  // Hàm xử lý dữ liệu biểu đồ (Tính chiều cao %)
  const processChartData = (data: any[]) => {
      if (data.length === 0) {
          setWeeklyChart([]);
          return;
      }
      // Tìm giá trị lớn nhất để làm mốc 100%
      const maxValue = Math.max(...data.map(item => item.value));
      
      const processed = data.map(item => ({
          label: item.day,
          val: formatCurrency(item.value), // Format tiền hiển thị
          height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' // Tính % chiều cao
      }));
      setWeeklyChart(processed);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
           <p className="text-gray-500 mt-1">Cập nhật số liệu kinh doanh thời gian thực</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
            <Calendar size={16}/> <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between group hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{formatCurrency(stats.revenue)}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14}/> +12.5%</div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between group hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.orders} đơn</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14}/> +5.2%</div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition"><ShoppingCart size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between group hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Khách Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.users} người</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-red-500 mt-2 bg-red-50 w-fit px-2 py-1 rounded-full"><ArrowDownRight size={14}/> -2.1%</div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition"><Users size={24} /></div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">Mục Tiêu Tháng</p>
            <h3 className="text-2xl font-extrabold">85%</h3>
            <div className="text-xs text-purple-100 mt-2">Sắp đạt mốc doanh thu</div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm"><TrendingUp size={24} /></div>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ & DỰ BÁO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: BIỂU ĐỒ CỘT */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Activity className="text-orange-600"/> Biểu Đồ Doanh Thu (7 Ngày)
                  </h3>
              </div>
              
              <div className="flex items-end justify-between h-64 gap-3 px-2 border-b border-gray-100 pb-2">
                  {weeklyChart.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">Chưa có dữ liệu tuần này</div>
                  ) : (
                      weeklyChart.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer h-full justify-end">
                            <div className="relative w-full flex justify-end flex-col items-center h-full">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition duration-300 mb-2 whitespace-nowrap z-10">
                                        {item.val}
                                    </div>
                                    {/* Bar */}
                                    <div 
                                        className="w-full max-w-[40px] bg-orange-100 rounded-t-lg group-hover:bg-orange-500 transition-all duration-700 relative overflow-hidden" 
                                        style={{ height: item.height }}
                                    >
                                        <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-200/50"></div>
                                    </div>
                            </div>
                            <span className="text-xs font-bold text-gray-500">{item.label}</span>
                        </div>
                      ))
                  )}
              </div>
          </div>

          {/* CỘT PHẢI: TOP DANH MỤC & DỰ BÁO */}
          <div className="flex flex-col gap-6">
              
              {/* Dự Báo */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">Dự Báo Doanh Thu 🚀</h3>
                  <p className="text-orange-100 text-sm mb-6 relative z-10">
                    Dựa trên tốc độ bán hàng hiện tại, dự kiến cuối tháng sẽ đạt:
                  </p>
                  <div className="flex items-end gap-2 relative z-10">
                      <span className="text-3xl font-extrabold">{formatCurrency(stats.revenue * 1.2)}</span>
                  </div>
              </div>

              {/* Top Danh Mục  */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-6">Top Danh Mục</h3>
                  <div className="space-y-5">
                      {topCategories.length === 0 ? <p className="text-gray-400 text-center">Chưa có dữ liệu</p> : 
                       topCategories.map((cat, idx) => (
                          <div key={idx}>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{cat.name}</span>
                                  <span className="font-bold text-gray-900">{cat.pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-2 rounded-full ${categoryColors[idx % categoryColors.length]}`} 
                                    style={{ width: `${cat.pct}%` }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};