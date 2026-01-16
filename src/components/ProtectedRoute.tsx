import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string; 
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // 1. Chưa đăng nhập -> Về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng sai Role -> Về Home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  // 3. Hợp lệ -> Cho hiện nội dung
  return children;
};