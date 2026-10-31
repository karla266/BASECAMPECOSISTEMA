import { randomBytes } from "crypto";
import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import { duracionAudio, mejorarGuion, sintetizarVoz } from "@/lib/tts-engine";
import type { VozPodcast } from "@/types/podcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOCES: VozPodcast[] = ["mujer", "hombre", "institucional"];

function error(mensaje: string, estado: number) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

export async function POST(request: Request) {
  const sesion = await verificarSesionAdmin(cookies().get(NOMBRE_COOKIE_SESION)?.value);
  if (!sesion) return error("Se requiere la sesión del panel.", 401);

  const cuerpo = (await request.json()) as {
    accion?: string;
    texto?: string;
    voz?: VozPodcast;
    rate?: number;
    pitch?: number;
  };
  const texto = (cuerpo.texto || "").trim();
  if (texto.length < 20 || texto.length > 8000) return error("El guion debe tener entre 20 y 8000 caracteres.", 400);

  if (cuerpo.accion === "mejorar") {
    try {
      const guion = await mejorarGuion(texto);
      return NextResponse.json({ guion });
    } catch (falla) {
      return error(falla instanceof Error ? falla.message : "No se pudo mejorar el guion.", 502);
    }
  }

  const voz = VOCES.includes(cuerpo.voz as VozPodcast) ? (cuerpo.voz as VozPodcast) : "mujer";
  const id = randomBytes(8).toString("hex");
  const salida = path.join(process.cwd(), "public", "uploads", "podcasts", `${id}.mp3`);
  try {
    const resultado = await sintetizarVoz({
      texto,
      voz,
      rate: Number(cuerpo.rate) || 1,
      pitch: Number(cuerpo.pitch) || 0,
      salida,
    });
    const duracion = (await duracionAudio(salida)) || Math.max(1, Math.round(texto.length / 14));
    return NextResponse.json({
      id,
      audioUrl: `/uploads/podcasts/${id}.mp3`,
      duracionSegundos: duracion,
      bytes: resultado.bytes,
      voz,
    });
  } catch (falla) {
    return error(falla instanceof Error ? falla.message : "No se pudo generar la voz.", 502);
  }
}
