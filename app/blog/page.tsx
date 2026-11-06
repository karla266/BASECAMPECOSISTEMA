import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog de Vuelos y Cursos | Basecamp 420',
  description:
    'Artículos de Basecamp 420 sobre vuelos en parapente, alianza con Salvador Lara y progresión técnica APPI.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  const posts = getAllPosts().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const actividadReciente = posts.slice(0, 3);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-neutral-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Basecamp 420</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Blog de Vuelos y Cursos
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-neutral-300 md:text-base">
              Contenido oficial sobre costos de vuelo, formación APPI, alianzas estratégicas y evolución técnica en parapente.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-semibold text-neutral-100 transition hover:border-cyan-400 hover:text-cyan-200"
          >
            Regresar a Basecamp 420
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {actividadReciente.map((post) => (
            <article
              key={`actividad-${post.slug}`}
              className="rounded-3xl border border-emerald-500/35 bg-emerald-500/10 p-6 shadow-[0_0_25px_rgba(16,185,129,0.12)]"
            >
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">
                Actividad reciente
              </p>
              <h2 className="mt-4 text-lg font-bold text-white">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-200">{post.summary}</p>
              <div className="mt-5 border-t border-emerald-500/20 pt-4 text-sm text-emerald-100/90">
                {new Date(post.publishedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <Link href={`/blog/${post.slug}`} className="mt-2 inline-flex text-sm font-semibold text-emerald-200 hover:text-white">
                Ver actualización →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-[0_0_35px_rgba(8,145,178,0.10)] transition hover:-translate-y-1 hover:border-cyan-500/60"
            >
              <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                {post.category}
              </p>
              <h2 className="mt-4 text-xl font-bold text-white">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-300">{post.summary}</p>
              <div className="mt-5 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
                {new Date(post.publishedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <p className="mt-2 text-sm font-semibold text-cyan-300 transition group-hover:text-cyan-100">
                Leer artículo →
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
