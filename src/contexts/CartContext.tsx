import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useCartItems, 
  useAddToCart, 
  useUpdateCartQuantity, 
  useRemoveFromCart, 
  useClearCart 
} from '@/hooks/useCartSync';

export interface CartItem {
  id: string;
  variantId?: string;
  name: string;
  variantName?: string;
  description: string;
  price: number;
  packSize: string;
  image_url: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'nilgirisfresh_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Local cart for guests
  const [localItems, setLocalItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Backend cart hooks
  const { data: backendItems = [], isLoading } = useCartItems();
  const addToCartMutation = useAddToCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Sync local cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localItems));
    }
  }, [localItems, user]);


  const clearCart = useCallback(() => {
    if (user) {
      clearCartMutation.mutate();
    } else {
      setLocalItems([]);
    }
  }, [user, clearCartMutation]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
