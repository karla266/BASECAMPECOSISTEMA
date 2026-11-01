import { SchemaListaProductos } from "@/components/seo/SchemaProducto";
import catalogo from "@/data/catalogo_the_trip.json";

export const metadata = {
  title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
  description:
    "Cristalería Pyrex, blunts y vaporizadores en The Trip Smoke Shop, la tienda de Basecamp 420 en Orizaba. Consulta precio en MXN y disponibilidad.",
  alternates: { canonical: "https://www.basecamp420.com/tienda" },
  openGraph: {
    title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
    description: "Catálogo de The Trip en Basecamp 420: cristalería, blunts y vaporizadores con precio en MXN.",
    url: "https://www.basecamp420.com/tienda",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

function pesos(producto) {
  const precio = Number(producto.precio);
  if (!Number.isFinite(precio)) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(precio);
}

export default function TiendaPage() {
  const productos = Array.isArray(catalogo) ? catalogo : [];
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <SchemaListaProductos productos={productos} />
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">The Trip Smoke Shop</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Cristalería Pyrex, blunts y vaporizadores</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Catálogo publicado de Basecamp 420 en Orizaba. El mostrador completo sigue en la tienda en línea.
        </p>
        <a href="/thetrip" className="mt-6 inline-flex text-sm font-semibold text-emerald-400">
          Abrir el mostrador de The Trip
        </a>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {productos.map((producto) => (
            <article key={producto.sku} id={producto.sku} className="rounded-2xl border border-zinc-800 p-5">
              <p className="text-xs text-zinc-500">{producto.sku}</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{producto.nombre}</h2>
              <p className="mt-2 text-sm text-zinc-400">{producto.categoria}</p>
              <p className="mt-4 text-emerald-300">{pesos(producto)}</p>
              <p className="text-xs text-zinc-500">{Number(producto.stock) > 0 ? `${producto.stock} en existencia` : "Agotado"}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
