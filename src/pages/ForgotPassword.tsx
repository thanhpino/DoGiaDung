// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      
      if (res.data.status === "Success") {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h2>
        <p className="text-gray-500 mb-6">Vui lòng nhập email của bạn để TMT gửi hướng dẫn lấy lại mật khẩu.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:ring-orange-500 outline-none" 
            placeholder="Nhập email của bạn" 
          />
          <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50">
              {loading ? "Đang gửi..." : "GỬI YÊU CẦU"}
          </button>
        </form>

        <div className="mt-6">
          <Link to="/" className="text-gray-500 hover:text-orange-600 text-sm">← Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};