import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto Basecamp 420",
  description: "Canales oficiales de contacto de Basecamp 420: teléfono, correo y WhatsApp.",
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
          WhatsApp:{" "}
          <a
            className="text-emerald-300"
            href="https://wa.me/522727258748?text=Hola%20Basecamp%20420,%20deseo%20m%C3%A1s%20informaci%C3%B3n"
            target="_blank"
            rel="noreferrer"
          >
            https://wa.me/522727258748
          </a>
        </li>
      </ul>
    </main>
  );
}
