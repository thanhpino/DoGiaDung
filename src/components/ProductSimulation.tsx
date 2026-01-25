import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle, Thermometer, Fan, Utensils } from 'lucide-react';

interface Props {
    product: any;
}

export const ProductSimulation: React.FC<Props> = ({ product }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Sẵn sàng");
    const [temp, setTemp] = useState(25);

    // Reset khi đổi sản phẩm
    useEffect(() => {
        setIsRunning(false);
        setProgress(0);
        setStatus("Sẵn sàng");
        setTemp(25);
    }, [product]);

    // Xử lý chạy mô phỏng
    useEffect(() => {
        let interval: any;
        if (isRunning && progress < 100) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsRunning(false);
                        setStatus("Hoàn tất!");
                        return 100;
                    }
                    // Logic tăng nhiệt độ cho Ấm đun
                    if (isKettle) setTemp(t => Math.min(100, t + 1.5));
                    return prev + 1;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRunning, progress]);

    const handleStart = () => {
        setIsRunning(true);
        setProgress(0);
        setTemp(25);
        setStatus("Đang hoạt động...");
    };

    const handleReset = () => {
        setIsRunning(false);
        setProgress(0);
        setStatus("Sẵn sàng");
        setTemp(25);
    };

    // --- PHÂN LOẠI SẢN PHẨM ---
    const name = product.name.toLowerCase();
    const cat = product.category || "";
    const isRobot = (cat === 'Cleaning' || cat === 'Gadget') && (name.includes('robot') || name.includes('hút bụi'));
    const isCooker = cat === 'Kitchen' && (name.includes('nồi') || name.includes('chiên') || name.includes('bếp') || name.includes('lò'));
    const isKettle = (cat === 'Kitchen' || cat === 'Personal') && (
        name.includes('ấm ') || name.includes('siêu tốc') || name.includes('bình giữ nhiệt') || name.includes('bình đun')
    );
    const isFan = (cat === 'Cooling' || cat === 'Health' || cat === 'Gadget') && (name.includes('quạt') || name.includes('máy lọc') || name.includes('máy xay'));

    // 1. GIAO DIỆN ROBOT DỌN DẸP
    if (isRobot) {
        return (
            <div className="bg-gray-100 rounded-2xl p-6 h-full flex flex-col items-center justify-center relative overflow-hidden border-2 border-dashed border-gray-300">
                <h3 className="text-gray-500 font-bold mb-4 uppercase tracking-widest text-sm">Mô Phỏng Dọn Dẹp</h3>
                
                {/* Sàn nhà */}
                <div className="w-full h-48 bg-white border border-gray-200 rounded-xl relative overflow-hidden shadow-inner">
                    {/* Rác giả */}
                    {!isRunning && progress === 0 && (
                        <>
                            <div className="absolute top-10 left-10 w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="absolute bottom-10 right-20 w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                        </>
                    )}
                    
                    {/* Robot */}
                    <div 
                        className={`absolute w-12 h-12 bg-black rounded-full border-4 border-orange-500 flex items-center justify-center text-white text-[10px] transition-all duration-75 shadow-xl z-10 ${isRunning ? 'animate-robot-move' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}`}
                        style={{
                            left: isRunning ? `${(Math.sin(progress / 10) * 40) + 50}%` : '',
                            top: isRunning ? `${(Math.cos(progress / 15) * 30) + 50}%` : ''
                        }}
                    >
                        🤖
                    </div>

                    {/* Vệt sạch */}
                    {isRunning && <div className="absolute inset-0 bg-blue-50/30 transition-opacity duration-1000"></div>}
                </div>

                <div className="mt-4 flex gap-3">
                    {!isRunning && progress !== 100 ? (
                        <button onClick={handleStart} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition">
                            <Play size={16}/> Chạy Thử
                        </button>
                    ) : (
                        <button onClick={handleReset} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-bold hover:bg-gray-300 transition">
                            <RotateCcw size={16}/> Làm Lại
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 2. GIAO DIỆN NỒI CƠM / NỒI CHIÊN 
    if (isCooker) {
        return (
            <div className="bg-orange-50 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
                <Utensils size={40} className={`mb-4 ${isRunning ? 'text-orange-600 animate-bounce' : 'text-gray-400'}`}/>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{status}</h3>
                <p className="text-sm text-gray-500 mb-6">Chế độ: Nấu tiêu chuẩn</p>

                {/* Thanh Progress */}
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-right w-full text-xs font-bold text-orange-600 mb-6">{Math.round(progress)}%</div>

                {!isRunning && progress < 100 ? (
                    <button onClick={handleStart} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                        Bắt đầu nấu
                    </button>
                ) : progress === 100 ? (
                    <div className="flex flex-col items-center animate-fade-in">
                        <CheckCircle size={40} className="text-green-500 mb-2"/>
                        <button onClick={handleReset} className="text-gray-500 underline text-sm hover:text-orange-600">Thử lại</button>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic">Đang xử lý nhiệt...</div>
                )}
            </div>
        );
    }

    // 3. GIAO DIỆN ẤM ĐUN / MÁY XAY 
    if (isKettle || isFan) {
        return (
            <div className="bg-blue-50 rounded-2xl p-6 h-full flex flex-col items-center justify-center relative">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 transition-all duration-300 ${isRunning ? 'border-red-500 bg-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-gray-300 bg-gray-50'}`}>
                    <div className="text-center">
                        {isKettle ? (
                            <>
                                <Thermometer size={24} className={`mx-auto mb-1 ${Math.round(temp) >= 100 ? 'text-red-600' : 'text-gray-400'}`}/>
                                <span className="text-3xl font-black text-gray-800">{Math.round(temp)}°C</span>
                            </>
                        ) : (
                            <>
                                <Fan size={24} className={`mx-auto mb-1 ${isRunning ? 'animate-spin text-blue-600' : 'text-gray-400'}`}/>
                                <span className="text-xl font-bold text-gray-800">{isRunning ? 'MAX' : 'OFF'}</span>
                            </>
                        )}
                    </div>
                </div>

                {!isRunning && progress < 100 ? (
                    <button onClick={handleStart} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        {isKettle ? 'Đun nước' : 'Khởi động'}
                    </button>
                ) : (
                    <button onClick={handleReset} disabled={isRunning} className={`px-6 py-2 rounded-lg font-bold ${isRunning ? 'text-gray-400' : 'bg-white border hover:bg-gray-50'}`}>
                        {isRunning ? 'Đang chạy...' : 'Reset'}
                    </button>
                )}
            </div>
        );
    }

    // 4. MẶC ĐỊNH
    return (
        <div className="bg-gray-50 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center border border-gray-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle size={32} className="text-green-500"/>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Sản phẩm chính hãng</h3>
            <p className="text-sm text-gray-500">Sản phẩm này đã được kiểm định chất lượng và sẵn sàng sử dụng.</p>
        </div>
    );
};