import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../ui/input';   
import { Button } from '../ui/Button'; 

// Icon Google 
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
            placeholder="example@email.com" 
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

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span></div>
        </div>

        <div className="space-y-3">
          <Button type="button" variant="facebook" fullWidth onClick={() => alert('Tính năng đang phát triển')}>
             <Facebook size={20} fill="currentColor" className="mr-2" /> Facebook
          </Button>
          <Button type="button" variant="google" fullWidth onClick={() => alert('Tính năng đang phát triển')}>
             <span className="mr-2"><GoogleIcon /></span> Google
          </Button>
        </div>

        <p className="text-center mt-8 text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-orange-600 font-bold hover:underline">Đăng ký ngay</Link>
        </p>

      </div>
    </div>
  );
};