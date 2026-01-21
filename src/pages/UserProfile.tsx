import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [info, setInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [pass, setPass] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);

    // Load dữ liệu
    useEffect(() => {
        if (user) {
            axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`)
                .then(res => {
                    // Cập nhật state với dữ liệu từ DB, nếu null thì để chuỗi rỗng
                    setInfo({
                        name: res.data.name || '',
                        email: res.data.email || '',
                        phone: res.data.phone || '',
                        address: res.data.address || ''
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                    toast.error("Không tải được thông tin cá nhân");
                });
        }
    }, [user]);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
                name: info.name,
                phone: info.phone,
                address: info.address
            });
            toast.success("Cập nhật thông tin thành công!");
            
            // Cập nhật localStorage để Header đổi tên ngay lập tức
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            savedUser.name = info.name;
            localStorage.setItem('user', JSON.stringify(savedUser));
            
            // Reload nhẹ trang để AuthContext cập nhật lại
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            toast.error("Lỗi cập nhật thông tin");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        if (pass.newPassword !== pass.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (pass.newPassword.length < 6) {
            toast.error("Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)");
            return;
        }

        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/password`, {
                oldPassword: pass.oldPassword,
                newPassword: pass.newPassword
            });

            if (res.data.status === 'Success') {
                toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
                setPass({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi hệ thống khi đổi mật khẩu");
        }
    };

    if (!user) return <div className="p-10 text-center">Vui lòng đăng nhập để xem hồ sơ.</div>;
    if (loading) return <div className="p-10 text-center">Đang tải hồ sơ...</div>;

    return (
        <div className="min-h-screen bg-[#FFFBF7] p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 font-medium transition">
                    <ArrowLeft size={20}/> Quay lại trang chủ
                </button>

                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Hồ Sơ Của Tôi</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Form Thông tin */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><User size={24}/></div>
                            <h2 className="text-xl font-bold text-gray-800">Thông Tin Chung</h2>
                        </div>

                        <form onSubmit={handleUpdateInfo} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input disabled value={info.email} className="w-full bg-gray-100 border p-3 rounded-xl text-gray-500 cursor-not-allowed"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input required value={info.name} onChange={e => setInfo({...info, name: e.target.value})} className="w-full border p-3 rounded-xl focus:border-orange-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input required type="tel" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} className="w-full border p-3 rounded-xl focus:border-orange-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <textarea required value={info.address} onChange={e => setInfo({...info, address: e.target.value})} className="w-full border p-3 rounded-xl focus:border-orange-500 outline-none resize-none h-24"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
                                <Save size={20}/> Lưu Thay Đổi
                            </button>
                        </form>
                    </div>

                    {/* Form Đổi mật khẩu */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Lock size={24}/></div>
                            <h2 className="text-xl font-bold text-gray-800">Bảo Mật</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                <input type="password" required value={pass.oldPassword} onChange={e => setPass({...pass, oldPassword: e.target.value})} className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                <input type="password" required value={pass.newPassword} onChange={e => setPass({...pass, newPassword: e.target.value})} className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                                <input type="password" required value={pass.confirmPassword} onChange={e => setPass({...pass, confirmPassword: e.target.value})} className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none"/>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <Lock size={18}/> Đổi Mật Khẩu
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};