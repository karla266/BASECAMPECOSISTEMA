import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import PieSitio from "@/components/sitio/PieSitio";
import dia from "@/data/dia_cumbre.json";
import Link from "next/link";

export const metadata = {
  title: dia.seo.titulo,
  description: dia.seo.descripcion,
  alternates: { canonical: "https://www.basecamp420.com/experiencia-completa" },
  openGraph: {
    title: dia.seo.titulo,
    description: dia.seo.descripcion,
    url: "https://www.basecamp420.com/experiencia-completa",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const esquema = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: "Día Cumbre Basecamp 420",
  description: dia.subtitulo,
  url: "https://www.basecamp420.com/experiencia-completa",
  provider: { "@type": "LocalBusiness", name: "Basecamp 420", telephone: "+522727258748" },
  itinerary: dia.paradas.map((parada) => ({
    "@type": "TouristAttraction",
    name: `${parada.hora} ${parada.titulo}`,
    description: parada.texto,
  })),
};

export default function ExperienciaCompletaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-16 pt-20 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(esquema).replace(/</g, "\\u003c") }} />
      <NavegacionSitio />
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Paquete</p>
        <h1 className="mt-2 text-4xl font-black text-white">{dia.titulo}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{dia.subtitulo}</p>
        <ol className="mt-8 grid gap-3">
          {dia.paradas.map((parada) => (
            <li key={parada.hora} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm font-black text-emerald-300">{parada.hora} hrs</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{parada.titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{parada.texto}</p>
              {parada.href ? (
                <Link href={parada.href} className="mt-3 inline-flex min-h-12 items-center text-sm font-semibold text-emerald-300">
                  Abrir este tramo
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-10">
        <PieSitio />
      </div>
    </main>
  );
}
