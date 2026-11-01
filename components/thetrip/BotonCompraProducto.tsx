"use client";

import { useRouter } from "next/navigation";
import { useCart, type DisponibilidadCarrito } from "@/context/CartContext";
import { BADGE_PREVENTA, faseComercial, precioActivo, type ProductoCta } from "@/lib/ctaProducto";

type Props = ProductoCta & {
  nombre: string;
  sku: string;
  fase?: string | null;
  imagen_url?: string | null;
  className?: string;
};

export default function BotonCompraProducto({
  nombre,
  sku,
  fase,
  categoria,
  departamento,
  subcategoria,
  proveedor,
  descripcion,
  tags,
  precio,
  costo,
  imagen_url,
  cantidad = 1,
  className = "mt-5",
}: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const estado = faseComercial(fase) || "EN_STOCK";
  const disponibilidad: DisponibilidadCarrito = estado === "PREVENTA" ? "PREVENTA" : "EN_STOCK";
  const precioFinal = precioActivo({
    nombre,
    sku,
    categoria,
    departamento,
    subcategoria,
    proveedor,
    descripcion,
    tags,
    precio,
    costo,
    fase,
    disponibilidad: fase,
  });

  function agregar() {
    addItem(
      {
        sku,
        nombre,
        precio: precioFinal,
        imagen_url: imagen_url || "",
        disponibilidad,
      },
      cantidad
    );
  }

  function comprar() {
    agregar();
    router.push("/checkout");
  }

  return (
    <div className={`${className} space-y-2`}>
      {disponibilidad === "PREVENTA" ? (
        <p className="inline-flex min-h-12 items-center rounded-full bg-amber-500 px-4 text-xs font-bold leading-5 text-zinc-950">
          {BADGE_PREVENTA}
        </p>
      ) : null}
      <button
        type="button"
        onClick={agregar}
        className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-zinc-600 px-4 text-center text-sm font-bold text-white"
      >
        Agregar al Carrito
      </button>
      <button
        type="button"
        onClick={comprar}
        className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-amber-500 px-4 text-center text-sm font-bold text-zinc-950"
      >
        {disponibilidad === "PREVENTA" ? "Apartar Pre-venta" : "Comprar Ahora"}
      </button>
    </div>
  );
}
