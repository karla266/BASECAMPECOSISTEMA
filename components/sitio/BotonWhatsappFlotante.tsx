export default function BotonWhatsappFlotante({ href, etiqueta = "Ir al checkout" }: { href: string; etiqueta?: string }) {
  const destino = href.startsWith("/") ? href : "/checkout";

  return (
    <a
      href={destino}
      className="fixed bottom-6 right-6 z-50 inline-flex min-h-12 items-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg"
    >
      {etiqueta}
    </a>
  );
}
