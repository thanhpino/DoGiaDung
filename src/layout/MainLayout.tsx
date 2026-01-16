// src/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ChatBot } from '../components/ChatBot'; 

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF7] relative">
      
      {/* HEADER */}
      <Header />

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* --- 2. THÊM CHATBOT  --- */}
      <ChatBot /> 
      
    </div>
  );
};

export default MainLayout;