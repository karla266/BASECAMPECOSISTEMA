import SchemaParapente from "@/components/seo/SchemaParapente";
import BotonWhatsappVuelo from "@/components/vuelos/BotonWhatsappVuelo";

export const metadata = {
  title: "Vuelos en parapente Orizaba | Basecamp 420",
  description:
    "Vuelos en parapente tándem en Orizaba y Fortín. Salidas a las 10:00, 12:00, 14:00 y 16:00 con Salvador Lara. Desde $1,650 MXN.",
  alternates: { canonical: "https://www.basecamp420.com/parapente" },
  openGraph: {
    title: "Vuelos en parapente Orizaba | Basecamp 420",
    description: "Cuatro salidas al día desde Basecamp 420. Despegue en Cerro de las Antenas y aterrizaje en Coapichapa.",
    url: "https://www.basecamp420.com/parapente",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

export default function ParapentePage() {
  return (
    <main className="overflow-x-hidden bg-zinc-950 text-zinc-100">
      <SchemaParapente />
      <section className="relative h-screen max-h-[100dvh] w-full overflow-hidden">
        <img
          src="/parapente-hero.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Basecamp 420 · Orizaba</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold text-white sm:text-6xl">Vuelos en parapente</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-100 sm:text-base">
            Despegue en Cerro de las Antenas y aterrizaje en Coapichapa. Salvador Lara toma el primer lugar de cada horario.
          </p>
          <a href="/reservar" className="mt-6 inline-flex w-fit rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950">
            Elegir horario
          </a>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-xl font-semibold text-white">Horarios del día</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["10:00", "12:00", "14:00", "16:00"].map((slot) => (
            <li key={slot} className="rounded-2xl border border-zinc-800 px-3 py-4 text-center text-lg font-semibold">
              {slot}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-6 text-zinc-400">
          Cada piloto cubre un pasajero por horario. Si Salvador Lara ya tiene ese slot, la reserva pasa al siguiente piloto disponible del directorio.
        </p>
      </section>
      <BotonWhatsappVuelo />
    </main>
  );
}
