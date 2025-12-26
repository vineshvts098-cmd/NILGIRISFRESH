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

  // Merge local cart to backend when user logs in
  useEffect(() => {
    if (user && localItems.length > 0) {
      // Add local items to backend
      localItems.forEach(item => {
        addToCartMutation.mutate({
          productId: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      });
      // Clear local cart after merge
      setLocalItems([]);
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  }, [user]);

  // Use backend items if logged in, otherwise local
  const items = user ? backendItems : localItems;

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (user) {
      // Add to backend
      addToCartMutation.mutate({
        productId: product.id,
        variantId: product.variantId,
        quantity,
      });
    } else {
      // Add to local cart
      setLocalItems(prev => {
        const cartKey = product.variantId ? `${product.id}-${product.variantId}` : product.id;
        const existing = prev.find(item => {
          const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
          return itemKey === cartKey;
        });
        
        if (existing) {
          return prev.map(item => {
            const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
            return itemKey === cartKey
              ? { ...item, quantity: item.quantity + quantity }
              : item;
          });
        }
        return [...prev, { ...product, quantity }];
      });
    }
  }, [user, addToCartMutation]);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    if (user) {
      removeFromCartMutation.mutate({ productId, variantId });
    } else {
      setLocalItems(prev => prev.filter(item => {
        if (variantId) {
          return !(item.id === productId && item.variantId === variantId);
        }
        return item.id !== productId;
      }));
    }
  }, [user, removeFromCartMutation]);

  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    
    if (user) {
      updateQuantityMutation.mutate({ productId, variantId, quantity });
    } else {
      setLocalItems(prev =>
        prev.map(item => {
          if (variantId) {
            return (item.id === productId && item.variantId === variantId)
              ? { ...item, quantity }
              : item;
          }
          return item.id === productId ? { ...item, quantity } : item;
        })
      );
    }
  }, [user, updateQuantityMutation, removeFromCart]);

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
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  variantId?: string;  // For variant tracking
  name: string;
  variantName?: string;  // e.g., "Premium - 500g"
  description: string;
  price: number;
  packSize: string;
  image_url: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'nilgirisfresh_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      // Match by both product id and variant id for unique cart items
      const cartKey = product.variantId ? `${product.id}-${product.variantId}` : product.id;
      const existing = prev.find(item => {
        const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
        return itemKey === cartKey;
      });
      
      if (existing) {
        return prev.map(item => {
          const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
          return itemKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setItems(prev => prev.filter(item => {
      const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
      return itemKey !== cartKey;
    }));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const itemKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
        return itemKey === cartKey ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

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
      totalAmount
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
