import { useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Download, Trophy } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

// @ts-ignore
import * as XLSX from 'xlsx';

const COLORS = ['#ea580c', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);

  // Mảng màu cho thanh tiến độ
  const categoryColors = [
    'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500',
    'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-cyan-500',
    'bg-lime-500', 'bg-rose-500', 'bg-slate-500'
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [resStats, resWeekly, resCats, resMonthly, resTop, resPayment] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/stats/weekly'),
        api.get('/api/stats/categories'),
        api.get('/api/stats/monthly').catch(() => ({ data: [] })),
        api.get('/api/stats/top-products').catch(() => ({ data: [] })),
        api.get('/api/stats/payment').catch(() => ({ data: [] })),
      ]);

      setStats(resStats.data);
      setTopCategories(resCats.data);
      setMonthlyData(resMonthly.data);
      setTopProducts(resTop.data);
      setPaymentData(resPayment.data);

      // Định dạng dữ liệu cho biểu đồ
      const formattedChart = resWeekly.data.map((item: any) => ({
        name: item.day,
        DoanhThu: item.value
      }));
      setChartData(formattedChart);

    } catch (err) { console.error("Lỗi tải dashboard:", err); }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const statsSheet = XLSX.utils.json_to_sheet([{
      'Tổng Doanh Thu': stats.revenue,
      'Tổng Đơn Hàng': stats.orders,
      'Khách Hàng': stats.users
    }]);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'Tổng Quan');

    // Sheet 2: Top sản phẩm
    if (topProducts.length > 0) {
      const topSheet = XLSX.utils.json_to_sheet(topProducts.map(p => ({
        'Tên SP': p.name,
        'Giá': p.price,
        'SL Bán': p.total_sold,
        'Doanh Thu': p.total_revenue
      })));
      XLSX.utils.book_append_sheet(wb, topSheet, 'Top SP');
    }

    // Sheet 3: Monthly
    if (monthlyData.length > 0) {
      const monthSheet = XLSX.utils.json_to_sheet(monthlyData.map(m => ({
        'Tháng': m.month,
        'Doanh Thu': m.revenue,
        'Số Đơn': m.orders
      })));
      XLSX.utils.book_append_sheet(wb, monthSheet, 'Theo Tháng');
    }

    XLSX.writeFile(wb, `BaoCao_TMT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
          <p className="text-gray-500 mt-1">Cập nhật số liệu kinh doanh thời gian thực</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-md"
          >
            <Download size={16} /> Xuất Excel
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
            <Calendar size={16} /> <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{formatCurrency(stats.revenue)}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14} /> +12.5%</div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.orders} đơn</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full"><ArrowUpRight size={14} /> +5.2%</div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><ShoppingCart size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Khách Hàng</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.users} người</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-red-500 mt-2 bg-red-50 w-fit px-2 py-1 rounded-full"><ArrowDownRight size={14} /> -2.1%</div>
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

      {/* 2. BIỂU ĐỒ TUẦN & DỰ BÁO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CỘT TRÁI: BIỂU ĐỒ RECHARTS  */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-orange-600" /> Biểu Đồ Doanh Thu (7 Ngày)
          </h3>

          <div style={{ width: '100%', height: 300, minWidth: 0 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
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

      {/* 3. BIỂU ĐỒ DOANH THU THEO THÁNG (12 tháng) */}
      {monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Doanh Thu Theo Tháng (12 tháng gần nhất)
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? [new Intl.NumberFormat('vi-VN').format(value) + ' đ', 'Doanh thu'] : ''}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Doanh Thu" />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Số Đơn" yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. TOP SẢN PHẨM BÁN CHẠY & THANH TOÁN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top sản phẩm bán chạy */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Top 10 Sản Phẩm Bán Chạy
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white ${idx < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'}`}>
                    {idx + 1}
                  </span>
                  <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-orange-600">{p.total_sold} bán</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doanh thu theo phương thức thanh toán */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <DollarSign className="text-green-500" /> Doanh Thu Theo Thanh Toán
          </h3>
          {paymentData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div style={{ width: 260, height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={3}
                      label={(props: any) => `${props.name || ''} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {paymentData.map((_: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2">
                {paymentData.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="font-medium text-gray-700">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">{formatCurrency(p.revenue)}</span>
                      <span className="text-gray-400 ml-2">({p.orders} đơn)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;