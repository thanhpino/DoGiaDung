import React, { useState } from 'react';
import { Input } from '../ui/input'; 
import { Button } from '../ui/Button';
import { useAuth } from '../context/AuthContext';

export const SignupForm: React.FC = () => {
  const { register } = useAuth(); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Gọi hàm đăng ký từ Context
    register(formData.name, formData.email, formData.password);
  };

  return (
    <div className="bg-[#fef3e2] p-8 rounded-xl shadow-sm border border-[#eaddcc] h-full">
      <h2 className="text-2xl font-bold text-[#4a3b32] mb-6">Chưa có tài khoản? Đăng ký ngay</h2>
      
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input 
          name="name"
          type="text" 
          placeholder="Họ và Tên" 
          aria-label="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input 
          name="email"
          type="email" 
          placeholder="Địa chỉ Email" 
          aria-label="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input 
          name="password"
          type="password" 
          placeholder="Tạo mật khẩu" 
          aria-label="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <div className="mt-2">
           <Button fullWidth type="submit" variant="primary">
             Đăng Ký
           </Button>
        </div>
      </form>
    </div>
  );
};