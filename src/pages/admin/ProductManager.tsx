import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, Plus, X, Edit, Save, RotateCcw } from 'lucide-react';

export const ProductManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Đang sửa sản phẩm nào (null = không sửa, đang thêm mới)
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Kitchen', img: '', description: ''
  });

  // 1. LẤY DỮ LIỆU
  const fetchProducts = async () => {
    try {
        const res = await axios.get('http://localhost:8081/products?limit=1000');
        if (res.data.data && Array.isArray(res.data.data)) {
            setProducts(res.data.data);
        } else {
            setProducts(Array.isArray(res.data) ? res.data : []);
        }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // 2. XỬ LÝ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingId) {
              // --- LOGIC SỬA ---
              await axios.put(`http://localhost:8081/api/products/${editingId}`, formData);
              toast.success("Cập nhật thành công!");
          } else {
              // --- LOGIC THÊM ---
              await axios.post('http://localhost:8081/api/products', formData);
              toast.success("Thêm mới thành công!");
          }
          
          resetForm();
          fetchProducts();
      } catch (err) { toast.error("Có lỗi xảy ra"); }
  };

  // 3. CHUẨN BỊ FORM ĐỂ SỬA
  const handleEditClick = (product: any) => {
      setEditingId(product.id);
      setFormData({
          name: product.name,
          price: product.price,
          category: product.category,
          img: product.image_url || product.img, // Lấy ảnh từ DB
          description: product.description || ''
      });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu để sửa
  };

  // 4. XÓA SẢN PHẨM
  const handleDelete = async (id: number) => {
      if(!window.confirm("Xóa sản phẩm này?")) return;
      try {
          await axios.delete(`http://localhost:8081/api/products/${id}`);
          toast.success("Đã xóa!");
          fetchProducts();
      } catch (err) { toast.error("Lỗi xóa"); }
  };

  // 5. RESET FORM
  const resetForm = () => {
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', price: '', category: 'Kitchen', img: '', description: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm ({products.length})</h2>
          <button 
            onClick={() => {
                resetForm(); // Reset để đảm bảo là thêm mới
                setShowForm(!showForm);
            }} 
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 font-bold shadow-sm"
          >
              {showForm && !editingId ? <X size={20}/> : <Plus size={20}/>} 
              {showForm && !editingId ? 'Đóng' : 'Thêm Mới'}
          </button>
      </div>

      {/* --- FORM NHẬP LIỆU  --- */}
      {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-200 mb-8 animate-fade-in relative overflow-hidden">
              <div className={`absolute top-0 left-0 px-4 py-1 rounded-br-xl font-bold text-sm ${editingId ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {editingId ? `Đang chỉnh sửa ID #${editingId}` : 'Thêm sản phẩm mới'}
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Tên sản phẩm</label>
                      <input className="w-full border p-2 rounded focus:border-orange-500 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Giá bán (VNĐ)</label>
                      <input className="w-full border p-2 rounded focus:border-orange-500 outline-none" type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Link Ảnh (URL)</label>
                      <input className="w-full border p-2 rounded focus:border-orange-500 outline-none" placeholder="/images/..." required value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Danh mục</label>
                      <select className="w-full border p-2 rounded focus:border-orange-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          <option value="Kitchen">Nhà Bếp</option>
                          <option value="Cleaning">Dọn Dẹp</option>
                          <option value="Health">Sức Khỏe</option>
                          <option value="Cooling">Làm Mát</option>
                          <option value="SmartHome">Smart Home</option>
                          <option value="Beauty">Làm Đẹp</option>
                          <option value="Lighting">Chiếu Sáng</option>
                      </select>
                  </div>
                  <div className="md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Mô tả chi tiết</label>
                      <textarea className="w-full border p-2 rounded focus:border-orange-500 outline-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                  
                  <div className="md:col-span-2 flex gap-3 mt-2">
                      <button type="submit" className={`flex-1 text-white py-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                          <Save size={20}/> {editingId ? 'Cập Nhật' : 'Lưu Sản Phẩm'}
                      </button>
                      {editingId && (
                          <button type="button" onClick={resetForm} className="px-6 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-gray-600 flex items-center gap-2">
                              <RotateCcw size={18}/> Hủy
                          </button>
                      )}
                  </div>
              </form>
          </div>
      )}

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Ảnh</th>
              <th className="p-4">Tên sản phẩm</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {products.length > 0 ? (
                products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-gray-400">#{p.id}</td>
                    <td className="p-4"><img src={p.image_url || p.img} className="w-12 h-12 object-cover rounded border bg-white" alt=""/></td>
                    <td className="p-4 font-bold text-gray-800">{p.name}</td>
                    <td className="p-4 text-orange-600 font-bold">{new Intl.NumberFormat('vi-VN').format(p.price)} ₫</td>
                    <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100">{p.category}</span></td>
                    <td className="p-4">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditClick(p)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition shadow-sm" title="Sửa">
                                <Edit size={18}/>
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition shadow-sm" title="Xóa">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};