"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubirPodcastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    season: "1",
    episodeNumber: "1",
    summary: "",
    description: "",
    tags: "Activismo, Comunidad, Orizaba",
    spotifyUrl: "",
    youtubeUrl: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!audioFile) {
      setMessage("Debes seleccionar un archivo de audio.");
      return;
    }
    setLoading(true);
    setMessage("Subiendo archivos y registrando en disco...");
    const data = new FormData();
    data.append("title", form.title);
    data.append("season", form.season);
    data.append("episodeNumber", form.episodeNumber);
    data.append("summary", form.summary);
    data.append("description", form.description);
    data.append("tags", form.tags);
    data.append("spotifyUrl", form.spotifyUrl);
    data.append("youtubeUrl", form.youtubeUrl);
    data.append("audio", audioFile);
    if (coverFile) data.append("cover", coverFile);
    try {
      const respuesta = await fetch("/api/podcasts", { method: "POST", body: data });
      const cuerpo = (await respuesta.json()) as { error?: string };
      if (!respuesta.ok) throw new Error(cuerpo.error || "Error al procesar la subida.");
      setMessage("Episodio publicado y feed actualizado.");
      window.setTimeout(() => router.push("/movimiento-canabico/podcasts"), 1500);
    } catch (falla) {
      setMessage(falla instanceof Error ? falla.message : "Ocurrió un error al subir el podcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-emerald-400">Subir Podcast | Movimiento Cannábico Orizaba</h1>
        <p className="mb-2 text-sm text-zinc-400">El archivo se guardará en el disco local y se agregará al feed RSS.</p>
        <a href="/admin/podcasts/studio" className="mb-6 inline-block text-sm text-emerald-400">
          Abrir AI Podcast Studio
        </a>
        {message ? (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-zinc-800 p-4 text-sm text-emerald-300">{message}</div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Título del episodio</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(evento) => setForm({ ...form, title: evento.target.value })}
              placeholder="Ej. Episodio 2: Cultivo Responsable"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Temporada</label>
              <input
                type="number"
                value={form.season}
                onChange={(evento) => setForm({ ...form, season: evento.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Número de episodio</label>
              <input
                type="number"
                value={form.episodeNumber}
                onChange={(evento) => setForm({ ...form, episodeNumber: evento.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Resumen corto</label>
            <input
              type="text"
              required
              value={form.summary}
              onChange={(evento) => setForm({ ...form, summary: evento.target.value })}
              placeholder="Breve extracto de 1 o 2 oraciones..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Descripción y notas del programa</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(evento) => setForm({ ...form, description: evento.target.value })}
              placeholder="Timestamps, enlaces relevantes, notas..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Archivo de audio (.mp3, .m4a)</label>
              <input
                type="file"
                required
                accept="audio/mpeg,audio/mp4,audio/wav,.mp3,.m4a,.wav"
                onChange={(evento) => setAudioFile(evento.target.files?.[0] || null)}
                className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Carátula cuadrada (1:1)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(evento) => setCoverFile(evento.target.files?.[0] || null)}
                className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Enlace Spotify (opcional)</label>
              <input
                type="url"
                value={form.spotifyUrl}
                onChange={(evento) => setForm({ ...form, spotifyUrl: evento.target.value })}
                placeholder="https://open.spotify.com/episode/..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Enlace YouTube (opcional)</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(evento) => setForm({ ...form, youtubeUrl: evento.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-emerald-500 py-3 font-bold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:bg-zinc-800"
          >
            {loading ? "Guardando..." : "Publicar episodio"}
          </button>
        </form>
      </div>
    </div>
  );
}
