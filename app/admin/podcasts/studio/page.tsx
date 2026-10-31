"use client";

import { useMemo, useState } from "react";
import type { VozPodcast } from "@/types/podcast";

const ETIQUETAS = ["Activismo", "Leyes", "Orizaba", "Cultivo", "Salud", "Reducción de Riesgos"] as const;

type Paso = { id: string; etiqueta: string; estado: "pendiente" | "activo" | "listo" | "error" };

const VOCES: { id: VozPodcast; etiqueta: string }[] = [
  { id: "mujer", etiqueta: "Mujer · Dalia" },
  { id: "hombre", etiqueta: "Hombre · Jorge" },
  { id: "institucional", etiqueta: "Voz institucional" },
];

export default function StudioPodcastPage() {
  const [guion, setGuion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [temporada, setTemporada] = useState(1);
  const [numero, setNumero] = useState(1);
  const [voz, setVoz] = useState<VozPodcast>("mujer");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [categorias, setCategorias] = useState<string[]>(["Activismo"]);
  const [audioUrl, setAudioUrl] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [portada, setPortada] = useState<File | null>(null);
  const [web, setWeb] = useState(true);
  const [rss, setRss] = useState(true);
  const [youtube, setYoutube] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [pasos, setPasos] = useState<Paso[]>([]);

  const avance = useMemo(() => {
    if (!pasos.length) return 0;
    const listos = pasos.filter((paso) => paso.estado === "listo").length;
    return Math.round((listos / pasos.length) * 100);
  }, [pasos]);

  function marcar(id: string, estado: Paso["estado"]) {
    setPasos((actual) => actual.map((paso) => (paso.id === id ? { ...paso, estado } : paso)));
  }

  async function mejorar() {
    setMensaje("");
    setOcupado(true);
    try {
      const respuesta = await fetch("/api/podcasts/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "mejorar", texto: guion }),
      });
      const datos = (await respuesta.json()) as { guion?: string; error?: string };
      if (!respuesta.ok || !datos.guion) throw new Error(datos.error || "No se pudo mejorar el guion.");
      setGuion(datos.guion);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Error al mejorar el guion.");
    } finally {
      setOcupado(false);
    }
  }

  async function preescuchar() {
    setMensaje("");
    setOcupado(true);
    try {
      const respuesta = await fetch("/api/podcasts/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: guion, voz, rate, pitch }),
      });
      const datos = (await respuesta.json()) as { audioUrl?: string; duracionSegundos?: number; error?: string };
      if (!respuesta.ok || !datos.audioUrl) throw new Error(datos.error || "No se generó el audio.");
      setAudioUrl(`${datos.audioUrl}?t=${Date.now()}`);
      setDuracion(datos.duracionSegundos || 0);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Error de voz.");
    } finally {
      setOcupado(false);
    }
  }

  async function desplegar() {
    if (!titulo.trim() || !audioUrl || !portada) {
      setMensaje("Hace falta título, audio generado y portada cuadrada.");
      return;
    }
    const secuencia: Paso[] = [
      { id: "web", etiqueta: "Publicar en la web", estado: web ? "pendiente" : "listo" },
      { id: "rss", etiqueta: "Sindicación RSS", estado: rss ? "pendiente" : "listo" },
      { id: "youtube", etiqueta: "Audiograma de YouTube", estado: youtube ? "pendiente" : "listo" },
    ];
    setPasos(secuencia);
    setOcupado(true);
    setMensaje("");
    try {
      const archivo = await fetch(audioUrl.split("?")[0]);
      if (!archivo.ok) throw new Error("El MP3 generado ya no está disponible.");
      const audio = new File([await archivo.blob()], "locucion.mp3", { type: "audio/mpeg" });
      const formulario = new FormData();
      formulario.set("title", titulo);
      formulario.set("summary", guion.slice(0, 180));
      formulario.set("description", guion);
      formulario.set("season", String(temporada));
      formulario.set("episodeNumber", String(numero));
      formulario.set("durationSeconds", String(duracion || 0));
      formulario.set("status", web || rss || youtube ? "published" : "draft");
      formulario.set("tags", categorias.join(","));
      formulario.set("audio", audio);
      formulario.set("cover", portada);
      marcar("web", "activo");
      const alta = await fetch("/api/podcasts", { method: "POST", body: formulario });
      const creado = (await alta.json()) as { episode?: { id: string }; error?: string };
      if (!alta.ok || !creado.episode) throw new Error(creado.error || "No se publicó el episodio.");
      marcar("web", "listo");
      if (rss) {
        marcar("rss", "activo");
        const feed = await fetch("/api/podcasts/feed.xml");
        if (!feed.ok) throw new Error("El feed RSS no respondió.");
        marcar("rss", "listo");
      }
      if (youtube) {
        marcar("youtube", "activo");
        const sync = await fetch("/api/podcasts/sync/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: creado.episode.id }),
        });
        const video = (await sync.json()) as { error?: string };
        if (!sync.ok) throw new Error(video.error || "YouTube no aceptó el audiograma.");
        marcar("youtube", "listo");
      }
      setMensaje("Episodio desplegado.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "El despliegue se detuvo.");
      setPasos((actual) => actual.map((paso) => (paso.estado === "activo" ? { ...paso, estado: "error" } : paso)));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Movimiento Canabico Orizaba</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">AI Podcast Studio</h1>
        </header>

        <section className="rounded-3xl border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-white">1. Guion y voz</h2>
          <input value={titulo} onChange={(evento) => setTitulo(evento.target.value)} placeholder="Título del episodio" className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <textarea value={guion} onChange={(evento) => setGuion(evento.target.value)} rows={10} placeholder="Guion en español de México" className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            {VOCES.map((opcion) => (
              <button key={opcion.id} type="button" onClick={() => setVoz(opcion.id)} className={`rounded-full px-3 py-2 text-xs ${voz === opcion.id ? "bg-emerald-500 text-zinc-950" : "border border-zinc-800"}`}>
                {opcion.etiqueta}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-xs text-zinc-400">
            Velocidad {rate.toFixed(2)}
            <input type="range" min={0.8} max={1.3} step={0.05} value={rate} onChange={(evento) => setRate(Number(evento.target.value))} className="mt-1 w-full" />
          </label>
          <label className="mt-2 block text-xs text-zinc-400">
            Tono {pitch}
            <input type="range" min={-8} max={8} step={1} value={pitch} onChange={(evento) => setPitch(Number(evento.target.value))} className="mt-1 w-full" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={ocupado} onClick={mejorar} className="rounded-full border border-zinc-800 px-4 py-2 text-sm">Mejorar con IA</button>
            <button type="button" disabled={ocupado} onClick={preescuchar} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950">Generar audio</button>
          </div>
          {audioUrl ? <audio className="mt-4 w-full" controls src={audioUrl} /> : null}
        </section>

        <section className="rounded-3xl border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-white">2. Multimedia y arte</h2>
          <p className="mt-2 text-sm text-zinc-400">Portada cuadrada JPG, PNG o WEBP, mínimo 320 px, con los logotipos de Basecamp 420 y Movimiento Canabico Orizaba.</p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(evento) => setPortada(evento.target.files?.[0] || null)} className="mt-4 block text-sm" />
          <div className="mt-3 flex gap-3 text-sm">
            <label>Temporada <input type="number" min={1} value={temporada} onChange={(evento) => setTemporada(Number(evento.target.value))} className="ml-2 w-16 rounded border border-zinc-800 bg-zinc-950 px-2 py-1" /></label>
            <label>Episodio <input type="number" min={1} value={numero} onChange={(evento) => setNumero(Number(evento.target.value))} className="ml-2 w-16 rounded border border-zinc-800 bg-zinc-950 px-2 py-1" /></label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ETIQUETAS.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategorias((actual) => (actual.includes(categoria) ? actual.filter((item) => item !== categoria) : [...actual, categoria]))}
                className={`rounded-full px-3 py-1 text-xs ${categorias.includes(categoria) ? "bg-emerald-500 text-zinc-950" : "border border-zinc-800"}`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-white">3. Matriz de despliegue</h2>
          <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={web} onChange={(evento) => setWeb(evento.target.checked)} /> Publicar en Web Basecamp 420</label>
          <label className="mt-2 flex gap-2 text-sm"><input type="checkbox" checked={rss} onChange={(evento) => setRss(evento.target.checked)} /> Sincronizar en RSS público (Spotify / Apple)</label>
          <label className="mt-2 flex gap-2 text-sm"><input type="checkbox" checked={youtube} onChange={(evento) => setYoutube(evento.target.checked)} /> Renderizar y subir audiograma a YouTube</label>
          <button type="button" disabled={ocupado} onClick={desplegar} className="mt-5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950">
            Generar audio y desplegar multiplataforma
          </button>
          {pasos.length ? (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full bg-emerald-500" style={{ width: `${avance}%` }} />
              </div>
              <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                {pasos.map((paso) => (
                  <li key={paso.id}>{paso.etiqueta}: {paso.estado}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {mensaje ? <p className="mt-3 text-sm text-emerald-300">{mensaje}</p> : null}
        </section>
      </div>
    </main>
  );
}
