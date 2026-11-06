import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto Basecamp 420",
  description: "Canales oficiales de contacto de Basecamp 420: teléfono y correo.",
  alternates: {
    canonical: "https://www.basecamp420.com/contacto",
  },
};

export default function ContactoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16 text-slate-100">
      <h1 className="text-4xl font-black">Contacto</h1>
      <p className="mt-6 text-slate-300">Canales oficiales de atención de Basecamp 420 en Orizaba, Veracruz.</p>
      <ul className="mt-8 space-y-3 text-slate-200">
        <li>
          Teléfono: <a className="text-emerald-300" href="tel:+522727258748">+52 272 725 8748</a>
        </li>
        <li>
          Correo: <a className="text-emerald-300" href="mailto:contacto@basecamp420.com">contacto@basecamp420.com</a>
        </li>
        <li>
          Atención comercial: consulta disponibilidad, horarios y cierres de compra dentro del sitio web con checkout oficial.
        </li>
      </ul>
    </main>
  );
}
