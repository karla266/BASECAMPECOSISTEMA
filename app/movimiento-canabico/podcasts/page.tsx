import ListaPodcasts from "@/components/podcasts/ListaPodcasts";
import { leerEpisodios } from "@/lib/podcasts";
import type { PodcastEpisode } from "@/types/podcast";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast | Movimiento Cannábico Orizaba",
  description: "Cultura, marco normativo, autocultivo y reducción de daños en las Altas Montañas de Veracruz.",
  alternates: { canonical: "https://www.basecamp420.com/movimiento-canabico/podcasts" },
};

function datosEstructurados(episodios: PodcastEpisode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastSeries",
        name: "Movimiento Cannábico Orizaba",
        url: "https://www.basecamp420.com/movimiento-canabico/podcasts",
        inLanguage: "es-MX",
        author: { "@type": "Organization", name: "Basecamp 420" },
      },
      ...episodios.map((episodio) => ({
        "@type": "PodcastEpisode",
        name: episodio.title,
        description: episodio.description || episodio.summary,
        datePublished: episodio.publishedAt,
        episodeNumber: episodio.episodeNumber,
        partOfSeason: { "@type": "PodcastSeason", seasonNumber: episodio.season },
        url: `https://www.basecamp420.com/movimiento-canabico/podcasts#${episodio.slug}`,
        associatedMedia: {
          "@type": "MediaObject",
          contentUrl: `https://www.basecamp420.com${episodio.audioUrl}`,
          encodingFormat: episodio.audioUrl.toLowerCase().endsWith(".m4a") ? "audio/mp4" : "audio/mpeg",
        },
        image: `https://www.basecamp420.com${episodio.coverImageUrl}`,
        hasPart: (episodio.chapters || []).map((capitulo) => ({
          "@type": "Clip",
          name: capitulo.title,
          startOffset: capitulo.time,
        })),
      })),
    ],
  };
}

export default async function PodcastPublicPage() {
  const episodios = (await leerEpisodios()).filter((episodio) => episodio.status === "published");
  return (
    <div className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados(episodios)).replace(/</g, "\\u003c") }}
      />
      <section className="border-b border-zinc-800/80 bg-zinc-900/40 px-6 py-16 text-center">
        <h1 className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
          Movimiento Cannábico Orizaba
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
          Cultura, marco normativo, autocultivo y reducción de daños en las Altas Montañas de Veracruz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <a href="/api/podcasts/feed.xml" className="rounded-full border border-emerald-500/30 px-4 py-2 text-emerald-400 hover:bg-emerald-500/10">
            Feed RSS público
          </a>
          <a href="/reservar" className="rounded-full bg-emerald-600 px-4 py-2 font-bold text-zinc-950 hover:bg-emerald-500">
            Reservar experiencia en línea
          </a>
        </div>
      </section>
      <ListaPodcasts episodes={episodios} />
    </div>
  );
}
