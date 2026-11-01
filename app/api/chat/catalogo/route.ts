import { NextResponse } from "next/server";
import { esTiara, faseComercial, precioActivo } from "@/lib/ctaProducto";
import { leerInventarioTheTrip } from "@/lib/inventarioThetrip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const productos = leerInventarioTheTrip()
    .productos.filter((producto) => producto.sku && producto.nombre && !esTiara(producto))
    .slice(0, 48)
    .map((producto) => {
      const fase = producto.fase_comercial || producto.disponibilidad;
      return {
        sku: producto.sku,
        nombre: producto.nombre,
        precio: precioActivo({
          sku: producto.sku,
          nombre: producto.nombre,
          categoria: producto.categoria,
          departamento: producto.departamento,
          subcategoria: producto.subcategoria,
          precio: producto.precio_mxn,
          fase,
          disponibilidad: fase,
        }),
        imagen_url: producto.imagenes?.[0] || producto.imagen_url || "",
        disponibilidad: faseComercial(fase) || "EN_STOCK",
      };
    });
  return NextResponse.json({ productos });
}
