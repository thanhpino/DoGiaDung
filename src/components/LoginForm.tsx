import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import FacebookLoginPackage from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = (FacebookLoginPackage as any).default || FacebookLoginPackage;

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Facebook SVG Icon
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const LoginForm = () => {
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  // Google Login handler
  const handleGoogleLogin = () => {
    // @ts-ignore - google is loaded via script tag
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          socialLogin('google', response.credential);
        }
      });
      // @ts-ignore
      window.google.accounts.id.prompt();
    }
  };

  // Facebook Login callback
  const responseFacebook = (response: any) => {
    if (response.accessToken) {
      socialLogin('facebook', response.accessToken);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3] dark:bg-gray-950 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-500 dark:text-gray-400">Đăng nhập tài khoản</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
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

          <Button type="submit" fullWidth variant="primary">
            ĐĂNG NHẬP
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">hoặc</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer"
        >
          <GoogleIcon />
          Đăng nhập bằng Google
        </button>

        {/* Facebook Login Button */}
        <FacebookLogin
          appId={import.meta.env.VITE_FACEBOOK_APP_ID || ''}
          fields="name,email,picture"
          callback={responseFacebook}
          render={(renderProps: any) => (
            <button
              onClick={renderProps.onClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer"
            >
              <FacebookIcon />
              Đăng nhập bằng Facebook
            </button>
          )}
        />

        <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
          Chưa có tài khoản? <Link to="/register" className="text-orange-600 font-bold hover:underline">Đăng ký ngay</Link>
        </p>

      </div>
    </div>
  );
};