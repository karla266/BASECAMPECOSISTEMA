import NavegacionSitio from "@/components/sitio/NavegacionSitio";
import PieSitio from "@/components/sitio/PieSitio";
import Link from "next/link";

export const metadata = {
  title: "Ecosistema Basecamp 420 | The Trip, Movimiento Canábico y Cima Digital",
  description:
    "Cuatro marcas de la misma empresa: Basecamp 420, The Trip Smoke Shop, Movimiento Canábico Orizaba y Cima Digital. Orizaba y Fortín de las Flores.",
  alternates: { canonical: "https://www.basecamp420.com/ecosistema" },
  openGraph: {
    title: "Ecosistema Basecamp 420",
    description: "Turismo, retail, comunidad y software bajo la misma empresa.",
    url: "https://www.basecamp420.com/ecosistema",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const PILARES = [
  {
    marca: "Basecamp 420",
    texto: "Hub de turismo, parapente y experiencias en las Altas Montañas. Incluye Restaurante Campestre Anturios y Palapa El Paraíso.",
    href: "/parapente",
  },
  {
    marca: "The Trip Smoke Shop",
    texto: "Retail especializado, cristalería y cultura lifestyle.",
    href: "/thetrip",
  },
  {
    marca: "Movimiento Canábico Orizaba",
    texto: "Comunidad, activismo y difusión de la cultura cannábica.",
    href: "/movimiento-canabico/podcasts",
  },
  {
    marca: "Cima Digital",
    texto: "Agencia matriz de inteligencia artificial, automatización y factoría de software corporativo.",
    href: "/cima-digital",
  },
];

export default function EcosistemaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-16 pt-20 text-zinc-100">
      <NavegacionSitio />
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Una empresa, cuatro marcas</p>
        <h1 className="mt-3 text-4xl font-black text-white">Ecosistema Basecamp 420</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
          Basecamp 420, The Trip Smoke Shop, Movimiento Canábico Orizaba y Cima Digital operan juntas desde Orizaba y Fortín de las Flores.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PILARES.map((pilar) => (
            <article key={pilar.marca} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="text-2xl font-semibold text-white">{pilar.marca}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{pilar.texto}</p>
              <Link href={pilar.href} className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-emerald-300">
                Entrar
              </Link>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-12">
        <PieSitio />
      </div>
    </main>
  );
}
