import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarProductoPorSku, leerInventarioTheTrip } from "@/lib/inventarioThetrip";
import BotonCompraProducto from "@/components/thetrip/BotonCompraProducto";

const BASE = "https://www.basecamp420.com";
const FALLBACK = "/assets/productos/watermarked_img_4565543973787279676.jpg";

type Params = { sku: string };

export function generateStaticParams() {
  return leerInventarioTheTrip().productos.filter((producto) => producto.sku).map((producto) => ({
    sku: producto.sku.toLowerCase(),
  }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const producto = buscarProductoPorSku(params.sku);
  if (!producto) return { title: "Producto | The Trip Smoke Shop" };
  const canonica = `${BASE}/thetrip/producto/${producto.sku.toLowerCase()}`;
  return {
    title: `${producto.nombre} | The Trip Smoke Shop`,
    description: producto.descripcion || `${producto.nombre} en The Trip Smoke Shop, Orizaba.`,
    alternates: { canonical: canonica },
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion,
      url: canonica,
      siteName: "Basecamp 420",
      locale: "es_MX",
      type: "website",
    },
  };
}

function aviso(fecha: string | undefined) {
  if (fecha === "1 de Diciembre") return "🔥 Llega el 1 de Diciembre";
  if (fecha === "Jueves") return "🔥 Llega el Jueves";
  return fecha ? `Llega ${fecha}` : null;
}

export default function PaginaProducto({ params }: { params: Params }) {
  const producto = buscarProductoPorSku(params.sku);
  if (!producto) notFound();
  const etiqueta = aviso(producto.fecha_llegada);
  const precio = Number(producto.precio_mxn || 0);
  const foto = producto.imagenes?.[0] || producto.imagen_url || FALLBACK;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <article className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
        <img src={foto} alt={producto.nombre} className="h-80 w-full rounded-2xl object-cover" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">The Trip Smoke Shop · 18+</p>
          <h1 className="mt-3 text-3xl font-black text-white">{producto.nombre}</h1>
          {etiqueta ? (
            <p className="mt-4 inline-flex min-h-12 items-center rounded-full bg-amber-500 px-4 text-sm font-bold text-zinc-950">
              {etiqueta}
            </p>
          ) : null}
          <p className="mt-4 text-2xl font-black text-amber-300">${precio.toFixed(2)} MXN</p>
          <p className="mt-2 text-sm text-zinc-400">
            {producto.categoria || "Catálogo"} · {producto.disponibilidad || "Consulta disponibilidad"} · {producto.stock_disponible ?? 0} disponibles
          </p>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{producto.descripcion}</p>
          <BotonCompraProducto
            nombre={producto.nombre}
            sku={producto.sku}
            fase={producto.fase_comercial || producto.disponibilidad}
            categoria={producto.categoria}
            departamento={producto.departamento}
            subcategoria={producto.subcategoria}
            precio={precio}
            imagen_url={foto}
            className="mt-6"
          />
          <a href="/thetrip" className="mt-3 inline-flex min-h-12 items-center text-sm font-semibold text-amber-300">
            Volver al catálogo
          </a>
        </div>
      </article>
    </main>
  );
}
