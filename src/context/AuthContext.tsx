import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { toast } from 'react-hot-toast';

interface User {
  address: string;
  phone: string;
  id: number;
  name: string;
  email: string;
  role: string; // Thêm role vào interface
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Khôi phục user từ localStorage nếu có khi khởi tạo state
  const [user, setUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
  });
  
  const navigate = useNavigate();

  // 1. Đăng ký
  const register = async (name: string, email: string, pass: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/signup`, { name, email, password: pass });
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/');
    } catch (err: any) {
      // Chỉ lấy message hoặc ép kiểu về chuỗi
      const msg = err.response?.data?.message || err.response?.data || "Đăng ký thất bại";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  // 2. Đăng nhập
  const login = async (email: string, pass: string) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password: pass });
      
      if(res.data.status === "Success") {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Lưu vào Storage
        
        toast.success(`Chào mừng ${userData.name}!`);
        
        // --- CHUYỂN HƯỚNG THEO ROLE ---
        if (userData.role === 'admin') {
            navigate('/admin'); // Admin vào trang quản trị
        } else {
            navigate('/home');  // Khách về trang chủ
        }
        
      } else {
        toast.error(res.data.message || "Sai email hoặc mật khẩu");
      }
    } catch (err: any) {
        console.error("Lỗi đăng nhập:", err);
        // Lấy thông báo lỗi từ response hoặc mặc định
        const errorMsg = err.response?.data?.sqlMessage || err.response?.data || "Lỗi kết nối Server";
        
        // Chỉ hiển thị chuỗi lỗi
        toast.error(typeof errorMsg === 'string' ? errorMsg : "Lỗi hệ thống (Xem Console)");
    }
  };

  // 3. Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Xóa khỏi Storage
    toast('Đã đăng xuất', { icon: '👋' });
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};