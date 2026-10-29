"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SLOT_OPTIONS = ["10:00", "12:00", "14:00", "16:00"];

function money(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminCheckinPage() {
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [folioInput, setFolioInput] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string; data?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [manualOnly, setManualOnly] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") return;

    const initScanner = async () => {
      try {
        const cameraId = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          return "environment";
        });

        if (!mounted || !scannerRef.current) return;
        const html5QrCode = new Html5Qrcode("bc420-checkin-scanner");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (!mounted) return;
            const folio = decodedText.replace(/.*\//, "").trim();
            setFolioInput(folio || decodedText);
            await validateFolio(folio || decodedText);
          },
          () => undefined
        );
      } catch {
        if (mounted) setManualOnly(true);
      }
    };

    initScanner();
    return () => {
      mounted = false;
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        void scanner.stop().catch(() => undefined);
      }
    };
  }, []);

  const validateFolio = async (folio: string) => {
    const normalized = folio.trim();
    if (!normalized) {
      setStatus({ ok: false, message: "Escribe o escanea un folio válido." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/comprobante/validate/${encodeURIComponent(normalized)}`);
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setStatus({ ok: false, message: data.message || "Folio no encontrado o inválido." });
      } else {
        setStatus({ ok: true, message: `Voucher válido para ${data.customer}.`, data });
      }
    } catch {
      setStatus({ ok: false, message: "No fue posible consultar el voucher." });
    } finally {
      setLoading(false);
    }
  };

  const redeemFolio = async () => {
    const normalized = folioInput.trim();
    if (!normalized) {
      setStatus({ ok: false, message: "Folio requerido para canjear." });
      return;
    }
    setRedeeming(true);
    try {
      const response = await fetch(`/api/comprobante/redeem/${encodeURIComponent(normalized)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator: "checkin-pista" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus({ ok: false, message: data.message || "No se pudo completar el canje." });
      } else {
        setStatus({ ok: true, message: data.message || "Vuelo canjeado correctamente.", data });
      }
    } catch {
      setStatus({ ok: false, message: "Error al registrar el canje del folio." });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Basecamp 420</p>
            <h1 className="mt-2 text-3xl font-black text-white">Check-in en Pista / Escáner QR</h1>
          </div>
          <a href="/admin/pedidos" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400">
            Regresar al panel
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Escáner de voucher</h2>
              {manualOnly ? <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-300">Cámara no disponible</span> : <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">Escáner activo</span>}
            </div>

            <div id="bc420-checkin-scanner" ref={scannerRef} className="mx-auto h-[280px] w-full max-w-[320px] overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950" />

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Folio manual</label>
              <div className="flex gap-3">
                <input
                  value={folioInput}
                  onChange={(event) => setFolioInput(event.target.value)}
                  placeholder="BC420-XXXXXX"
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void validateFolio(folioInput)}
                  className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950"
                >
                  Validar
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Resultado del voucher</h2>
            <div className={`mt-4 rounded-2xl border p-4 ${status?.ok ? "border-emerald-500 bg-emerald-500/10 text-emerald-200" : status ? "border-red-500 bg-red-500/10 text-red-200" : "border-neutral-700 bg-neutral-950/70 text-neutral-300"}`}>
              {status ? status.message : "Escanea o ingresa un folio para verificar el pase de abordar."}
            </div>

            {status?.data ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-neutral-700 bg-neutral-950/60 p-4 text-sm text-neutral-200">
                <div><span className="text-neutral-400">Cliente:</span> <span className="font-semibold text-white">{status.data.customer}</span></div>
                <div><span className="text-neutral-400">Producto:</span> <span className="font-semibold text-white">{status.data.product}</span></div>
                <div><span className="text-neutral-400">Monto:</span> <span className="font-semibold text-white">{money(status.data.amount)}</span></div>
                <div><span className="text-neutral-400">Estado:</span> <span className="font-semibold text-white">{status.data.status}</span></div>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => void redeemFolio()}
                disabled={!status?.ok || redeeming || loading}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {redeeming ? "Canjeando..." : "Completar Vuelo / Canjear Ticket"}
              </button>
              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Slots oficiales</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SLOT_OPTIONS.map((slot) => (
                    <span key={slot} className="rounded-full border border-neutral-700 px-2.5 py-1 text-xs font-semibold text-neutral-300">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
