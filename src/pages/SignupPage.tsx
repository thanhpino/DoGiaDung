import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.png';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { ShieldCheck, Sparkles, Star, PartyPopper, ShoppingBag } from 'lucide-react';

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
    register(name, email, pass);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start py-20 px-4 lg:p-8 overflow-x-hidden font-sans">
      {/* 1. Full-Screen Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={loginBg}
          alt="Signup Background"
          className="w-full h-full object-cover scale-100 grayscale-[10%]"
        />
        {/* Dark Overlay for focus */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/40 to-orange-950/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Main Content Overlay */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">

        {/* Top Header Section */}
        <div className="text-center mb-16 text-white animate-fade-in-down">
          <div className="flex items-center justify-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 transform hover:scale-110 transition-transform duration-300">
              <ShoppingBag size={32} strokeWidth={2.5} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-2xl">
            Everything you need, <br />
            <span className="text-orange-500 italic decoration-white/20 underline-offset-8">right at your fingertips.</span>
          </h1>
          <p className="text-white/60 mt-6 max-w-lg mx-auto text-lg font-medium leading-relaxed">
            Gia nhập cộng đồng TMT để tận hưởng cuộc sống tiện nghi và hiện đại nhất.
          </p>
        </div>

        {/* Feature Grid & Form Card */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Feature Column (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-12 text-white animate-fade-in-up delay-200 mt-10">
            <div className="flex items-start gap-8 group hover:translate-x-3 transition-all duration-300">
              <div className="p-5 rounded-[2rem] bg-orange-600/20 border border-orange-500/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl shadow-orange-600/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-2xl tracking-tight">Ưu đãi độc quyền</h4>
                <p className="text-white/50 mt-2 leading-relaxed">Giảm ngay 10% cho đơn hàng đầu tiên ngay sau khi đăng ký.</p>
              </div>
            </div>
            <div className="flex items-start gap-8 group hover:translate-x-3 transition-all duration-300">
              <div className="p-5 rounded-[2rem] bg-orange-600/20 border border-orange-500/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl shadow-orange-600/10">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-2xl tracking-tight">Tích điểm thưởng</h4>
                <p className="text-white/50 mt-2 leading-relaxed">Tích lũy điểm cho mỗi lần mua sắm để đổi lấy quà tặng hấp dẫn.</p>
              </div>
            </div>
            <div className="flex items-start gap-8 group hover:translate-x-3 transition-all duration-300">
              <div className="p-5 rounded-[2rem] bg-orange-600/20 border border-orange-500/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl shadow-orange-600/10">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-2xl tracking-tight">Bảo mật thông tin</h4>
                <p className="text-white/50 mt-2 leading-relaxed">Cam kết bảo vệ dữ liệu cá nhân của bạn theo tiêu chuẩn quốc tế.</p>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-6 w-full animate-scale-up">
            <div className="backdrop-blur-3xl bg-white/10 p-10 lg:p-12 w-full max-w-md rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 mx-auto transition-all hover:bg-white/[0.12] group">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-orange-500 text-white shadow-2xl shadow-orange-500/30 group-hover:rotate-6 transition-transform">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Đăng ký thành viên</h2>
                <div className="h-1.5 w-16 bg-orange-500 mx-auto rounded-full"></div>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-6">
                <Input
                  label="Họ và Tên"
                  labelClassName="text-white/90 font-bold"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 focus:bg-white/10 transition-all"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
                <Input
                  label="Email"
                  labelClassName="text-white/90 font-bold"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 focus:bg-white/10 transition-all"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                <Input
                  label="Mật khẩu"
                  labelClassName="text-white/90 font-bold"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 focus:bg-white/10 transition-all"
                  type="password"
                  required
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="Nhập lại mật khẩu"
                  labelClassName="text-white/90 font-bold"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 focus:bg-white/10 transition-all"
                  type="password"
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                />

                <Button type="submit" fullWidth variant="primary" className="py-5 mt-4 text-lg font-black tracking-widest shadow-2xl shadow-orange-600/40 transition-all active:scale-95 group-hover:translate-y-[-2px]">
                  ĐĂNG KÝ NGAY
                </Button>
              </form>

              <p className="text-center mt-12 text-white/50 text-sm font-medium">
                Đã có tài khoản? <Link to="/login" className="text-orange-500 font-black hover:text-orange-400 transition-colors uppercase tracking-[0.2em] text-xs ml-2">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-24 text-center animate-fade-in-up delay-300 w-full mb-10">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-10 text-white/30 text-xs font-bold uppercase tracking-widest">
            <a href="/policy/trung-tam-tro-giup" className="hover:text-white transition-colors">Trung tâm trợ giúp</a>
            <a href="/policy/chinh-sach-bao-hanh" className="hover:text-white transition-colors">Chính sách bảo hành</a>
            <a href="/policy/chinh-sach-bao-mat" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
          <p className="text-white/20 text-[10px] font-black tracking-[1.5rem] uppercase pl-[1.5rem] opacity-50">
            Gia Dụng TMT
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-up {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};