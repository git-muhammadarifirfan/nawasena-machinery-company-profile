import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../lib/types";

type CartCtx = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartCtx | null>(null);

const LS_KEY = "nawasena_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function add(product: Product, qty = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { product, qty }];
    });
  }

  function remove(productId: string) {
    setItems((prev) => prev.filter((x) => x.product.id !== productId));
  }

  function setQty(productId: string, qty: number) {
    setItems((prev) =>
      prev
        .map((x) => (x.product.id === productId ? { ...x, qty: Math.max(1, Math.min(999, qty)) } : x))
        .filter((x) => x.qty > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const { count, subtotal } = useMemo(() => {
    const c = items.reduce((a, b) => a + b.qty, 0);
    const s = items.reduce((a, b) => a + b.qty * (Number(b.product.price) || 0), 0);
    return { count: c, subtotal: s };
  }, [items]);

  const value: CartCtx = { items, add, remove, setQty, clear, count, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
