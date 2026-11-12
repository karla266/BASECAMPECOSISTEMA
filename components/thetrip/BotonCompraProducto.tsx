'use client';

import React, { useState } from 'react';
import { useCart, type DisponibilidadCarrito } from '@/context/CartContext';

interface BotonCompraProps {
  producto?: {
    sku: string;
    title?: string;
    nombre?: string;
    unitPrice?: number;
    precio?: number;
    estado?: string;
    fase?: string;
    categoria?: string;
    departamento?: string;
    subcategoria?: string;
  };
  sku?: string;
  title?: string;
  nombre?: string;
  unitPrice?: number;
  precio?: number;
  estado?: string;
  fase?: string;
  stockDisponible?: number;
  [key: string]: any; // Permite recibir cualquier prop adicional de los catálogos sin error de tipos
}

export default function BotonCompraProducto(props: BotonCompraProps) {
  const { addItem, abrirCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  // Unificar las props ya vengan en el objeto producto o planas
  const pSku = props.producto?.sku || props.sku || "SKU-GENERICO";
  const pTitle = props.producto?.title || props.producto?.nombre || props.title || props.nombre || "Producto Basecamp 420";
  const pPrice = props.producto?.unitPrice || props.producto?.precio || props.unitPrice || props.precio || 0;
  const pFase = props.producto?.fase || props.fase || props.producto?.estado || props.estado || "EN_STOCK";
  const stockDisponible = props.stockDisponible ?? 10;

  const disponibilidad: DisponibilidadCarrito = (pFase === "PREVENTA" || pFase === "sobre_pedido") ? "PREVENTA" : (stockDisponible > 0 ? "EN_STOCK" : "AGOTADO");

  function agregar() {
    setAgregando(true);
    addItem({
      id: pSku || String(Date.now()),
      sku: pSku,
      title: pTitle,
      unitPrice: pPrice,
      quantity: cantidad,
      type: "product"
    });
    abrirCart();
    setTimeout(() => setAgregando(false), 600);
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3">
        <label htmlFor="cantidad-input" className="text-xs text-neutral-400 font-medium">Cantidad:</label>
        <input
          id="cantidad-input"
          type="number"
          min="1"
          max={stockDisponible}
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-center text-sm font-bold focus:outline-none focus:border-emerald-500"
        />
        <span className="text-xs text-neutral-500">Disponibilidad: {disponibilidad}</span>
      </div>

      <button
        type="button"
        onClick={agregar}
        disabled={disponibilidad === "AGOTADO"}
        className={`w-full py-3 px-6 rounded-xl font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
          disponibilidad === "AGOTADO"
            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            : agregando
            ? "bg-emerald-600 text-neutral-950 scale-95"
            : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20"
        }`}
      >
        {disponibilidad === "AGOTADO" ? "Agotado temporalmente" : agregando ? "¡Agregado al Carrito!" : "Agregar al Carrito • Comprar"}
      </button>
    </div>
  );
}