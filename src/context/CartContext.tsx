import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../data/products';
import { useAuth } from './AuthContext'; 

// --- 1. INTERFACE ---
export interface CartItem extends Product {
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
  status: string;
  paymentMethod: string; 
  note: string;          
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void; 
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, amount: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  placeOrder: (paymentMethod: string, note: string) => Promise<void>; 
  orders: Order[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  useAuth(); 
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]); 

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cartItems)); }, [cartItems]);

  // --- 2. LOGIC ADD TO CART  ---
  const addToCart = (product: any) => {
    // Ép kiểu dữ liệu để đảm bảo luôn có ảnh hiển thị
    const productToAdd: CartItem = {
        ...product,
        // Ưu tiên lấy image_url (DB/Chatbot), nếu không có thì lấy img, không có nữa thì lấy ảnh giữ chỗ
        img: product.image_url || product.img || 'https://placehold.co/400x400?text=No+Image',
        quantity: 1
    };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, productToAdd];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, amount: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async (paymentMethod: string, note: string) => {
      clearCart();
      // Lưu lịch sử local tạm thời
      const newOrderUI: Order = {
          id: `ORD-${Date.now()}`,
          date: new Date().toLocaleString('vi-VN'),
          total: getCartTotal(),
          items: [...cartItems],
          status: 'Chờ xác nhận',
          paymentMethod: paymentMethod,
          note: note
      };
      setOrders(prev => [newOrderUI, ...prev]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, placeOrder, orders }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};