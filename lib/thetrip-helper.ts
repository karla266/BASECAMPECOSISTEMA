export type TripCategory = "BLUNT_WRAP" | "BONGS_PYREX" | "CONOS" | "OUTDOOR" | "ACCESORIOS";

export type TripPhase = "PREVENTA_2X" | "STOCK_3X";

export type TripProduct = {
  sku: string;
  nombre: string;
  categoria: TripCategory;
  marca?: string;
  descripcion?: string;
  imagenUrl: string;
  costoBase: string;
  precio1: string;
  stock: number;
  fase: TripPhase;
};

const DEFAULT_IMAGE = "/uploads/productos/default-product.webp";

function normalizar(valor: unknown): string {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sanitizarSegmento(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^\.+/, "");
}

export function resolverRutaImagen(sku: string, imagenUrl?: string): string {
  const limpia = String(imagenUrl || "").trim();
  if (/^https?:\/\//i.test(limpia)) return limpia;
  if (limpia.startsWith("/uploads/")) return limpia;
  if (limpia.startsWith("uploads/")) return `/${limpia}`;
  if (limpia.startsWith("/assets/")) return limpia.replace("/assets/", "/uploads/");
  const skuSafe = sanitizarSegmento(String(sku || "").toLowerCase());
  return skuSafe ? `/uploads/productos/${skuSafe}.webp` : DEFAULT_IMAGE;
}

export function esProductoPermitido(producto: {
  sku?: string;
  nombre?: string;
  marca?: string;
  descripcion?: string;
  categoria?: string;
}): boolean {
  const sku = normalizar(producto.sku);
  const nombre = normalizar(producto.nombre);
  const marca = normalizar(producto.marca);
  const descripcion = normalizar(producto.descripcion);
  const categoria = normalizar(producto.categoria);
  const combinado = `${sku} ${nombre} ${marca} ${descripcion} ${categoria}`;
  return !combinado.includes("tiara");
}
