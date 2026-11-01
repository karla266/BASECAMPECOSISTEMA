"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/ecosistema", label: "Ecosistema" },
  { href: "/experiencia-completa", label: "Día Cumbre" },
  { href: "/anturios", label: "Restaurante Campestre Anturios" },
  { href: "/el-paraiso", label: "Palapa El Paraíso" },
  { href: "/aliados", label: "Aliados" },
  { href: "/parapente", label: "Vuelos" },
  { href: "/reservar", label: "Reservar" },
  { href: "/ordenar", label: "Ordenar" },
  { href: "/explore", label: "Cursos" },
  { href: "/thetrip", label: "The Trip" },
  { href: "/blog", label: "Blog" },
  { href: "/renta", label: "Renta" },
  { href: "/#contacto", label: "Local" },
];

export default function NavegacionSitio() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-white">
          Basecamp 420
        </Link>
        <nav className="hidden items-center gap-4 lg:flex" aria-label="Secciones">
          {ENLACES.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="text-sm font-semibold text-zinc-300">
              {enlace.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-sitio"
          onClick={() => setAbierto((valor) => !valor)}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-white lg:hidden"
        >
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </div>
      {abierto ? (
        <nav id="menu-sitio" aria-label="Menú móvil" className="grid gap-2 border-t border-white/10 px-4 py-4 lg:hidden">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="flex min-h-12 items-center rounded-xl border border-zinc-800 px-4 text-base font-semibold text-white"
            >
              {enlace.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
