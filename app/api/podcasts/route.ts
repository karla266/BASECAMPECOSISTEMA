import path from "path";
import { promises as fs } from "fs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import { DIR_AUDIO, DIR_PORTADA, LIMITE_AUDIO, LIMITE_PORTADA, guardarEpisodios, leerEpisodios } from "@/lib/podcasts";
import type { PodcastChapter, PodcastEpisode } from "@/types/podcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUDIO_OK = new Set([".mp3", ".m4a", ".wav"]);
const PORTADA_OK = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function error(mensaje: string, estado: number) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

function slugDe(titulo: string) {
  const base = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "episodio";
}

function capitulosDe(valor: FormDataEntryValue | null): PodcastChapter[] {
  if (typeof valor !== "string" || !valor.trim()) return [];
  let datos: unknown;
  try {
    datos = JSON.parse(valor);
  } catch {
    return [];
  }
  if (!Array.isArray(datos)) return [];
  return datos
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const time = Number((item as { time?: number }).time);
      const title = String((item as { title?: string }).title || "").trim();
      if (!Number.isFinite(time) || time < 0 || time > 60 * 60 * 4) return [];
      if (title.length < 1 || title.length > 120) return [];
      return [{ time: Math.round(time), title }];
    })
    .slice(0, 40);
}

function httpsOpcional(valor: FormDataEntryValue | null) {
  const texto = String(valor || "").trim();
  if (!texto) return undefined;
  try {
    const url = new URL(texto);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  const episodios = await leerEpisodios();
  return NextResponse.json(episodios.filter((episodio) => episodio.status === "published"));
}

export async function POST(request: Request) {
  const sesion = await verificarSesionAdmin(cookies().get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return error("Se requiere la sesión del panel.", 401);

  const formulario = await request.formData();
  const title = String(formulario.get("title") || "").trim();
  const summary = String(formulario.get("summary") || "").trim();
  const description = String(formulario.get("description") || "").trim();
  const season = Number(formulario.get("season") || 1);
  const episodeNumber = Number(formulario.get("episodeNumber") || 1);
  const tags = String(formulario.get("tags") || "")
    .split(",")
    .map((etiqueta) => etiqueta.trim())
    .filter(Boolean);
  const spotifyUrl = httpsOpcional(formulario.get("spotifyUrl"));
  const youtubeUrl = httpsOpcional(formulario.get("youtubeUrl"));
  const audioFile = formulario.get("audio");
  const coverFile = formulario.get("cover");
  const estado = String(formulario.get("status") || "published");
  const duracion = Number(formulario.get("durationSeconds") || 0);
  const chapters = capitulosDe(formulario.get("chapters"));

  if (title.length < 3) return error("Título y archivo de audio son obligatorios.", 400);
  if (!(audioFile instanceof File) || audioFile.size === 0) return error("Título y archivo de audio son obligatorios.", 400);
  if (audioFile.size > LIMITE_AUDIO) return error("El audio supera 80 MB.", 400);
  if (!Number.isInteger(season) || season < 1 || season > 99) return error("La temporada debe estar entre 1 y 99.", 400);
  if (!Number.isInteger(episodeNumber) || episodeNumber < 1 || episodeNumber > 999) {
    return error("El número de episodio debe estar entre 1 y 999.", 400);
  }
  if (spotifyUrl === null || youtubeUrl === null) return error("Los enlaces opcionales deben ser https.", 400);
  if (estado !== "draft" && estado !== "published") return error("El estado debe ser draft o published.", 400);

  const audioExt = AUDIO_OK.has(path.extname(audioFile.name).toLowerCase()) ? path.extname(audioFile.name).toLowerCase() : "";
  if (!audioExt) return error("El audio debe ser mp3, m4a o wav.", 400);

  let coverExt = "";
  if (coverFile instanceof File && coverFile.size > 0) {
    if (coverFile.size > LIMITE_PORTADA) return error("La portada supera 5 MB.", 400);
    coverExt = path.extname(coverFile.name).toLowerCase() === ".jpeg" ? ".jpg" : path.extname(coverFile.name).toLowerCase();
    if (!PORTADA_OK.has(coverExt)) return error("La portada debe ser jpg, png o webp.", 400);
  }

  await fs.mkdir(DIR_AUDIO, { recursive: true });
  await fs.mkdir(DIR_PORTADA, { recursive: true });

  const marca = Date.now();
  const slug = `${slugDe(title)}-${marca}`;
  const audioFileName = `${marca}-${slug}${audioExt}`;
  const audioPath = path.join(DIR_AUDIO, audioFileName);
  await fs.writeFile(audioPath, Buffer.from(await audioFile.arrayBuffer()));

  let coverImageUrl = "/uploads/covers/default_cover.jpg";
  let coverPath = "";
  try {
    if (coverFile instanceof File && coverFile.size > 0 && coverExt) {
      const coverFileName = `${marca}-${slug}${coverExt}`;
      coverPath = path.join(DIR_PORTADA, coverFileName);
      await fs.writeFile(coverPath, Buffer.from(await coverFile.arrayBuffer()));
      coverImageUrl = `/uploads/covers/${coverFileName}`;
    }

    const episode: PodcastEpisode = {
      id: `ep-${marca}`,
      title,
      slug,
      season,
      episodeNumber,
      publishedAt: new Date().toISOString(),
      summary,
      description,
      audioUrl: `/uploads/podcasts/${audioFileName}`,
      audioSizeBytes: audioFile.size,
      durationSeconds: Number.isFinite(duracion) && duracion > 0 ? Math.round(duracion) : 0,
      coverImageUrl,
      tags,
      hosts: ["Movimiento Cannábico Orizaba", "Basecamp 420"],
      ...(chapters.length ? { chapters } : {}),
      spotifyUrl,
      youtubeUrl,
      status: estado,
    };

    const episodios = await leerEpisodios();
    episodios.unshift(episode);
    await guardarEpisodios(episodios);
    return NextResponse.json({ success: true, episode }, { status: 201 });
  } catch (falla) {
    await fs.rm(audioPath, { force: true });
    if (coverPath) await fs.rm(coverPath, { force: true });
    const mensaje = falla instanceof Error ? falla.message : "Error interno al guardar los archivos.";
    return error(mensaje, 500);
  }
}
