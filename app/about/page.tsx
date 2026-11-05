import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de Basecamp 420",
  description: "Conoce la historia, misión y servicios principales de Basecamp 420 en Orizaba, Veracruz.",
  alternates: {
    canonical: "https://www.basecamp420.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16 text-slate-100">
      <h1 className="text-4xl font-black">Acerca de Basecamp 420</h1>
      <p className="mt-6 text-slate-300">
        Basecamp 420 integra aventura, operación local y servicios digitales desde Orizaba, Veracruz.
        Nuestro ecosistema conecta vuelos tándem, cursos, renta de equipo y comercio especializado.
      </p>
      <p className="mt-4 text-slate-300">
        Operamos con atención directa en mostrador y canales digitales para reservas, cotizaciones y seguimiento.
      </p>
      <nav className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/contacto" className="rounded-md border border-slate-600 px-3 py-2 text-emerald-300">
          Contacto
        </Link>
        <Link href="/legal" className="rounded-md border border-slate-600 px-3 py-2 text-emerald-300">
          Legal
        </Link>
      </nav>
    </main>
  );
}
