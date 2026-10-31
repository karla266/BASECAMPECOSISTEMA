import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import type { VozPodcast } from "@/types/podcast";

const VOCES: Record<VozPodcast, { edge: string; openai: string; pitch: string }> = {
  mujer: { edge: "es-MX-DaliaNeural", openai: "nova", pitch: "+0Hz" },
  hombre: { edge: "es-MX-JorgeNeural", openai: "onyx", pitch: "+0Hz" },
  institucional: { edge: "es-MX-DaliaNeural", openai: "shimmer", pitch: "-4Hz" },
};

export type PedidoVoz = {
  texto: string;
  voz: VozPodcast;
  rate: number;
  pitch: number;
  salida: string;
};

function porcentaje(rate: number) {
  const limitado = Math.min(1.5, Math.max(0.7, rate));
  const delta = Math.round((limitado - 1) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}%`;
}

function hercios(pitch: number, base: string) {
  const extra = Math.max(-20, Math.min(20, Math.round(pitch)));
  const inicial = Number(base.replace("Hz", "").replace("+", "")) || 0;
  const total = inicial + extra;
  return `${total >= 0 ? "+" : ""}${total}Hz`;
}

function ejecutar(comando: string, args: string[], entrada?: string) {
  return new Promise<{ codigo: number; stdout: string; stderr: string }>((resolve, reject) => {
    const proceso = spawn(comando, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    proceso.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    proceso.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    proceso.on("error", reject);
    proceso.on("close", (codigo) => resolve({ codigo: codigo ?? 1, stdout, stderr }));
    if (entrada) proceso.stdin.end(entrada);
  });
}

async function edge(pedido: PedidoVoz) {
  const perfil = VOCES[pedido.voz];
  const script = path.join(process.cwd(), "scripts", "podcast_tts.py");
  const resultado = await ejecutar(
    process.env.PYTHON_BIN || "python",
    [script],
    JSON.stringify({
      texto: pedido.texto,
      voz: perfil.edge,
      rate: porcentaje(pedido.rate),
      pitch: hercios(pedido.pitch, perfil.pitch),
      salida: pedido.salida,
    })
  );
  if (resultado.codigo !== 0) {
    let mensaje = resultado.stderr.trim() || "edge-tts falló.";
    try {
      const json = JSON.parse(resultado.stdout) as { error?: string };
      if (json.error) mensaje = json.error;
    } catch {
      if (resultado.stdout.trim()) mensaje = resultado.stdout.trim();
    }
    throw new Error(mensaje);
  }
}

async function elevenlabs(pedido: PedidoVoz) {
  const clave = process.env.ELEVENLABS_API_KEY;
  const voz = process.env.ELEVENLABS_VOICE_ID;
  if (!clave || !voz) throw new Error("Faltan ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID.");
  const respuesta = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
    method: "POST",
    headers: { "xi-api-key": clave, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: pedido.texto,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.75, speed: pedido.rate },
    }),
  });
  if (!respuesta.ok) throw new Error(`ElevenLabs respondió ${respuesta.status}.`);
  await fs.writeFile(pedido.salida, Buffer.from(await respuesta.arrayBuffer()));
}

async function openai(pedido: PedidoVoz) {
  const clave = process.env.OPENAI_API_KEY;
  if (!clave) throw new Error("Falta OPENAI_API_KEY.");
  const respuesta = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "tts-1",
      voice: VOCES[pedido.voz].openai,
      input: pedido.texto,
      speed: Math.min(4, Math.max(0.25, pedido.rate)),
      response_format: "mp3",
    }),
  });
  if (!respuesta.ok) throw new Error(`OpenAI TTS respondió ${respuesta.status}.`);
  await fs.writeFile(pedido.salida, Buffer.from(await respuesta.arrayBuffer()));
}

export async function sintetizarVoz(pedido: PedidoVoz) {
  await fs.mkdir(path.dirname(pedido.salida), { recursive: true });
  const motor = (process.env.TTS_PROVIDER || "edge").toLowerCase();
  if (motor === "elevenlabs") await elevenlabs(pedido);
  else if (motor === "openai") await openai(pedido);
  else await edge(pedido);
  const estadistica = await fs.stat(pedido.salida);
  if (estadistica.size < 1000) throw new Error("El audio generado quedó vacío.");
  return { bytes: estadistica.size };
}

export async function duracionAudio(ruta: string) {
  try {
    const resultado = await ejecutar("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      ruta,
    ]);
    const segundos = Number(resultado.stdout.trim());
    if (Number.isFinite(segundos) && segundos > 0) return Math.round(segundos);
  } catch {
    return null;
  }
  return null;
}

export async function mejorarGuion(texto: string) {
  const instruccion = `Mejora este guion de podcast en español de México para Movimiento Canabico Orizaba. Conserva los hechos, separa párrafos para pausas y marca tiempos como 00:00. Devuelve solo el guion.\n\n${texto}`;
  const ollama = process.env.OLLAMA_URL || "http://192.168.0.116:11434";
  try {
    const respuesta = await fetch(`${ollama.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        prompt: instruccion,
        stream: false,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (respuesta.ok) {
      const datos = (await respuesta.json()) as { response?: string };
      if (datos.response?.trim()) return datos.response.trim();
    }
  } catch {
    // Ollama no está en la LAN; se intenta Gemini.
  }
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new Error("Ollama no respondió y no hay GEMINI_API_KEY.");
  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${clave}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: instruccion }] }] }),
    }
  );
  if (!respuesta.ok) throw new Error(`Gemini respondió ${respuesta.status}.`);
  const datos = (await respuesta.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const guion = datos.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!guion) throw new Error("La IA no devolvió un guion.");
  return guion;
}
