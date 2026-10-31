"use client";

import { useRef, useState } from "react";
import type { PodcastChapter, PodcastEpisode } from "@/types/podcast";

const WHATSAPP_EPISODIO =
  "https://wa.me/522727258748?text=Hola,%20escuché%20el%20Episodio%201%20del%20podcast%20sobre%20amparos";

function marca(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return `${minutos.toString().padStart(2, "0")}:${resto.toString().padStart(2, "0")}`;
}

function capitulosDe(episodio: PodcastEpisode): PodcastChapter[] {
  if (episodio.chapters?.length) return episodio.chapters;
  return episodio.description.split("\n").flatMap((linea) => {
    const coincidencia = linea.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-–]\s*(.+)/);
    if (!coincidencia) return [];
    const segundos = coincidencia[3]
      ? Number(coincidencia[1]) * 3600 + Number(coincidencia[2]) * 60 + Number(coincidencia[3])
      : Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
    return [{ time: segundos, title: coincidencia[4].trim() }];
  });
}

function Portada({ src, alt }: { src: string; alt: string }) {
  const [rota, setRota] = useState(false);
  if (rota || !src) {
    return (
      <svg viewBox="0 0 96 96" className="h-24 w-24 flex-shrink-0 rounded-lg bg-zinc-900" role="img" aria-label={alt}>
        <rect width="96" height="96" rx="12" fill="#09090b" />
        <rect x="8" y="8" width="80" height="80" rx="10" fill="#052e16" stroke="#10b981" />
        <path d="M48 22c8 10 14 16 14 26a14 14 0 1 1-28 0c0-10 6-16 14-26z" fill="#34d399" />
        <text x="48" y="78" textAnchor="middle" fontSize="8" fill="#d4d4d8" fontFamily="sans-serif">
          MCO
        </text>
      </svg>
    );
  }
  return <img src={src} alt={alt} onError={() => setRota(true)} className="h-24 w-24 flex-shrink-0 rounded-lg bg-zinc-800 object-cover" />;
}

export default function ListaPodcasts({ episodes }: { episodes: PodcastEpisode[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activo, setActivo] = useState<PodcastEpisode | null>(null);

  function reproducir(episodio: PodcastEpisode, segundo = 0) {
    const audio = audioRef.current;
    if (!audio) return;
    setActivo(episodio);
    const saltar = () => {
      audio.currentTime = segundo;
      void audio.play();
    };
    const origen = audio.getAttribute("src");
    if (origen !== episodio.audioUrl) {
      audio.src = episodio.audioUrl;
      audio.addEventListener("loadedmetadata", saltar, { once: true });
      audio.load();
      return;
    }
    saltar();
  }

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-xl font-bold text-zinc-200">Episodios disponibles</h2>
        {episodes.length === 0 ? (
          <p className="text-sm text-zinc-500">Aún no hay episodios publicados.</p>
        ) : (
          <div className="grid gap-6">
            {episodes.map((episodio) => {
              const capitulos = capitulosDe(episodio);
              const whatsapp =
                episodio.id === "mco-001"
                  ? WHATSAPP_EPISODIO
                  : `https://wa.me/522727258748?text=${encodeURIComponent(`Hola, escuché ${episodio.title}`)}`;
              return (
                <article key={episodio.id} id={episodio.slug} className="flex flex-col items-start gap-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 md:flex-row">
                  <Portada src={episodio.coverImageUrl} alt={episodio.title} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Temporada {episodio.season} · Episodio {episodio.episodeNumber}
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100">{episodio.title}</h3>
                    <p className="mb-3 mt-1 text-sm text-zinc-400">{episodio.summary}</p>
                    {capitulos.length ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {capitulos.map((capitulo) => (
                          <button
                            key={`${episodio.id}-${capitulo.time}`}
                            type="button"
                            onClick={() => reproducir(episodio, capitulo.time)}
                            className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-emerald-300 hover:border-emerald-500"
                          >
                            [{marca(capitulo.time)}] {capitulo.title}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => reproducir(episodio, 0)}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
                      >
                        Reproducir
                      </button>
                      <a href={episodio.audioUrl} download className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200">
                        Descargar audio
                      </a>
                      <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200">
                        WhatsApp
                      </a>
                      {episodio.spotifyUrl ? (
                        <a href={episodio.spotifyUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                          Escuchar en Spotify
                        </a>
                      ) : null}
                      {episodio.youtubeUrl ? (
                        <a href={episodio.youtubeUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                          Ver en YouTube
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-md ${activo ? "" : "pointer-events-none opacity-0"}`}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <p className="truncate text-sm text-emerald-300">{activo?.title}</p>
          <audio ref={audioRef} controls preload="none" className="w-full" />
        </div>
      </div>
    </>
  );
}
