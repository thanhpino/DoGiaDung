import { createContext, useContext, useState, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface CompareProduct {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    img?: string;
    category?: string;
    description?: string;
    rating?: number;
}

interface CompareContextType {
    compareItems: CompareProduct[];
    addToCompare: (product: CompareProduct) => void;
    removeFromCompare: (id: number) => void;
    clearCompare: () => void;
    isInCompare: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
    const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);

    const addToCompare = (product: CompareProduct) => {
        if (compareItems.length >= 3) {
            toast.error('Chỉ so sánh tối đa 3 sản phẩm!');
            return;
        }
        if (compareItems.find(item => item.id === product.id)) {
            toast('Sản phẩm đã có trong danh sách so sánh');
            return;
        }
        setCompareItems(prev => [...prev, product]);
        toast.success(`Đã thêm "${product.name}" vào so sánh`);
    };

    const removeFromCompare = (id: number) => {
        setCompareItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCompare = () => setCompareItems([]);

    const isInCompare = (id: number) => compareItems.some(item => item.id === id);

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) throw new Error('useCompare must be used within a CompareProvider');
    return context;
};
