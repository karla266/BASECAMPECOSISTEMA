"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type DisponibilidadCarrito = "PREVENTA" | "EN_STOCK";

export type CartItem = {
  sku: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
  disponibilidad: DisponibilidadCarrito;
  mercadolibre_url?: string;
};

type CartContextValue = {
  items: CartItem[];
  abierto: boolean;
  totalItems: number;
  subtotal: number;
  hasPreorderItems: boolean;
  addItem: (item: Omit<CartItem, "cantidad"> & { cantidad?: number }, cantidad?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, cantidad: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CLAVE = "b420_shopping_cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(CLAVE);
      if (crudo) {
        const parsed = JSON.parse(crudo) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed.filter((fila) => fila && fila.sku));
      }
    } catch {
      setItems([]);
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    window.localStorage.setItem(CLAVE, JSON.stringify(items));
  }, [items, listo]);

  const addItem = useCallback((item: Omit<CartItem, "cantidad"> & { cantidad?: number }, cantidad?: number) => {
    const piezas = Math.max(1, Math.trunc(cantidad ?? item.cantidad ?? 1));
    setItems((actual) => {
      const indice = actual.findIndex((fila) => fila.sku === item.sku);
      if (indice === -1) {
        return [...actual, { ...item, cantidad: piezas, precio: Number(item.precio) || 0, imagen_url: item.imagen_url || "", disponibilidad: item.disponibilidad }];
      }
      return actual.map((fila, i) => (i === indice ? { ...fila, cantidad: fila.cantidad + piezas, precio: Number(item.precio) || fila.precio } : fila));
    });
    setAbierto(true);
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((actual) => actual.filter((fila) => fila.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, cantidad: number) => {
    const piezas = Math.trunc(cantidad);
    setItems((actual) => {
      if (piezas <= 0) return actual.filter((fila) => fila.sku !== sku);
      return actual.map((fila) => (fila.sku === sku ? { ...fila, cantidad: piezas } : fila));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setAbierto(true), []);
  const closeCart = useCallback(() => setAbierto(false), []);
  const toggleCart = useCallback(() => setAbierto((valor) => !valor), []);

  const totalItems = useMemo(() => items.reduce((suma, fila) => suma + fila.cantidad, 0), [items]);
  const subtotal = useMemo(() => items.reduce((suma, fila) => suma + fila.precio * fila.cantidad, 0), [items]);
  const hasPreorderItems = useMemo(() => items.some((fila) => fila.disponibilidad === "PREVENTA"), [items]);

  const valor = useMemo(
    () => ({ items, abierto, totalItems, subtotal, hasPreorderItems, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart }),
    [items, abierto, totalItems, subtotal, hasPreorderItems, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart]
  );

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const valor = useContext(CartContext);
  if (!valor) throw new Error("useCart debe usarse dentro de CartProvider.");
  return valor;
}
