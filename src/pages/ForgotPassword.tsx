// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sau này sẽ gọi API backend gửi mail thật ở đây
    alert(`Hệ thống đã nhận yêu cầu reset pass cho: ${email}. (Tính năng demo)`);
    navigate('/'); // Quay về login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h2>
        <p className="text-gray-500 mb-6">Nhập email để chúng tôi gửi hướng dẫn lấy lại mật khẩu.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:ring-orange-500 outline-none" 
            placeholder="Nhập email của bạn" 
          />
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition">
            GỬI YÊU CẦU
          </button>
        </form>

        <div className="mt-6">
          <Link to="/" className="text-gray-500 hover:text-orange-600 text-sm">← Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};