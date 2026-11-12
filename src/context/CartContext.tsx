'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackConversionEvent } from '@/lib/analytics';

export type CartItemType = 'product' | 'flight' | 'food' | 'course' | 'rental';

export interface CartItem {
  id: string;
  sku: string;
  title: string;
  unitPrice: number;
  quantity: number;
  type: CartItemType;
  metadata?: {
    flightDate?: string;
    flightSlot?: '10:00' | '12:00' | '14:00' | '16:00';
    passengerName?: string;
    passengerWeightKg?: number;
    assignedPilot?: string;
    includesCertificate?: boolean;
    weatherPolicyAccepted?: boolean;
    deliveryDate?: string;
    deliveryTime?: string;
    deliveryPoint?: string;
    rentalDays?: number;
    securityDeposit?: number;
    serialCode?: string;
    notes?: string;
  };
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'basecamp420_unified_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignorar errores de lectura en localStorage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar errores de escritura en localStorage
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    trackConversionEvent('add_to_cart', {
      sku: newItem.sku,
      type: newItem.type,
      unitPrice: newItem.unitPrice,
      quantity: newItem.quantity,
    });
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        updated[existingIndex].metadata = {
          ...updated[existingIndex].metadata,
          ...newItem.metadata,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, totalAmount, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
}
