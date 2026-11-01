const WHATSAPP_VUELO =
  "https://wa.me/522727258748?text=Hola%20Basecamp%20420,%20deseo%20validar%20disponibilidad%20para%20vuelo%20en%20parapente.";

export default function BotonWhatsappVuelo() {
  return (
    <a
      href={WHATSAPP_VUELO}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex min-h-12 items-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg"
    >
      WhatsApp
    </a>
  );
}
