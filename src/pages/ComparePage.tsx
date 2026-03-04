import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ComparePage = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();

    const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

    if (compareItems.length === 0) return (
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
            <p className="text-gray-500 text-lg mb-4">Chưa có sản phẩm nào để so sánh</p>
            <Link to="/products" className="text-orange-600 font-semibold hover:underline">← Quay lại cửa hàng</Link>
        </div>
    );

    const fields = [
        { label: 'Ảnh', render: (p: any) => <img src={p.image_url || p.img || 'https://placehold.co/200x200'} alt={p.name} className="w-32 h-32 object-cover rounded-lg mx-auto" /> },
        { label: 'Tên', render: (p: any) => <span className="font-semibold text-gray-900 dark:text-white">{p.name}</span> },
        { label: 'Giá', render: (p: any) => <span className="text-orange-600 font-bold text-lg">{formatPrice(p.price)}</span> },
        { label: 'Danh mục', render: (p: any) => <span className="text-gray-600 dark:text-gray-300">{p.category || '—'}</span> },
        { label: 'Mô tả', render: (p: any) => <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{p.description || 'Chưa có mô tả'}</p> },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Link to="/products" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">So sánh sản phẩm</h1>
                </div>
                <button onClick={clearCompare} className="text-red-500 hover:text-red-600 text-sm font-medium cursor-pointer">
                    Xóa tất cả
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="w-32 p-4 text-left text-gray-500 text-sm font-medium"></th>
                            {compareItems.map(item => (
                                <th key={item.id} className="p-4 text-center min-w-[200px] relative">
                                    <button onClick={() => removeFromCompare(item.id)}
                                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer">
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                                <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</td>
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-4 text-center">{field.render(item)}</td>
                                ))}
                            </tr>
                        ))}
                        <tr>
                            <td className="p-4"></td>
                            {compareItems.map(item => (
                                <td key={item.id} className="p-4 text-center">
                                    <button onClick={() => { addToCart(item); toast.success('Đã thêm vào giỏ!'); }}
                                        className="flex items-center justify-center gap-2 mx-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                        <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
