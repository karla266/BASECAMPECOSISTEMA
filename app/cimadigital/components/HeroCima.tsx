export default function HeroCima() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-slate-900" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
          AI Software Factory & Ecosistemas Digitales
        </p>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">
          Construimos máquinas de conversión y sistemas autónomos.
        </h1>
        <h2 className="mt-6 max-w-2xl text-base font-normal leading-relaxed text-slate-300 md:text-xl">
          Dejamos el software operando tu negocio por ti. Pasarelas de pago criptográficas, agentes IA y orquestación de datos a nivel industrial.
        </h2>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/cimadigital/orquestador"
            className="rounded-md bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
          >
            Conectar Ecosistema
          </a>
          <a
            href="/admin"
            className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Explorar Arquitectura
          </a>
        </div>
      </div>
    </section>
  );
}
