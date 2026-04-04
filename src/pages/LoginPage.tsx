import { LoginForm } from '../components/LoginForm';
import loginBg from '../assets/login-bg.png';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 overflow-hidden font-sans">
      {/* 1. Full-Screen Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={loginBg}
          alt="Home Appliances Background"
          className="w-full h-full object-cover scale-105 animate-zoom-slow"
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-orange-950/50 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Top Branding Section (Floating) */}
      <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
            <span className="text-white font-black">T</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight hidden sm:inline-block">Gia Dụng TMT</span>
        </div>
        <div className="flex items-center gap-6 text-white/80 text-sm font-semibold tracking-wide hidden md:flex">
          <div className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-default">
            <Truck className="w-4 h-4" /> Giao hàng nhanh
          </div>
          <div className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-default">
            <ShieldCheck className="w-4 h-4" /> Bảo hành 12 tháng
          </div>
        </div>
      </div>

      {/* 3. Main Content: Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center py-20 lg:py-10">
        {/* Marketing Badge */}
        <div className="mb-10 text-center text-white space-y-4 animate-fade-in-down px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 font-bold text-sm tracking-widest uppercase">
            <Sparkles className="w-4 h-4" /> Shop Đồ Gia Dụng TMT
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-2xl">
            Everything you need, <br />
            <span className="text-orange-500">right at your fingertips.</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">
            Khám phá bộ sưu tập đồ gia dụng hiện đại giúp cuộc sống của bạn trở nên tiện nghi và đơn giản hơn bao giờ hết.
          </p>
        </div>

        <div className="w-full max-w-md animate-fade-in-up px-4">
          <LoginForm />
        </div>

        {/* 4. Refined Footer Section (Now relative to avoid overlap) */}
        <div className="mt-12 text-center animate-fade-in-up delay-300">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-white/50 text-xs font-semibold mb-6 uppercase tracking-wider">
            <a href="/policy/chinh-sach-bao-mat" className="hover:text-orange-400 transition-colors">Chính sách bảo mật</a>
            <a href="/policy/dieu-khoan-su-dung" className="hover:text-orange-400 transition-colors">Điều khoản dịch vụ</a>
            <a href="/policy/chinh-sach-doi-tra" className="hover:text-orange-400 transition-colors">Chính sách trả hàng</a>
          </div>
          <p className="text-white/30 text-xs font-medium tracking-[0.3em] uppercase">
            © 2026 <span className="text-orange-500/50">Gia Dụng TMT</span>. All rights reserved.
          </p>
        </div>
      </div>

      {/* Add custom keyframe animations if not in index.css */}
      <style>{`
        @keyframes zoom-slow {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-zoom-slow { animation: zoom-slow 20s infinite ease-in-out; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}</style>
    </div>
  );
};
