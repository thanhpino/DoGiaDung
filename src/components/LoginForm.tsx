import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../ui/input';   
import { Button } from '../ui/Button'; 

export const LoginForm = () => {
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3] p-4">
      <div className="bg-white p-8 w-full max-w-md rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-500">Đăng nhập tài khoản</p>
        </div>
        
        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          {/* Dùng Input component */}
          <Input 
            label="Email"
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="123456@email.com" 
          />
          
          <Input 
            label="Mật khẩu"
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
          />
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Quên mật khẩu?</Link>
          </div>
          
          {/* Dùng Button component */}
          <Button type="submit" fullWidth variant="primary">
            ĐĂNG NHẬP
          </Button>
        </form>
        <p className="text-center mt-8 text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-orange-600 font-bold hover:underline">Đăng ký ngay</Link>
        </p>

      </div>
    </div>
  );
};