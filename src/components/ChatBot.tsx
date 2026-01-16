import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Plus, Bot, User, RefreshCw, Zap } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { addToCart } = useCart();

  const [messages, setMessages] = useState<{ text: string, isUser: boolean, products?: any[] }[]>([
    { text: "Xin chào! HomeBot TMT sẵn sàng phục vụ. Bạn cần tìm món đồ gia dụng nào?", isUser: false }
  ]);

  const quickQuestions = [
      "🔥 Hàng dưới 500k",
      "🚚 Phí ship?",
      "🍚 Nồi cơm điện",
      "🤖 Robot hút bụi",
      "🏠 Đồ gia dụng bán chạy"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const msgToSend = textOverride || input;
    if (!msgToSend.trim()) return;

    setMessages(prev => [...prev, { text: msgToSend, isUser: true }]);
    setInput("");
    setIsTyping(true);

    try {
        const res = await axios.post('http://localhost:8081/api/chat', { message: msgToSend });
        
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                text: res.data.reply, 
                isUser: false,
                products: res.data.products 
            }]);
            setIsTyping(false);
        }, 800);
    } catch (error) {
        setMessages(prev => [...prev, { text: "HomeBot đang bảo trì xíu. Bạn thử lại sau nhé!", isUser: false }]);
        setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + '₫';

  const handleReset = () => {
      setMessages([{ text: "Xin chào! HomeBot TMT sẵn sàng phục vụ. Bạn cần tìm món đồ gia dụng nào?", isUser: false }]);
  };

  return (
    <div className="fixed bottom-8 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* CỬA SỔ CHAT  */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[600px] bg-white rounded-[2rem] shadow-2xl flex flex-col mb-6 animate-fade-in-up overflow-hidden border border-gray-100 ring-4 ring-orange-50 relative">
            
            {/* HEADER: Gradient + Glass effect */}
            <div className="bg-gradient-to-r from-orange-600 via-red-500 to-red-600 p-5 flex justify-between items-center text-white shadow-lg relative overflow-hidden">
                {/* Hiệu ứng nền */}
                <div className="absolute top-[-50%] left-[-20%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
                
                <div className="flex items-center gap-3 z-10">
                    <div className="relative">
                        <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-inner">
                            <Bot size={26} className="text-white drop-shadow-md" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-red-500 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-lg tracking-wide flex items-center gap-1 text-white drop-shadow-sm">
                            HomeBot TMT <Zap size={16} className="text-yellow-300 fill-yellow-300 animate-pulse"/>
                        </h3>
                        <p className="text-[11px] text-orange-100 font-medium opacity-90">Chuyên gia gia dụng gia đình</p>
                    </div>
                </div>
                
                <div className="flex gap-2 z-10">
                    <button onClick={handleReset} className="hover:bg-white/20 p-2 rounded-full transition active:scale-90" title="Làm mới">
                        <RefreshCw size={18}/>
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition active:scale-90" title="Đóng chat">
                        <X size={20}/>
                    </button>
                </div>
            </div>

            {/* BODY: Background hoa văn nhẹ */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#F8FAFC] space-y-5 custom-scrollbar relative">
                
                {/* Tin nhắn */}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 ${msg.isUser ? 'bg-gray-100 border-white' : 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-200'}`}>
                            {msg.isUser ? <User size={18} className="text-gray-500"/> : <Bot size={18} className="text-white"/>}
                        </div>

                        <div className={`flex flex-col max-w-[80%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                            {/* Bong bóng chat */}
                            <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm relative ${
                                msg.isUser 
                                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-tr-none' 
                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                            }`}>
                                {msg.text}
                            </div>

                            {/* --- THẺ SẢN PHẨM GỢI Ý --- */}
                            {msg.products && msg.products.length > 0 && (
                                <div className="mt-3 space-y-3 w-full animate-fade-in-up">
                                    {msg.products.map(p => (
                                        <div key={p.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                            {/* Hiệu ứng shine */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                            
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                                                    <img src={p.image_url || p.img} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">{p.name}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-red-600 font-extrabold text-sm">{formatCurrency(p.price)}</p>
                                                        <button 
                                                            onClick={() => {
                                                                addToCart({ ...p, img: p.image_url || p.img });
                                                                toast.success(`Đã thêm ${p.name} vào giỏ!`, { icon: '🛒' });
                                                            }}
                                                            className="bg-orange-50 text-orange-600 p-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition shadow-sm active:scale-90"
                                                            title="Thêm vào giỏ"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                            <Bot size={18} className="text-white"/>
                        </div>
                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 shadow-sm items-center h-10">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* FOOTER: Input & Quick Actions */}
            <div className="bg-white border-t border-gray-100 pb-2">
                {/* Chips câu hỏi nhanh */}
                <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar scroll-smooth">
                    {quickQuestions.map((q, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(q)}
                            className="whitespace-nowrap px-3 py-1.5 bg-orange-50/50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition shadow-sm active:scale-95"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Ô nhập liệu */}
                <div className="px-3 pb-3 flex gap-2 items-center">
                    <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 border border-transparent focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-300 shadow-inner">
                        <input 
                            type="text" 
                            placeholder="Nhập tin nhắn..." 
                            className="w-full bg-transparent border-none py-3 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                    <button 
                        onClick={() => handleSend()}
                        className={`p-3 rounded-full shadow-lg transition-all transform active:scale-90 flex items-center justify-center ${
                            input.trim() 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/50 hover:rotate-12' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!input.trim()}
                    >
                        <Send size={20} className={input.trim() ? 'ml-0.5' : ''}/>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* FLOAT BUTTON  */}
      {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-[0_8px_30px_rgb(234,88,12,0.4)] hover:shadow-[0_8px_35px_rgb(234,88,12,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 z-50 hover:-translate-y-1"
          >
            {/* Hiệu ứng sóng lan tỏa */}
            <span className="absolute w-full h-full bg-orange-500 rounded-full animate-ping opacity-20"></span>
            
            <Bot size={32} className="relative z-10 transition-transform duration-500 group-hover:rotate-12"/>
            
            {/* Tooltip "Chat ngay" */}
            <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0 shadow-xl">
                Chat với HomeBot 🤖
                {/* Mũi tên tooltip */}
                <span className="absolute top-1/2 right-[-4px] -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
            </span>
            
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-bounce"></span>
          </button>
      )}
    </div>
  );
};