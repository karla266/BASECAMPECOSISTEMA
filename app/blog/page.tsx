import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Recursos Comunitarios | Basecamp 420 & Movimiento Canábico Orizaba',
  description:
    'Recursos, guías legales y publicaciones sobre amparo canábico, derechos, ciudadanía y comunidad en Orizaba y México.',
};

const posts = [
  {
    title: 'Manual Completo: Cómo Tramitar tu Amparo Canábico en México (Presencial y en Línea)',
    summary:
      'Guía práctica para entender el fundamento legal, preparar trámite presencial, completar DIGIPRIS y actuar si necesitas un amparo indirecto.',
    href: '/blog/amparo-canabico',
    category: 'Amparo canábico',
    date: '28 de octubre de 2026',
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">Basecamp 420</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Blog &amp; Recursos Comunitarios
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Basecamp 420 &amp; Movimiento Canábico Orizaba — información útil, herramientas legales y recursos para la comunidad.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            Regresar a Basecamp 420
          </Link>
        </header>

        <section className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
          <Link href={posts[0].href} className="group block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.12)] transition hover:-translate-y-1 hover:border-emerald-500/60">
            <div className="bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 p-7 md:p-8">
              <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                {posts[0].category}
              </div>
              <h2 className="text-2xl font-bold text-white md:text-4xl">{posts[0].title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{posts[0].summary}</p>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800 pt-4">
                <span className="text-sm text-slate-400">{posts[0].date}</span>
                <span className="text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">Leer artículo →</span>
              </div>
            </div>
          </Link>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Recursos</p>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              <li className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <strong className="block text-white">Guía legal</strong>
                Fundamentos constitucionales y jurisprudenciales para el amparo canábico.
              </li>
              <li className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <strong className="block text-white">Trámite</strong>
                Procedimientos presenciales y digitales, desde la solicitud hasta la respuesta.
              </li>
              <li className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <strong className="block text-white">Community</strong>
                Información, apoyo y acompañamiento en la región de Orizaba y Veracruz.
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
