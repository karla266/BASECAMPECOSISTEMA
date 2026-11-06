import SelectorVisitaParaiso from "@/components/experiencias/SelectorVisitaParaiso";
import BannerPalapa from "@/components/palapa/BannerPalapa";
import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import PieSitio from "@/components/sitio/PieSitio";
import { datosParaiso } from "@/lib/experiencias";

const datos = datosParaiso();
const mapa = `https://www.openstreetmap.org/export/embed.html?bbox=-97.13%2C18.83%2C-97.07%2C18.87&layer=mapnik&marker=${datos.punto.latitud}%2C${datos.punto.longitud}`;

export const metadata = {
  title: datos.seo.titulo,
  description: datos.seo.descripcion,
  keywords: ["El Paraíso", "ecoturismo", "Orizaba", "Fortín de las Flores", "Basecamp 420"],
  alternates: { canonical: "https://www.basecamp420.com/el-paraiso" },
  openGraph: {
    title: datos.seo.titulo,
    description: datos.seo.descripcion,
    url: "https://www.basecamp420.com/el-paraiso",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const esquema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TouristTrip",
      name: "El Paraíso — campo y vuelo",
      description: datos.hero.subtitulo,
      url: "https://www.basecamp420.com/el-paraiso",
      provider: {
        "@type": "LocalBusiness",
        name: "Basecamp 420",
        telephone: "+522727258748",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Oriente 27 y Norte 10",
          addressLocality: "Orizaba",
          addressRegion: "Veracruz",
          addressCountry: "MX",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: datos.faq.map((item) => ({
        "@type": "Question",
        name: item.pregunta,
        acceptedAnswer: { "@type": "Answer", text: item.respuesta },
      })),
    },
  ],
};

export default function ElParaisoPage() {
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
          <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-100">{datos.hero.subtitulo}</p>
        </div>
      </section>

      <BannerPalapa />
      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-8">
          <Bloque titulo="Amenidades" items={datos.amenidades} />
          <div>
            <h2 className="text-2xl font-semibold text-white">Cómo llegar</h2>
            <div className="mt-4 grid gap-3">
              {datos.acceso.map((item) => (
                <article key={item.desde} className="rounded-2xl border border-zinc-800 p-4">
                  <h3 className="font-semibold text-white">Desde {item.desde}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.texto}</p>
                </article>
              ))}
            </div>
          </div>
          <Bloque titulo="Actividades" items={datos.actividades} />
          <Bloque titulo="Equipo recomendado" items={datos.equipo} />
          <Bloque titulo="Políticas de reserva" items={datos.politicas} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Fecha de visita</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">El vuelo continúa en el tablero de reservas. El recorrido y la estancia se confirman por WhatsApp con la fecha elegida.</p>
          <div className="mt-4">
            <SelectorVisitaParaiso />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12">
        <h2 className="text-2xl font-semibold text-white">Preguntas frecuentes</h2>
        <div className="mt-4 grid gap-3">
          {datos.faq.map((item) => (
            <details key={item.pregunta} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4">
              <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-white">{item.pregunta}</summary>
              <p className="pb-4 text-sm leading-6 text-zinc-300">{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12">
        <h2 className="text-2xl font-semibold text-white">Mapa de salida</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{datos.punto.nombre}. {datos.punto.direccion}.</p>
        <iframe title="Mapa del punto de salida en Orizaba" src={mapa} className="mt-4 h-72 w-full rounded-2xl border border-zinc-800" loading="lazy" />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${datos.punto.latitud},${datos.punto.longitud}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-12 items-center rounded-xl border border-zinc-700 px-4 text-sm font-semibold"
        >
          Abrir indicaciones
        </a>
      </section>
      <PieSitio />
      <a href="/reservar" className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/25">
        Reservar visita
      </a>
    </main>
  );
}

function Bloque({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">{titulo}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-zinc-800 px-4 py-3 text-sm leading-6 text-zinc-300">{item}</li>
        ))}
      </ul>
    </div>
  );
}
