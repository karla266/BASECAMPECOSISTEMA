import BannerPalapa from "@/components/palapa/BannerPalapa";
import BotonWhatsappFlotante from "@/components/sitio/BotonWhatsappFlotante";
import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import PieSitio from "@/components/sitio/PieSitio";
import { datosAnturios, enlaceWhatsapp, etiquetaPrecio } from "@/lib/experiencias";
import Link from "next/link";

const datos = datosAnturios();
const whatsapp = enlaceWhatsapp(datos.mensajeWhatsapp);
const mesa = enlaceWhatsapp(datos.mensajeMesa);

export const metadata = {
  title: datos.seo.titulo,
  description: datos.seo.descripcion,
  keywords: ["Restaurante Anturios", "desayuno", "Fortín de las Flores", "Orizaba", "parapente", "Basecamp 420"],
  alternates: { canonical: "https://www.basecamp420.com/anturios" },
  openGraph: {
    title: datos.seo.titulo,
    description: datos.seo.descripcion,
    url: "https://www.basecamp420.com/anturios",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const esquema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Restaurant",
      name: "Restaurante Campestre Anturios",
      description: datos.hero.subtitulo,
      url: "https://www.basecamp420.com/anturios",
      servesCuisine: "Mexicana",
      telephone: "+522727258748",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fortín de las Flores",
        addressRegion: "Veracruz",
        addressCountry: "MX",
      },
      areaServed: ["Orizaba", "Fortín de las Flores"],
      hasMenu: {
        "@type": "Menu",
        hasMenuSection: {
          "@type": "MenuSection",
          name: "Desayuno montañero",
          hasMenuItem: datos.menu.map((plato) => ({
            "@type": "MenuItem",
            name: plato.nombre,
            description: plato.descripcion,
          })),
        },
      },
    },
  ],
};

export default function AnturiosPage() {
  return (
    <main className="overflow-x-hidden bg-zinc-950 pb-28 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(esquema).replace(/</g, "\\u003c") }} />
      <NavegacionSitio />
      <section className="relative h-screen max-h-[100dvh] w-full overflow-hidden">
        <img src={datos.hero.imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">{datos.hero.kicker}</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold text-white sm:text-6xl">{datos.hero.titulo}</h1>
          <p className="mt-3 text-lg font-semibold text-emerald-100">El Punto de Encuentro y Desayuno Montañero</p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-100 sm:text-base">{datos.hero.subtitulo}</p>
          <div className="mt-6 grid gap-3 sm:max-w-md">
            <a href={whatsapp} className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950">
              Ordenar desayuno previo
            </a>
            <a href={mesa} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white">
              Reservar mesa para grupos
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12">
        <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-50">{datos.checkin}</p>
        <h2 className="mt-10 text-2xl font-semibold text-white">Menú matutino</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {datos.menu.map((plato) => (
            <article key={plato.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-xl font-semibold text-white">{plato.nombre}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{plato.descripcion}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{plato.detalle}</p>
              <p className="mt-4 text-sm font-semibold text-emerald-300">{etiquetaPrecio(plato.precioCentavos)}</p>
            </article>
          ))}
        </div>
        <Link href="/experiencia-completa" className="mt-8 inline-flex min-h-12 items-center text-sm font-semibold text-emerald-300">
          Ver el Día Cumbre completo
        </Link>
      </section>
      <BannerPalapa />
      <PieSitio />
      <BotonWhatsappFlotante href={whatsapp} etiqueta="Desayuno por WhatsApp" />
    </main>
  );
}
