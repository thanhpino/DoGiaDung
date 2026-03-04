import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/axiosConfig';

interface WishlistContextType {
    wishlistIds: number[];
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (productId: number) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);

    const refreshWishlist = async () => {
        if (!user) { setWishlistIds([]); return; }
        try {
            const res = await api.get('/api/wishlist/ids');
            setWishlistIds(res.data);
        } catch { setWishlistIds([]); }
    };

    useEffect(() => { refreshWishlist(); }, [user]);

    const isInWishlist = (productId: number) => wishlistIds.includes(productId);

    const toggleWishlist = async (productId: number) => {
        if (!user) return;
        try {
            if (isInWishlist(productId)) {
                await api.delete(`/api/wishlist/${productId}`);
                setWishlistIds(prev => prev.filter(id => id !== productId));
            } else {
                await api.post('/api/wishlist', { productId });
                setWishlistIds(prev => [...prev, productId]);
            }
        } catch (err) {
            console.error('Wishlist error:', err);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
