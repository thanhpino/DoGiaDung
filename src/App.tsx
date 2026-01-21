import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layout/MainLayout';
import { AdminLayout } from './layout/AdminLayout';

// Components & Context
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Pages - Client
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetail } from './pages/DetailPage';
import { Checkout } from './pages/Checkout';
import { SignupPage } from './pages/SignupPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { OrderHistory } from './pages/OrderHistory';
import { ThankYouPage } from './pages/ThankYouPage';
import { UserProfile } from './pages/UserProfile';
import { ResetPassword } from './pages/ResetPassword';

// Pages - Admin
import { AdminDashboard } from './pages/admin/Dashboard';
import { OrderManager } from './pages/admin/OrderManager';
import { ProductManager } from './pages/admin/ProductManager';
import { CustomerManager } from './pages/admin/CustomerManager';
import { Settings } from './pages/admin/Settings';
import { InvoicePage } from './pages/admin/InvoicePage';
import { ComboSuggestion } from './pages/ComboSuggestion';

// Main App Component
import PageTitle from './components/PageTitle';

//Policy Page
import { PolicyPage } from './pages/PolicyPage';  

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: { background: '#333', color: '#fff' },
          success: {
            iconTheme: { primary: '#ea8d35', secondary: '#fff' },
          },
        }}
      />
      <PageTitle />
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Navigate to="/home" replace />} /> 
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* --- CLIENT ROUTES  --- */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Các trang cần đăng nhập mới xem được  */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/thank-you" element={<ThankYouPage />} />  
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/combo-suggestion" element={<ComboSuggestion />} />
            </Route>

            {/* --- ADMIN ROUTES 🛡️ --- */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
                <Route index element={<AdminDashboard />} />      
                <Route path="orders" element={<OrderManager />} /> 
                <Route path="products" element={<ProductManager />} />
                <Route path="customers" element={<CustomerManager />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Route Hóa đơn */}
            <Route 
              path="/invoice/:id" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <InvoicePage />
                </ProtectedRoute>
              } 
            />

            {/* Route 404 - Bắt link sai */}
            <Route path="*" element={<Navigate to="/home" replace />} />
            {/* --- POLICY PAGES --- */}
            <Route path="/policy/:slug" element={<PolicyPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;