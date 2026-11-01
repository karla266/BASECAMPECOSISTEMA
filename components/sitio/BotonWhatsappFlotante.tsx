export default function BotonWhatsappFlotante({ href, etiqueta = "WhatsApp" }: { href: string; etiqueta?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex min-h-12 items-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg"
    >
      {etiqueta}
    </a>
  );
}
