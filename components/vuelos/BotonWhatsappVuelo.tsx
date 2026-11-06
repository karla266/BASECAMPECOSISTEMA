import Link from "next/link";

export default function BotonWhatsappVuelo() {
  return (
    <Link
      href="/reservar"
      className="fixed bottom-6 right-6 z-50 inline-flex min-h-12 items-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-emerald-400"
    >
      Reservar ahora
    </Link>
  );
}
