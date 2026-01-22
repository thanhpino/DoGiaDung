import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Token không hợp lệ");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const res = await axios.post(`${API_URL}/reset-password`, { 
        token, 
        newPassword: password 
      });

      if (res.data.status === "Success") {
        toast.success(res.data.message);
        navigate('/login');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi đổi mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đặt mật khẩu mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-orange-500 outline-none"
            placeholder="Nhập mật khẩu mới..." 
            minLength={6}
          />
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700">
            XÁC NHẬN ĐỔI
          </button>
        </form>
      </div>
    </div>
  );
};