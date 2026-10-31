import { promises as fs } from "fs";
import path from "path";
import type { PodcastEpisode } from "@/types/podcast";

const INDICE = path.join(process.cwd(), "data", "podcasts.json");

export const DIR_AUDIO = path.join(process.cwd(), "public", "uploads", "podcasts");
export const DIR_PORTADA = path.join(process.cwd(), "public", "uploads", "covers");
export const LIMITE_AUDIO = 80 * 1024 * 1024;
export const LIMITE_PORTADA = 5 * 1024 * 1024;

export async function leerEpisodios(): Promise<PodcastEpisode[]> {
  try {
    const texto = await fs.readFile(INDICE, "utf8");
    const datos = JSON.parse(texto) as unknown;
    if (!Array.isArray(datos)) throw new Error("data/podcasts.json no contiene una lista de episodios.");
    return datos as PodcastEpisode[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function guardarEpisodios(episodios: PodcastEpisode[]) {
  await fs.mkdir(path.dirname(INDICE), { recursive: true });
  const temporal = `${INDICE}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(episodios, null, 2), "utf8");
  await fs.rename(temporal, INDICE);
}

export async function buscarEpisodio(id: string) {
  const episodios = await leerEpisodios();
  return episodios.find((episodio) => episodio.id === id) ?? null;
}

export async function actualizarEpisodio(id: string, cambios: Partial<PodcastEpisode>) {
  const episodios = await leerEpisodios();
  const indice = episodios.findIndex((episodio) => episodio.id === id);
  if (indice < 0) return null;
  episodios[indice] = { ...episodios[indice], ...cambios, id };
  await guardarEpisodios(episodios);
  return episodios[indice];
}

export function rutaLocalPublica(urlPublicaArchivo: string) {
  const limpia = urlPublicaArchivo.split("?")[0];
  const relativo = limpia.startsWith("/") ? limpia.slice(1) : limpia;
  const raiz = path.resolve(process.cwd(), "public");
  const destino = path.resolve(raiz, relativo);
  if (!destino.toLowerCase().startsWith(raiz.toLowerCase() + path.sep)) return null;
  return destino;
}
