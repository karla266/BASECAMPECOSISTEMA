"use client";

import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export default function ProveedorCarrito({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
