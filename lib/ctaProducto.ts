export const TIENDA_MERCADOLIBRE =
  process.env.NEXT_PUBLIC_ML_TIENDA_URL || "https://www.mercadolibre.com.mx/pagina/thetripsmokeshop";

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

function enlaceHttps(valor?: string | null): string {
  const texto = (valor || "").trim();
  return texto.startsWith("https://") ? texto : "";
}

export function urlCobroMercadoLibre(producto: ProductoCta): string {
  const directa = enlaceHttps(producto.mercadolibre_url);
  if (directa) return directa;
  const cobro = enlaceHttps(producto.link_cobro);
  if (cobro) return cobro;
  const sku = producto.sku || "";
  try {
    const url = new URL(TIENDA_MERCADOLIBRE);
    url.searchParams.set("sku", sku);
    if ((producto.cantidad || 1) > 1) url.searchParams.set("cantidad", String(producto.cantidad));
    return url.toString();
  } catch {
    return `https://www.mercadolibre.com.mx/pagina/thetripsmokeshop?sku=${encodeURIComponent(sku)}`;
  }
}

export const BADGE_PREVENTA = "⏳ PREVENTA • Precio Especial 2x (Sube a 3x al llegar a tienda)";
