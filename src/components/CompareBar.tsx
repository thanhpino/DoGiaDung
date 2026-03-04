import { useCompare } from '../context/CompareContext';
import { X, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompareBar = () => {
    const { compareItems, removeFromCompare } = useCompare();

    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        So sánh ({compareItems.length}/3):
                    </span>
                    <div className="flex gap-2">
                        {compareItems.map(item => (
                            <div key={item.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                                    {item.name}
                                </span>
                                <button onClick={() => removeFromCompare(item.id)} className="hover:text-red-500 cursor-pointer">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {compareItems.length >= 2 && (
                    <Link to="/compare"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        So sánh ngay →
                    </Link>
                )}
            </div>
        </div>
    );
};
