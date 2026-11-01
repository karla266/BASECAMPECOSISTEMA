import Link from "next/link";

export default function BannerPalapa() {
  return (
    <aside className="mx-auto max-w-5xl px-5 pt-8">
      <Link href="/ordenar" className="flex min-h-12 items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-sm font-semibold leading-6 text-emerald-100">
        Ordena tus chelas y comida antes de subir para tenerlas listas al llegar o al aterrizar
      </Link>
    </aside>
  );
}
