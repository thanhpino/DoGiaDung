import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, Printer, ChevronUp, Star, MessageSquare, Package, User, MapPin, FileText } from 'lucide-react';
export const OrderManager = () => {
  const [orders, setOrders] = useState<any[]>([]);
  // State quản lý việc mở rộng hàng và lưu chi tiết sản phẩm
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // 1. LẤY DỮ LIỆU ĐƠN HÀNG
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 2. CẬP NHẬT TRẠNG THÁI
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
        await axios.put(`http://localhost:8081/api/orders/${id}`, { status: newStatus });
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        toast.success(`Đã cập nhật đơn #${id}: ${newStatus}`);
    } catch (error) { toast.error("Lỗi cập nhật trạng thái"); }
  };

  // 3. XEM CHI TIẾT & REVIEW
  const toggleExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
        setOrderItems([]);
    } else {
        setExpandedOrderId(orderId);
        try {
            // Gọi API lấy sản phẩm kèm thông tin review (API này đã update ở turn trước)
            const res = await axios.get(`http://localhost:8081/api/orders/${orderId}/items`);
            setOrderItems(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được chi tiết đơn");
        }
    }
  };

  const statusColors: any = {
    'Chờ xác nhận': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Đang giao': 'bg-blue-100 text-blue-800 border-blue-200',
    'Hoàn thành': 'bg-green-100 text-green-800 border-green-200',
    'Đã hủy': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản Lý Đơn Hàng</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
            <tr>
              <th className="p-4">Mã Đơn</th>
              <th className="p-4">Khách Hàng</th>
              <th className="p-4">Tổng Tiền</th>
              <th className="p-4">Ngày Đặt</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4">Hành Động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>
            ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                      {/* DÒNG CHÍNH */}
                      <tr className={`border-b transition ${expandedOrderId === order.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                        <td className="p-4 font-bold text-orange-600">#{order.id}</td>
                        <td className="p-4">
                            <div className="font-bold flex items-center gap-1"><User size={14}/> {order.customer_name}</div>
                            <div className="text-xs text-gray-500 ml-5">{order.customer_phone}</div>
                        </td>
                        <td className="p-4 font-bold">{new Intl.NumberFormat('vi-VN').format(order.total_amount)} ₫</td>
                        <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                            <select 
                                className={`p-1.5 rounded-lg border text-xs font-bold outline-none cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                                <option>Chờ xác nhận</option>
                                <option>Đang giao</option>
                                <option>Hoàn thành</option>
                                <option>Đã hủy</option>
                            </select>
                        </td>
                        <td className="p-4 flex gap-2 items-center">
                            <button 
                                onClick={() => window.open(`/invoice/${order.id}`, '_blank')} 
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm" 
                                title="In Hóa Đơn"
                            >
                                <Printer size={18}/>
                            </button>
                            <button 
                                onClick={() => toggleExpand(order.id)} 
                                className={`p-2 rounded-lg transition shadow-sm ${expandedOrderId === order.id ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                title="Xem Chi Tiết"
                            >
                                {expandedOrderId === order.id ? <ChevronUp size={18}/> : <Eye size={18}/>}
                            </button>
                        </td>
                      </tr>

                      {/* PHẦN MỞ RỘNG: CHI TIẾT SẢN PHẨM & REVIEW */}
                      {expandedOrderId === order.id && (
                          <tr className="bg-gray-50 animate-fade-in">
                              <td colSpan={6} className="p-4 md:p-6">
                                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                      {/* Header Chi tiết */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-4">
                                          <div>
                                              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                  <MapPin size={18} className="text-orange-600"/> Thông tin giao hàng
                                              </h4>
                                              <p className="text-gray-600 ml-6">{order.customer_address}</p>
                                          </div>
                                          <div className="md:text-right">
                                              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 md:justify-end">
                                                  <FileText size={18} className="text-orange-600"/> Ghi chú
                                              </h4>
                                              <p className="text-gray-600 italic ml-6 md:ml-0">{order.note || 'Không có ghi chú'}</p>
                                          </div>
                                      </div>

                                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                          <Package size={18} className="text-orange-600"/> Danh sách sản phẩm
                                      </h4>

                                      <div className="space-y-4">
                                          {orderItems.length === 0 ? <div className="text-center py-4">Đang tải...</div> : 
                                           orderItems.map((item: any, idx) => (
                                              <div key={idx} className="flex flex-col md:flex-row gap-4 border border-gray-100 rounded-lg p-3 hover:shadow-sm transition bg-gray-50/50">
                                                  {/* Sản phẩm */}
                                                  <div className="flex items-center gap-4 flex-1">
                                                      <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg border object-cover bg-white"/>
                                                      <div>
                                                          <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                                                          <p className="text-sm text-gray-500">
                                                              <span className="font-bold text-gray-800">{item.quantity}</span> x <span className="text-orange-600 font-bold">{new Intl.NumberFormat('vi-VN').format(item.price)} ₫</span>
                                                          </p>
                                                      </div>
                                                  </div>

                                                  {/* Đánh giá (Review) */}
                                                  <div className="flex-1 md:border-l md:border-gray-200 md:pl-4">
                                                      {item.rating ? (
                                                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                              <div className="flex justify-between items-center mb-2">
                                                                  <span className="text-xs font-bold text-yellow-700 flex items-center gap-1"><MessageSquare size={12}/> Đánh giá từ khách:</span>
                                                                  <div className="flex text-yellow-500">
                                                                      {[...Array(5)].map((_, i) => (
                                                                          <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} />
                                                                      ))}
                                                                  </div>
                                                              </div>
                                                              <p className="text-sm text-gray-800 italic">"{item.comment}"</p>
                                                              {item.review_image && (
                                                                  <div className="mt-2">
                                                                      <p className="text-[10px] text-gray-400 mb-1">Ảnh khách chụp:</p>
                                                                      <img src={`http://localhost:8081${item.review_image}`} className="h-16 w-16 object-cover rounded border cursor-pointer hover:scale-110 transition" alt="Review"/>
                                                                  </div>
                                                              )}
                                                              <p className="text-[10px] text-gray-400 mt-2 text-right">{new Date(item.review_date).toLocaleString()}</p>
                                                          </div>
                                                      ) : (
                                                          <div className="h-full flex items-center text-gray-400 text-sm italic pl-2">
                                                              Chưa có đánh giá cho sản phẩm này
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </React.Fragment>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};