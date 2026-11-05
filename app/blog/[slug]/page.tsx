import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado | Basecamp 420",
      description: "El artículo solicitado no existe en el blog de Basecamp 420.",
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-neutral-100 md:py-16">
      <article className="mx-auto max-w-5xl">
        <header className="mb-10 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">{post.category}</p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">{post.title}</h1>
          <p className="mt-4 max-w-3xl text-neutral-300">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-neutral-400">
            <span>Autor: {post.author}</span>
            <span>
              Publicado:{" "}
              {new Date(post.publishedAt).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        <section className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/50 p-7">
          <h2 className="text-xl font-bold text-white">Puntos clave</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-300">
            {post.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-7">
            <div className="space-y-5 text-neutral-200">
              {post.content.map((paragraph) => (
                <p key={paragraph} className="leading-8">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Conversión</p>
              <h3 className="mt-3 text-lg font-bold text-white">Reserva tu vuelo tándem</h3>
              <p className="mt-2 text-sm text-neutral-200">
                Agenda en línea y asegura tu lugar con Checkout Pro.
              </p>
              <Link
                href="/calendario"
                className="mt-4 inline-flex w-full justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Ir a Calendario
              </Link>
            </div>

            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Cursos APPI</p>
              <h3 className="mt-3 text-lg font-bold text-white">Conoce la ruta formativa</h3>
              <p className="mt-2 text-sm text-neutral-200">
                Revisa fechas, modalidades de pago y estructura de entrenamiento.
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-flex w-full justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                Explorar Vuelos y Cursos
              </Link>
            </div>
          </aside>
        </section>

        <footer className="mt-10 border-t border-neutral-800 pt-8">
          <Link href="/blog" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            ← Regresar al catálogo del blog
          </Link>
        </footer>
      </article>
    </main>
  );
}
