import FormularioAliados from "@/components/aliados/FormularioAliados";
import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import PieSitio from "@/components/sitio/PieSitio";
import aliados from "@/data/aliados.json";

export const metadata = {
  title: aliados.seo.titulo,
  description: aliados.seo.descripcion,
  alternates: { canonical: "https://www.basecamp420.com/aliados" },
  openGraph: {
    title: aliados.seo.titulo,
    description: aliados.seo.descripcion,
    url: "https://www.basecamp420.com/aliados",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const esquema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  name: "30 días en la red comercial Basecamp 420",
  description: aliados.requisito,
  url: "https://www.basecamp420.com/aliados",
  price: "0.00",
  priceCurrency: "MXN",
  availability: "https://schema.org/InStock",
  seller: { "@type": "LocalBusiness", name: "Basecamp 420", telephone: "+522727258748" },
  areaServed: ["Orizaba", "Fortín de las Flores"],
};

export default function AliadosPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-28 pt-20 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(esquema).replace(/</g, "\\u003c") }} />
      <NavegacionSitio />
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Red de comercios</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">{aliados.titulo}</h1>
        <p className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-50">{aliados.requisito}</p>
        <ol className="mt-8 grid gap-4">
          {aliados.pasos.map((paso) => (
            <li key={paso.numero} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm font-black text-emerald-300">Paso {paso.numero}</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{paso.titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{paso.texto}</p>
            </li>
          ))}
        </ol>
        <FormularioAliados />
      </div>
      <div className="mt-12">
        <PieSitio />
      </div>
    </main>
  );
}
