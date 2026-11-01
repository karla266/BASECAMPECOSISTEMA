const CARPETAS = ["otros productos", "otros smoke shop"];
const PROTEGIDAS = ["bong", "pipa", "cristaler", "sabana", "seda", "filtro", "cono", "outdoor", "montana", "camping", "blunt"];

export type FaseComercial = "PREVENTA" | "EN_STOCK";

export type ProductoCta = {
  sku?: string | null;
  nombre?: string | null;
  categoria?: string | null;
  departamento?: string | null;
  subcategoria?: string | null;
  proveedor?: string | null;
  descripcion?: string | null;
  tags?: string[] | string | null;
  mercadolibre_url?: string | null;
  link_cobro?: string | null;
  cantidad?: number;
  precio?: number | null;
  costo?: number | null;
  fase?: string | null;
  disponibilidad?: string | null;
};

export function normalizarCarpeta(valor?: string | null): string {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function esTiara(producto: ProductoCta): boolean {
  const sku = (producto.sku || "").trim().toUpperCase();
  if (sku.startsWith("TE-")) return true;
  const tags = Array.isArray(producto.tags) ? producto.tags.join(" ") : producto.tags || "";
  return [producto.nombre, producto.subcategoria, producto.proveedor, tags].some((campo) => normalizarCarpeta(campo).includes("tiara"));
}

function carpetaProtegida(valor?: string | null): boolean {
  const texto = normalizarCarpeta(valor);
  if (!texto || CARPETAS.includes(texto)) return false;
  return PROTEGIDAS.some((token) => texto.includes(token));
}

export function admiteReglaPrecio(producto: ProductoCta): boolean {
  if (esTiara(producto)) return false;
  if (carpetaProtegida(producto.categoria) || carpetaProtegida(producto.departamento)) return false;
  return [producto.categoria, producto.departamento].some((campo) => CARPETAS.includes(normalizarCarpeta(campo)));
}

export function faseComercial(valor?: string | null): FaseComercial | null {
  const compacto = normalizarCarpeta(valor).replace(/[^a-z]/g, "");
  if (compacto === "preventa") return "PREVENTA";
  if (compacto === "llegando" || compacto === "stockfisico" || compacto === "enstock") return "EN_STOCK";
  return null;
}

function dinero(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function precioActivo(producto: ProductoCta): number {
  const lista = Number(producto.precio);
  const costo = Number(producto.costo);
  const fase = faseComercial(producto.fase || producto.disponibilidad);
  if (admiteReglaPrecio(producto) && Number.isFinite(costo) && costo > 0) {
    if (fase === "PREVENTA") return dinero(costo * 2);
    if (fase === "EN_STOCK") return dinero(costo * 3);
  }
  return Number.isFinite(lista) && lista > 0 ? dinero(lista) : 0;
}

export const BADGE_PREVENTA = "⏳ PREVENTA • Aparta con precio especial (Envío diferido al arribar)";
