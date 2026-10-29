"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type QueueStatus = "PENDIENTE_REVISION" | "APROBADO" | "PUBLICADO" | "DESCARTADO" | "ERROR";

type QueueItem = {
  id: string;
  sourceVideoId: string;
  sourceTitle: string;
  proposedTitle: string;
  proposedDescription: string;
  tags: string[];
  pinnedComment: string;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

type DraftState = Record<string, Pick<QueueItem, "proposedTitle" | "proposedDescription">>;

export default function AdminAutopilotPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [drafts, setDrafts] = useState<DraftState>({});

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/autopilot/queue", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo cargar la cola.");
      setItems(data.items || []);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "No se pudo leer la cola.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "PENDIENTE_REVISION").length,
    [items]
  );

  const getDraft = (item: QueueItem) =>
    drafts[item.id] || {
      proposedTitle: item.proposedTitle,
      proposedDescription: item.proposedDescription,
    };

  const saveDraft = async (item: QueueItem) => {
    const draft = getDraft(item);
    const response = await fetch("/api/autopilot/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        proposedTitle: draft.proposedTitle,
        proposedDescription: draft.proposedDescription,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "No fue posible guardar cambios.");
  };

  const runGenerate = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const response = await fetch("/api/autopilot/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo generar el lote.");
      setMessage(`Se generaron ${data.generated} videos para revisión.`);
      await loadQueue();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "No se pudo generar el lote.");
    } finally {
      setGenerating(false);
    }
  };

  const resolveItem = async (item: QueueItem, action: "APROBAR" | "DESCARTAR") => {
    setMessage("");
    try {
      if (action === "APROBAR") {
        await saveDraft(item);
      }
      const draft = getDraft(item);
      const response = await fetch(`/api/autopilot/approve/${encodeURIComponent(item.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          proposedTitle: draft.proposedTitle,
          proposedDescription: draft.proposedDescription,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo actualizar el estado.");
      setMessage(action === "APROBAR" ? "Elemento aprobado y enviado a publicación." : "Elemento descartado.");
      await loadQueue();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "No se pudo procesar el elemento.");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Autopilot Studio</p>
            <h1 className="mt-2 text-3xl font-black text-white">YouTube Conversion Funnel Ops</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Cola Human-in-the-Loop con {pendingCount} elemento(s) pendiente(s) de revisión.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void runGenerate()}
            disabled={generating}
            className="rounded-2xl border border-amber-400 bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-amber-300 disabled:opacity-50"
          >
            ⚡ Generar Todo para Revisión (1-Click)
          </button>
        </div>

        {message ? (
          <div className="mb-5 rounded-xl border border-cyan-700/50 bg-cyan-900/20 px-4 py-3 text-sm text-cyan-200">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-5 text-sm text-neutral-300">
            Cargando cola de autopilot...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const draft = getDraft(item);
              return (
                <article key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-lg">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {item.status}
                    </span>
                    <span className="text-[11px] text-neutral-500">{item.sourceVideoId}</span>
                  </div>
                  <p className="mb-3 text-xs text-neutral-500">{item.sourceTitle}</p>

                  <label className="mb-2 block text-xs font-semibold text-neutral-300">Título propuesto</label>
                  <input
                    value={draft.proposedTitle}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...draft,
                          proposedTitle: event.target.value,
                        },
                      }))
                    }
                    className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
                  />

                  <label className="mb-2 block text-xs font-semibold text-neutral-300">Descripción</label>
                  <textarea
                    value={draft.proposedDescription}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...draft,
                          proposedDescription: event.target.value,
                        },
                      }))
                    }
                    rows={6}
                    className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
                  />

                  <div className="mb-3 text-xs text-neutral-400">
                    <strong className="text-neutral-300">Tags:</strong> {item.tags.join(", ")}
                  </div>
                  {item.error ? (
                    <div className="mb-3 rounded-lg border border-red-600/40 bg-red-900/20 px-3 py-2 text-xs text-red-200">
                      Error: {item.error}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void resolveItem(item, "DESCARTAR")}
                      className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-700"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={() => void resolveItem(item, "APROBAR")}
                      className="rounded-lg border border-emerald-500 bg-emerald-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400"
                    >
                      Aprobar y Publicar en YouTube
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
