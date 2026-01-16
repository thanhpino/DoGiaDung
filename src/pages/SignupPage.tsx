import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignupPage = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirmPass) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }
    // Gọi hàm register từ AuthContext
    register(name, email, pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">Tạo tài khoản</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-orange-500 outline-none" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-orange-500 outline-none" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input type="password" required value={pass} onChange={e => setPass(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-orange-500 outline-none" placeholder="******" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
            <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-orange-500 outline-none" placeholder="******" />
          </div>

          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition">
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Đã có tài khoản? <Link to="/" className="text-orange-600 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};