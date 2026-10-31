import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import { actualizarEpisodio, buscarEpisodio, rutaLocalPublica } from "@/lib/podcasts";
import { publicarEnYouTube, renderizarAudiograma } from "@/lib/youtube-publisher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sesion = await verificarSesionAdmin(cookies().get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return NextResponse.json({ error: "Se requiere la sesión del panel." }, { status: 401 });

  const cuerpo = (await request.json()) as { id?: string };
  const episodio = cuerpo.id ? await buscarEpisodio(cuerpo.id) : null;
  if (!episodio) return NextResponse.json({ error: "El episodio no existe." }, { status: 404 });

  const audio = rutaLocalPublica(episodio.audioUrl);
  const portada = episodio.coverImageUrl ? rutaLocalPublica(episodio.coverImageUrl) : null;
  if (!audio) return NextResponse.json({ error: "La ruta del audio no es válida." }, { status: 400 });

  const video = path.join(process.cwd(), "data", "podcast-videos", `${episodio.id}.mp4`);
  try {
    await renderizarAudiograma(audio, portada, video);
    const publicado = await publicarEnYouTube(episodio, video);
    const actualizado = await actualizarEpisodio(episodio.id, { youtubeUrl: publicado.url });
    return NextResponse.json({ ok: true, youtube: publicado, episodio: actualizado });
  } catch (falla) {
    return NextResponse.json(
      { error: falla instanceof Error ? falla.message : "No se pudo publicar en YouTube." },
      { status: 502 }
    );
  }
}
