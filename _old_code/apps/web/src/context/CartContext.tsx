"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { IProduct } from "@agri-scan/shared";

// ============================================================
// TYPES
// ============================================================
export interface ICartItem extends IProduct {
  quantity: number;
}

interface ICartContext {
  cartItems: ICartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: IProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// ============================================================
// CONTEXT
// ============================================================
const CartContext = createContext<ICartContext | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const addToCart = useCallback((product: IProduct, quantity = 1) => {
    setCartItems((prev) => {
      // Nếu giỏ đang có hàng và seller khác nhau → báo lỗi, không thêm
      if (prev.length > 0) {
        const currentSellerId = prev[0].sellerId?._id ?? prev[0].sellerId;
        const newSellerId = product.sellerId?._id ?? product.sellerId;
        if (currentSellerId !== newSellerId) {
          alert(
            "Giỏ hàng chỉ có thể chứa sản phẩm từ 1 gian hàng. Vui lòng đặt hàng riêng.",
          );
          return prev; // Không thêm
        }
      }
      // Logic thêm bình thường...
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
            : i,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i._id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i._id === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================
export function useCart(): ICartContext {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong <CartProvider>");
  return ctx;
}
