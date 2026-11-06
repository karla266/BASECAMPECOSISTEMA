const NAV = [
  { href: "#software-factory", label: "Software Factory" },
  { href: "#omnicanalidad", label: "Omnicanalidad & IA" },
  { href: "#inteligencia-sat", label: "Inteligencia SAT" },
  { href: "#ingenieria-multimedia", label: "Ingeniería Multimedia" },
] as const;

const AUDITORIA = "/contacto";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 z-50 flex w-full items-center justify-between bg-transparent px-8 py-6 text-white">
      <a href="/cimadigital" className="text-sm font-extrabold tracking-[0.22em] text-white">
        CIMA DIGITAL
      </a>
      <nav aria-label="Secciones de Cima Digital" className="hidden items-center gap-8 lg:flex">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-white/80 transition-colors hover:text-cyan-300"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <a
        href={AUDITORIA}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-cyan-300/70 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.28)] transition-colors hover:bg-cyan-400/10 md:text-sm"
      >
        Agendar Auditoría Técnica
      </a>
    </header>
  );
}
