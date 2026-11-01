import Link from "next/link";

const ENLACES = [
  { href: "/experiencia-completa", label: "Día Cumbre" },
  { href: "/ecosistema", label: "Ecosistema" },
  { href: "/anturios", label: "Restaurante Campestre Anturios" },
  { href: "/el-paraiso", label: "Palapa El Paraíso" },
  { href: "/aliados", label: "Aliados" },
  { href: "/parapente", label: "Vuelos" },
  { href: "/reservar", label: "Reservar" },
  { href: "/ordenar", label: "Ordenar" },
  { href: "/thetrip", label: "The Trip" },
  { href: "/convenio", label: "Convenio" },
];

export default function PieSitio() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-10 text-center text-sm text-zinc-500">
      <p>© 2026 Basecamp 420. Oriente 27 y Norte 10, Orizaba, Veracruz.</p>
      <p className="mt-2">
        <a href="tel:+522727258748" className="text-zinc-300">272 725 8748</a>
      </p>
      <nav aria-label="Pie de página" className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-3">
        {ENLACES.map((enlace) => (
          <Link key={enlace.href} href={enlace.href} className="inline-flex min-h-12 items-center px-2 font-semibold text-emerald-300">
            {enlace.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
