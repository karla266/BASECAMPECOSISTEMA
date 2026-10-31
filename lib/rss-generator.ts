import type { PodcastEpisode } from "@/types/podcast";

const SITIO = "https://www.basecamp420.com";

function cdata(valor: string) {
  return valor.replace(/]]>/g, "]]]]><![CDATA[>");
}

function absoluto(ruta: string) {
  if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
  const camino = ruta.startsWith("/") ? ruta : `/${ruta}`;
  const codificado = camino
    .split("/")
    .map((parte) => encodeURIComponent(parte))
    .join("/");
  return `${SITIO}${codificado}`;
}

function tipoAudio(url: string) {
  const archivo = url.split("?")[0].toLowerCase();
  if (archivo.endsWith(".m4a")) return "audio/mp4";
  if (archivo.endsWith(".wav")) return "audio/wav";
  return "audio/mpeg";
}

function atributo(valor: string) {
  return valor.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function construirFeed(episodios: PodcastEpisode[]) {
  const publicados = episodios.filter((episodio) => episodio.status === "published");
  const items = publicados
    .map((episodio) => {
      const audio = atributo(absoluto(episodio.audioUrl));
      const portada = atributo(absoluto(episodio.coverImageUrl || "/uploads/covers/mco_cover.jpg"));
      return `    <item>
      <title><![CDATA[${cdata(episodio.title)}]]></title>
      <description><![CDATA[${cdata(episodio.description || episodio.summary)}]]></description>
      <link>${SITIO}/movimiento-canabico/podcasts#${episodio.slug}</link>
      <guid isPermaLink="false">${episodio.id}</guid>
      <pubDate>${new Date(episodio.publishedAt).toUTCString()}</pubDate>
      <enclosure url="${audio}" length="${episodio.audioSizeBytes || 0}" type="${tipoAudio(episodio.audioUrl)}" />
      <itunes:image href="${portada}" />
      <itunes:duration>${episodio.durationSeconds || 0}</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      <itunes:season>${episodio.season}</itunes:season>
      <itunes:episode>${episodio.episodeNumber}</itunes:episode>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Movimiento Cannábico Orizaba | Basecamp 420</title>
    <link>${SITIO}/movimiento-canabico/podcasts</link>
    <language>es-mx</language>
    <description>Espacio oficial de diálogo, activismo, cultura y reducción de riesgos en las Altas Montañas de Veracruz.</description>
    <itunes:author>Basecamp 420</itunes:author>
    <itunes:category text="Society &amp; Culture" />
    <itunes:image href="${SITIO}/uploads/covers/mco_cover.jpg" />
    <itunes:explicit>no</itunes:explicit>
    ${items}
  </channel>
</rss>`;
}
