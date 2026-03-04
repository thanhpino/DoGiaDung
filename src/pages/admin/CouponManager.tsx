import { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { Ticket, Plus, Trash2, Edit, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
    id: number;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    min_order: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: number;
}

export const CouponManager = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState({ code: '', discount_type: 'percent', discount_value: '', min_order: '0', max_uses: '', expires_at: '' });

    const fetchCoupons = async () => {
        try { const res = await api.get('/api/coupons'); setCoupons(res.data); } catch { /* ignore */ }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const resetForm = () => {
        setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '0', max_uses: '', expires_at: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/api/coupons/${editing.id}`, {
                    discount_type: form.discount_type,
                    discount_value: Number(form.discount_value),
                    min_order: Number(form.min_order),
                    max_uses: form.max_uses ? Number(form.max_uses) : null,
                    expires_at: form.expires_at || null,
                    is_active: editing.is_active
                });
                toast.success('Cập nhật thành công!');
            } else {
                await api.post('/api/coupons', {
                    code: form.code,
                    discount_type: form.discount_type,
                    discount_value: Number(form.discount_value),
                    min_order: Number(form.min_order),
                    max_uses: form.max_uses ? Number(form.max_uses) : null,
                    expires_at: form.expires_at || null
                });
                toast.success('Tạo mã giảm giá thành công!');
            }
            resetForm();
            fetchCoupons();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Xóa mã giảm giá này?')) return;
        try {
            await api.delete(`/api/coupons/${id}`);
            toast.success('Đã xóa');
            fetchCoupons();
        } catch { toast.error('Lỗi xóa'); }
    };

    const editCoupon = (c: Coupon) => {
        setEditing(c);
        setForm({
            code: c.code,
            discount_type: c.discount_type,
            discount_value: String(c.discount_value),
            min_order: String(c.min_order),
            max_uses: c.max_uses ? String(c.max_uses) : '',
            expires_at: c.expires_at ? c.expires_at.split('T')[0] : ''
        });
        setShowForm(true);
    };

    const toggleActive = async (c: Coupon) => {
        try {
            await api.put(`/api/coupons/${c.id}`, { ...c, is_active: c.is_active ? 0 : 1 });
            fetchCoupons();
            toast.success(c.is_active ? 'Đã tắt' : 'Đã bật');
        } catch { /* ignore */ }
    };

    const formatPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-orange-500" /> Quản lý mã giảm giá
                </h2>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Đóng' : 'Tạo mã mới'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã code</label>
                            <input disabled={!!editing} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="VD: GIAM20" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label>
                            <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (đ)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá trị giảm</label>
                            <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đơn tối thiểu</label>
                            <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lượt dùng tối đa (trống = vô hạn)</label>
                            <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Không giới hạn" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hết hạn</label>
                            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer">
                        {editing ? 'Cập nhật' : 'Tạo mã'}
                    </button>
                </form>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mã</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giảm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Đơn tối thiểu</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Đã dùng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {coupons.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <td className="px-4 py-3 font-mono font-bold text-orange-600">{c.code}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-white">
                                    {c.discount_type === 'percent' ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatPrice(c.min_order)}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleActive(c)} className="cursor-pointer">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {c.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {c.is_active ? 'Hoạt động' : 'Tắt'}
                                        </span>
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => editCoupon(c)} className="p-1 hover:text-orange-500 transition cursor-pointer"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1 hover:text-red-500 transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && (
                    <div className="text-center py-10 text-gray-400">Chưa có mã giảm giá nào</div>
                )}
            </div>
        </div>
    );
};
