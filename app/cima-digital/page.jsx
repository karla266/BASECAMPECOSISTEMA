import SchemaCimaDigital from "@/components/seo/SchemaCimaDigital";

export const metadata = {
  title: "Cima Digital | Inteligencia Artificial y Tecnología Empresarial Llave en Mano",
  description:
    "Delega la tecnología de tu empresa. Cima Digital diseña agentes de IA, automatiza procesos y entrega software llave en mano para que tú te ocupes del trabajo.",
  alternates: { canonical: "https://www.basecamp420.com/cima-digital" },
  openGraph: {
    title: "Cima Digital | Inteligencia Artificial y Tecnología Empresarial Llave en Mano",
    description:
      "Tú preocúpate por tu trabajo, nosotros hacemos el resto. IA empresarial, automatización e integración de sistemas.",
    url: "https://www.basecamp420.com/cima-digital",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

const DOLORES = [
  { de: "Tareas repetitivas", a: "Agentes de IA 24/7" },
  { de: "Sistemas desconectados", a: "Integración invisible" },
  { de: "Soporte costoso", a: "Departamento tecnológico externo llave en mano" },
];

const CASOS = [
  {
    titulo: "WhatsApp con cobro",
    texto: "Bots omnicanal que atienden, cotizan y cobran en automático sin dejar la conversación.",
  },
  {
    titulo: "Reportes ejecutivos",
    texto: "Cierres del día convertidos en PDF listos para dirección, sin armar hojas a mano.",
  },
  {
    titulo: "Mostrador sin red",
    texto: "Terminales offline resilientes que siguen vendiendo cuando se cae el enlace.",
  },
];

export default function CimaDigitalPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <SchemaCimaDigital />
      <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">Cima Digital · Basecamp 420</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
          Tú preocúpate por tu trabajo, nosotros hacemos el resto
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          Inteligencia artificial, automatización y software a la medida para empresas que quieren delegar la operación tecnológica.
        </p>
        <a
          href="https://wa.me/522727258748?text=Hola,%20quiero%20conocer%20las%20soluciones%20de%20Cima%20Digital"
          className="mt-8 inline-flex w-fit rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950"
        >
          Hablar por WhatsApp
        </a>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-16 md:grid-cols-3">
        {DOLORES.map((dolor) => (
          <article key={dolor.de} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">{dolor.de}</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{dolor.a}</h2>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-2xl font-semibold text-white">Automatización que ya opera</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {CASOS.map((caso) => (
            <article key={caso.titulo} className="rounded-2xl border border-zinc-800 p-5">
              <h3 className="text-lg font-semibold text-cyan-300">{caso.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{caso.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
