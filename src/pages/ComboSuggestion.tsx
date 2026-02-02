import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, ArrowLeft, CheckCircle, AlertCircle, Zap, TrendingUp, Utensils, Wind, Home, Smile, Eraser, Lightbulb, HeartPulse, Search, BedDouble, Bath, Palette, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image_url: string;
    brand?: string;
    color?: string;
}

interface ComboSolution {
    items: Product[];
    totalPrice: number;
    remaining: number;
}

interface ApiResponse {
    success: boolean;
    count: number;
    solutions: ComboSolution[];
    message?: string;
    metadata?: {
        executionTime: string;
        exploredNodes: number;
        totalSolutions: number;
    };
}

export const ComboSuggestion = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    // State Inputs
    const [budget, setBudget] = useState(Number(searchParams.get('budget')) || 5000000);
    const [selectedCats, setSelectedCats] = useState<string[]>(['Kitchen', 'Cooling']);
    
    // State Data
    const [solutions, setSolutions] = useState<ComboSolution[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);

    // Danh sách danh mục
    const availableCategories = [
        { id: 'Kitchen', label: 'Nhà bếp', desc: 'Nồi, Chảo, Bếp...', icon: <Utensils size={24}/>, color: 'bg-orange-100 text-orange-600' },
        { id: 'Cooling', label: 'Điện máy', desc: 'Quạt, Máy lạnh...', icon: <Wind size={24}/>, color: 'bg-blue-100 text-blue-600' },
        { id: 'Cleaning', label: 'Dọn dẹp', desc: 'Hút bụi, Lau sàn...', icon: <Eraser size={24}/>, color: 'bg-teal-100 text-teal-600' },
        { id: 'SmartHome', label: 'Smarthome', desc: 'Khóa, Cam...', icon: <Home size={24}/>, color: 'bg-indigo-100 text-indigo-600' },
        { id: 'Bedroom', label: 'Phòng ngủ', desc: 'Chăn ga, Đèn ngủ...', icon: <BedDouble size={24}/>, color: 'bg-purple-100 text-purple-600' },
        { id: 'Bathroom', label: 'Phòng tắm', desc: 'Kệ, Thảm, Vòi...', icon: <Bath size={24}/>, color: 'bg-cyan-100 text-cyan-600' },
        { id: 'Decor', label: 'Decor', desc: 'Tranh, Hoa, Gương...', icon: <Palette size={24}/>, color: 'bg-rose-100 text-rose-600' },
        { id: 'Gadget', label: 'Công nghệ', desc: 'Loa, Phụ kiện...', icon: <Gamepad2 size={24}/>, color: 'bg-slate-100 text-slate-600' },
        { id: 'Lighting', label: 'Chiếu sáng', desc: 'Đèn bàn, Led...', icon: <Lightbulb size={24}/>, color: 'bg-yellow-100 text-yellow-600' },
        { id: 'Health', label: 'Sức khỏe', desc: 'Massage, Yoga...', icon: <HeartPulse size={24}/>, color: 'bg-green-100 text-green-600' },
        { id: 'Beauty', label: 'Làm đẹp', desc: 'Máy sấy, Kẹp tóc...', icon: <Smile size={24}/>, color: 'bg-pink-100 text-pink-600' }
    ];

    const handleCategoryToggle = (catId: string) => {
        setSelectedCats(prev => 
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const handleFindCombo = async () => {
        if (selectedCats.length === 0) return toast.error("Vui lòng chọn ít nhất 1 loại sản phẩm!");
        if (budget < 100000) return toast.error("Ngân sách đang thấp quá ạ, vui lòng nhập ngân sách cao hơn!");

        setLoading(true);
        setSearched(true);
        setSolutions([]);
        setMetadata(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            const res = await axios.post<ApiResponse>(
                `${apiUrl}/api/suggestions/combo`,
                { budget, categories: selectedCats }
            );

            if (res.data.success) {
                setSolutions(res.data.solutions);
                setMetadata(res.data.metadata);
                if (res.data.solutions.length === 0) {
                    toast.error(res.data.message || "Không tìm thấy combo nào phù hợp!");
                } else {
                    toast.success(`🎉 TMT Bot đã tìm thấy ${res.data.solutions.length} combo tuyệt vời!`);
                }
            } else {
                toast.error(res.data.message || "Có lỗi xảy ra!");
            }
        } catch (error: any) {
            console.error('❌ Error:', error);
            const errorMsg = error.response?.data?.message || "Lỗi khi gọi API thuật toán CSP!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Tự động chạy lần đầu nếu có budget từ URL
    useEffect(() => {
        if (searchParams.get('budget')) handleFindCombo();
    }, []);

    const handleAddComboToCart = (items: Product[]) => {
        items.forEach(item => {
            addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.image_url,
                category: item.category
            });
        });
        toast.success("✅ Đã thêm Combo vào giỏ hàng! 🎁");
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-[#FFFBF7] py-8 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
                            <ArrowLeft size={24} className="text-gray-600"/>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2">
                                <Sparkles className="text-orange-600 fill-orange-600 animate-pulse" />
                                Gợi Ý Combo
                            </h1>
                            <p className="text-gray-500 text-sm">Tìm trọn bộ sản phẩm tối ưu nhất theo ngân sách của bạn.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDE: CONFIGURATION */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 relative lg:sticky lg:top-24 z-0">
                            
                            {/* Ngân sách Input */}
                            <div className="mb-8">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">$</div>
                                    Ngân sách dự kiến
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        value={budget}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="w-full pl-4 pr-12 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-bold text-orange-600 outline-none text-xl transition-all"
                                        step="100000"
                                    />
                                    <span className="absolute right-5 top-4.5 text-gray-400 text-sm font-bold">VNĐ</span>
                                </div>
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {[2000000, 5000000, 10000000].map(val => (
                                        <button key={val} onClick={() => setBudget(val)} className="flex-shrink-0 text-xs bg-gray-100 px-3 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition font-bold text-gray-600">
                                            {val/1000000}tr
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Danh mục Selection Grid */}
                            <div className="mb-8">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">#</div>
                                    Bạn muốn mua gì?
                                </label>
                                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {availableCategories.map(cat => {
                                        const isSelected = selectedCats.includes(cat.id);
                                        return (
                                            <div 
                                                key={cat.id}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                                className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-2 group ${
                                                    isSelected 
                                                        ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]' 
                                                        : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {/* Icon Box */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 text-white' : cat.color}`}>
                                                    {cat.icon}
                                                </div>
                                                
                                                <div>
                                                    <p className={`text-xs font-bold ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>{cat.label}</p>
                                                    <p className="text-[10px] text-gray-400 line-clamp-1">{cat.desc}</p>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 text-orange-500 animate-in zoom-in duration-300">
                                                        <CheckCircle size={16} fill="currentColor" className="text-white"/>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-3 text-center">Đã chọn: <span className="font-bold text-orange-600">{selectedCats.length}</span> danh mục</p>
                            </div>

                            {/* Submit Button */}
                            <button 
                                onClick={handleFindCombo}
                                disabled={loading || selectedCats.length === 0}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group active:scale-95 duration-200"
                            >
                                {loading ? <Zap className="animate-spin" /> : <Search className="group-hover:scale-110 transition"/>}
                                {loading ? 'TMT Bot Đang Tính...' : 'TÌM COMBO NGAY'}
                            </button>

                            {/* Metadata Mini */}
                            {metadata && (
                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    <span>Time: {metadata.executionTime}</span>
                                    <span>Nodes: {metadata.exploredNodes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: RESULTS */}
                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500" size={24}/>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mt-6">TMT Bot đang phân tích...</h3>
                                <p className="text-gray-400 text-sm mt-2">Đang duyệt ngân hàng sản phẩm để tìm combo tốt nhất.</p>
                            </div>
                        ) : solutions.length > 0 ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between bg-green-50 p-4 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <TrendingUp size={20}/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-green-800">Thành công!</h3>
                                            <p className="text-xs text-green-600">Tìm thấy {solutions.length} phương án thỏa mãn ngân sách.</p>
                                        </div>
                                    </div>
                                </div>

                                {solutions.map((sol, idx) => (
                                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                            #{idx + 1} Tối Ưu
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* List Items */}
                                            <div className="flex-1 space-y-4">
                                                {sol.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4 group/item">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 border border-gray-100 group-hover/item:border-orange-200 transition">
                                                            <img src={item.image_url} className="w-full h-full object-contain mix-blend-multiply" alt={item.name}/>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{item.category}</p>
                                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover/item:text-orange-600 transition">{item.name}</h4>
                                                            <p className="text-sm font-medium text-gray-500">{formatCurrency(item.price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Summary Card */}
                                            <div className="md:w-64 bg-gray-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-gray-100">
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tổng giá trị</p>
                                                <p className="text-3xl font-extrabold text-orange-600 mb-1">{formatCurrency(sol.totalPrice)}</p>
                                                <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-md font-bold mb-6">
                                                    Tiết kiệm: {formatCurrency(sol.remaining)}
                                                </p>
                                                
                                                <button 
                                                    onClick={() => handleAddComboToCart(sol.items)}
                                                    className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 group-hover:scale-105 duration-200"
                                                >
                                                    <ShoppingBag size={16}/> Chọn Combo Này
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searched ? (
                            <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-3xl border border-gray-200">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="text-red-500" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Không tìm thấy Combo nào! phù hợp với ngân sách của bạn</h3>
                                <p className="text-gray-400 text-sm mt-2 text-center max-w-xs">
                                    Hic, TMT đã cố gắng nhưng không tìm được. <br/>Bạn thử tăng ngân sách một chút nhé?
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-3xl border border-gray-200 opacity-50">
                                <Sparkles className="text-gray-300 mb-4" size={64} />
                                <p className="text-gray-400 font-medium">Nhập thông tin bên trái để bắt đầu...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};