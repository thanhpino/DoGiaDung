import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  
  // Mảng màu cho thanh tiến độ
  const categoryColors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500'];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        
        // Gọi 3 API song song
        const [resStats, resWeekly, resCats] = await Promise.all([
            axios.get(`${API_URL}/api/stats`),
            axios.get(`${API_URL}/api/stats/weekly`),
            axios.get(`${API_URL}/api/stats/categories`)
        ]);

        setStats(resStats.data);
        setTopCategories(resCats.data);

        // Định dạng dữ liệu cho biểu đồ
        const formattedChart = resWeekly.data.map((item: any) => ({
            name: item.day,
            DoanhThu: item.value
        }));
        setChartData(formattedChart);

    } catch (err) { console.error("Lỗi tải dashboard:", err); }
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{formatCurrency(stats.revenue)}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14}/> +12.5%</div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.orders} đơn</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14}/> +5.2%</div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><ShoppingCart size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Khách Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.users} người</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-red-500 mt-2 bg-red-50 w-fit px-2 py-1 rounded-full"><ArrowDownRight size={14}/> -2.1%</div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Users size={24} /></div>
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
          
          {/* CỘT TRÁI: BIỂU ĐỒ RECHARTS  */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                <TrendingUp className="text-orange-600"/> Biểu Đồ Doanh Thu (7 Ngày)
              </h3>
              
              <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis 
                        tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)} 
                        axisLine={false} tickLine={false}
                    />
                    <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('vi-VN').format(value) + ' đ' : ''}
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="DoanhThu" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Doanh Thu" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* CỘT PHẢI: TOP DANH MỤC */}
          <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 h-full">
                  <h3 className="font-bold text-gray-800 text-lg mb-6">Top Danh Mục</h3>
                  <div className="space-y-6">
                      {topCategories.length === 0 ? <p className="text-gray-400 text-center">Chưa có dữ liệu</p> : 
                       topCategories.map((cat, idx) => (
                          <div key={idx}>
                              <div className="flex justify-between text-sm mb-2">
                                  <span className="font-medium text-gray-700">{cat.name}</span>
                                  <span className="font-bold text-gray-900">{cat.pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${categoryColors[idx % categoryColors.length]}`} 
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
export default AdminDashboard;