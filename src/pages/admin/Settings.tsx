import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, User, Lock, Store, Bell, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Settings = () => {
  const currentUserId = 1; 

  // State lưu thông tin admin
  const [adminInfo, setAdminInfo] = useState({
      name: 'Trương Minh Thành',
      email: 'tt3145539@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Admin+TMT&background=0D8ABC&color=fff'
  });

  // Load thông tin user
  useEffect(() => {
      fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
      try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
          const res = await axios.get(`${API_URL}/api/users/${currentUserId}`);
          if(res.data) {
             const user = res.data;
             setAdminInfo(prev => ({
                 ...prev,
                 avatar: user.avatar ? `${API_URL}${user.avatar}` : prev.avatar
             }));
          }
      } catch (err) {
          console.error(err);
      }
  };

  // Xử lý khi chọn ảnh
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
          
          // Gọi API upload
          const res = await axios.post(`${API_URL}/upload-avatar/${currentUserId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.status === "Success") {
              toast.success("Đổi avatar thành công!");
              setAdminInfo(prev => ({
                  ...prev,
                  avatar: `${API_URL}${res.data.url}`
              }));
          }
      } catch (err) {
          toast.error("Lỗi upload ảnh");
      }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã lưu cấu hình thành công!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Cài Đặt Hệ Thống</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Store size={20}/></div>
                    <h3 className="font-bold text-lg text-gray-800">Thông Tin Cửa Hàng</h3>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                            <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" defaultValue="Gia Dụng TMT" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                            <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" defaultValue="0932 013 424" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" defaultValue="670/32 Đoàn Văn Bơ, P.16, Q.4, TP.HCM" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                        <input type="email" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" defaultValue="tt3145539@gmail.com" />
                    </div>
                    <div className="pt-2 text-right">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2 ml-auto">
                            <Save size={18}/> Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Cấu hình thông báo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Bell size={20}/></div>
                    <h3 className="font-bold text-lg text-gray-800">Cấu Hình Thông Báo</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-700">Email khi có đơn hàng mới</p>
                            <p className="text-xs text-gray-500">Gửi email thông báo cho Admin khi khách đặt hàng.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÀI KHOẢN & UPLOAD AVATAR */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col items-center mb-6 relative group">
                      {/* Avatar */}
                      <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 overflow-hidden border-4 border-white shadow-md relative">
                          <img src={adminInfo.avatar} alt="Admin" className="w-full h-full object-cover"/>
                          
                          {/* Overlay khi hover */}
                          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition cursor-pointer">
                             <Camera className="text-white" size={24}/>
                          </div>
                          
                          {/* Input file ẩn */}
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleAvatarChange}
                          />
                      </div>
                      
                      <h3 className="font-bold text-lg">{adminInfo.name}</h3>
                      <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User size={18} className="text-gray-400"/>
                          <div>
                              <p className="text-xs text-gray-400">Email</p>
                              <p className="font-medium text-sm text-gray-800 break-all">{adminInfo.email}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Lock size={18} className="text-gray-400"/>
                          <div>
                              <p className="text-xs text-gray-400">Mật khẩu</p>
                              <p className="font-medium text-sm">••••••••</p>
                          </div>
                          <button className="ml-auto text-xs text-blue-600 font-bold hover:underline">Đổi</button>
                      </div>
                  </div>
              </div>

              {/* Version Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg text-white text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Phiên bản hệ thống</p>
                  <h3 className="text-2xl font-bold mb-4">v1.2.5</h3>
                  <div className="text-xs text-gray-500">
                      <p>Last update: 21/01/2026</p>
                      <p>Developed by TMT</p>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};