import { BADGE_PREVENTA, admiteReglaPrecio, faseComercial, urlCobroMercadoLibre, type ProductoCta } from "@/lib/ctaProducto";

type Props = ProductoCta & {
  nombre: string;
  sku: string;
  fase?: string | null;
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
  mercadolibre_url,
  link_cobro,
  cantidad = 1,
  className = "mt-5",
}: Props) {
  const ficha = { nombre, sku, categoria, departamento, subcategoria, proveedor, descripcion, tags, mercadolibre_url, link_cobro, cantidad };
  const estado = faseComercial(fase);
  if (estado === "PREVENTA") {
    const href = urlCobroMercadoLibre(ficha);
    return (
      <div className={className}>
        {admiteReglaPrecio(ficha) ? (
          <p className="mb-3 inline-flex min-h-12 items-center rounded-full bg-amber-500 px-4 text-xs font-bold leading-5 text-zinc-950">
            {BADGE_PREVENTA}
          </p>
        ) : null}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          data-cta="mercadolibre"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#ffe600] px-4 text-center text-sm font-bold text-zinc-950"
        >
          🛒 Apartar en Pre-venta con Mercado Libre
        </a>
        <span className="sr-only">{nombre}</span>
      </div>
    );
  }

  if (estado === "EN_STOCK") {
    return (
      <a
        href="/thetrip#checkout"
        data-cta="retiro"
        className={`${className} flex min-h-12 w-full items-center justify-center rounded-2xl bg-amber-500 px-4 text-center text-sm font-bold text-zinc-950`}
      >
        Comprar / Retiro en tienda
      </a>
    );
  }

  return null;
}
