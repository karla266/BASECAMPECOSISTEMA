import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de uso Basecamp 420",
  description: "Términos y condiciones generales de uso de los servicios y contenidos publicados por Basecamp 420.",
  alternates: {
    canonical: "https://www.basecamp420.com/terminos",
  },
};

export default function TerminosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16 text-slate-100">
      <h1 className="text-4xl font-black">Términos de uso</h1>
      <p className="mt-6 text-slate-300">
        El contenido de basecamp420.com se ofrece con fines informativos y comerciales para los servicios del ecosistema
        Basecamp 420.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-6 text-slate-300">
        <li>Las reservas y cotizaciones están sujetas a disponibilidad operativa y confirmación final.</li>
        <li>Los precios, horarios y condiciones pueden cambiar sin previo aviso.</li>
        <li>Los enlaces a terceros mantienen sus propios términos y políticas de uso.</li>
      </ul>
    </main>
  );
}
