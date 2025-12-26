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
