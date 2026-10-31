import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import type { PodcastEpisode } from "@/types/podcast";

function requeridos() {
  const faltan = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"].filter((nombre) => !process.env[nombre]);
  if (faltan.length) throw new Error(`Faltan variables de YouTube: ${faltan.join(", ")}.`);
}

async function tokenAcceso() {
  requeridos();
  const cuerpo = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID || "",
    client_secret: process.env.YOUTUBE_CLIENT_SECRET || "",
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN || "",
    grant_type: "refresh_token",
  });
  const respuesta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo,
  });
  const datos = (await respuesta.json()) as { access_token?: string; error?: string };
  if (!respuesta.ok || !datos.access_token) {
    throw new Error(datos.error || "YouTube no entregó un token de acceso.");
  }
  return datos.access_token;
}

function ffmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proceso = spawn("ffmpeg", args, { windowsHide: true });
    let error = "";
    proceso.stderr.on("data", (chunk) => {
      error += String(chunk);
    });
    proceso.on("error", () => reject(new Error("FFmpeg no está instalado en esta máquina.")));
    proceso.on("close", (codigo) => {
      if (codigo === 0) resolve();
      else reject(new Error(error.slice(-500) || "FFmpeg no pudo renderizar el audiograma."));
    });
  });
}

export async function renderizarAudiograma(audioLocal: string, portadaLocal: string | null, salida: string) {
  await fs.mkdir(path.dirname(salida), { recursive: true });
  const entradaVideo = portadaLocal
    ? ["-loop", "1", "-i", portadaLocal]
    : ["-f", "lavfi", "-i", "color=c=0x052e16:s=1080x1080:r=30"];
  await ffmpeg([
    "-y",
    ...entradaVideo,
    "-i",
    audioLocal,
    "-vf",
    "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,format=yuv420p",
    "-c:v",
    "libx264",
    "-tune",
    "stillimage",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-movflags",
    "+faststart",
    salida,
  ]);
}

function descripcion(episodio: PodcastEpisode) {
  return [episodio.summary, "", episodio.description, "", "Sitio: https://www.basecamp420.com/movimiento-canabico/podcasts", "WhatsApp: https://wa.me/522727258748"]
    .filter(Boolean)
    .join("\n");
}

export async function publicarEnYouTube(episodio: PodcastEpisode, videoLocal: string) {
  const token = await tokenAcceso();
  const metadata = {
    snippet: {
      title: episodio.title.slice(0, 100),
      description: descripcion(episodio).slice(0, 4900),
      categoryId: "22",
    },
    status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
  };
  const inicio = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify(metadata),
    }
  );
  const ubicacion = inicio.headers.get("location");
  if (!inicio.ok || !ubicacion) throw new Error(`YouTube no abrió la carga (${inicio.status}).`);
  const archivo = await fs.readFile(videoLocal);
  const carga = await fetch(ubicacion, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(archivo.length) },
    body: new Uint8Array(archivo),
  });
  const video = (await carga.json()) as { id?: string; error?: { message?: string } };
  if (!carga.ok || !video.id) throw new Error(video.error?.message || "YouTube no guardó el video.");
  const lista = process.env.YOUTUBE_PLAYLIST_ID;
  if (lista) {
    await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        snippet: { playlistId: lista, resourceId: { kind: "youtube#video", videoId: video.id } },
      }),
    });
  }
  return { videoId: video.id, url: `https://www.youtube.com/watch?v=${video.id}` };
}
