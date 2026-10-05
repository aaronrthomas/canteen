'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem, FoodItem } from './types';

// Auth Store
interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('canteen_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('canteen_token');
        localStorage.removeItem('canteen_user');
        set({ user: null, token: null });
      },
    }),
    { name: 'canteen_auth' }
  )
);

// Cart Store
interface CartStore {
  items: CartItem[];
  addItem: (food: FoodItem, quantity?: number) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (food, quantity = 1) => {
        const items = get().items;
        const existing = items.find(i => i.food.id === food.id);
        if (existing) {
          set({ items: items.map(i => i.food.id === food.id ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { food, quantity }] });
        }
      },
      removeItem: (foodId) => set({ items: get().items.filter(i => i.food.id !== foodId) }),
      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.food.id !== foodId) });
        } else {
          set({ items: get().items.map(i => i.food.id === foodId ? { ...i, quantity } : i) });
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.food.price * i.quantity, 0),
    }),
    { name: 'canteen_cart' }
  )
);
