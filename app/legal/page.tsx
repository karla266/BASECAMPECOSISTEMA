import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Basecamp 420",
  description: "Información legal y lineamientos generales de operación digital de Basecamp 420.",
  alternates: {
    canonical: "https://www.basecamp420.com/legal",
  },
};

export default function LegalPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16 text-slate-100">
      <h1 className="text-4xl font-black">Información legal</h1>
      <p className="mt-6 text-slate-300">
        Este sitio publica información comercial, logística y de servicios de Basecamp 420. El uso del contenido
        debe respetar la legislación aplicable en México.
      </p>
      <p className="mt-4 text-slate-300">
        Para condiciones de uso y alcances de responsabilidad, consulta la sección de términos.
      </p>
      <div className="mt-8">
        <Link href="/terminos" className="rounded-md border border-slate-600 px-3 py-2 text-emerald-300">
          Ver términos
        </Link>
      </div>
    </main>
  );
}
