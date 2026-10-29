"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CameraDevice = {
  deviceId: string;
  label: string;
};

interface PosPhotoCaptureModalProps {
  sku: string;
  productName?: string;
  onClose: () => void;
  onSaved?: (url: string) => void;
}

export default function PosPhotoCaptureModal({
  sku,
  productName,
  onClose,
  onSaved,
}: PosPhotoCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [capturedDataUrl, setCapturedDataUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const canCapture = useMemo(() => Boolean(videoRef.current && streamRef.current), [selectedDeviceId]);

  async function stopCamera() {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function loadDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const listed = await navigator.mediaDevices.enumerateDevices();
    const cameras = listed
      .filter((device) => device.kind === "videoinput")
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Cámara ${index + 1}`,
      }));
    setDevices(cameras);
    if (!selectedDeviceId && cameras[0]) {
      setSelectedDeviceId(cameras[0].deviceId);
    }
  }

  async function startCamera(deviceId?: string) {
    await stopCamera();
    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
        : { width: 1280, height: 720 },
      audio: false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      setStatus("La cámara todavía no está lista.");
      return;
    }
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const jpg = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedDataUrl(jpg);
    setStatus("Foto capturada. Ahora guarda y asigna al SKU.");
  }

  async function saveToSku() {
    if (!capturedDataUrl) {
      setStatus("Captura primero una foto.");
      return;
    }
    setSaving(true);
    setStatus("Guardando foto...");
    try {
      const response = await fetch("/api/pos/upload-sample-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          image_data_url: capturedDataUrl,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; url?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No se pudo guardar la foto.");
      }
      setStatus("Foto asignada al SKU correctamente.");
      if (data.url && onSaved) onSaved(data.url);
      onClose();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la foto.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    setStatus("Inicializando cámara...");
    (async () => {
      try {
        await startCamera();
        await loadDevices();
        if (mounted) setStatus("Espacio: capturar · F10: omitir");
      } catch {
        if (mounted) setStatus("No se pudo abrir la webcam. Revisa permisos del navegador.");
      }
    })();
    return () => {
      mounted = false;
      void stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    void startCamera(selectedDeviceId).catch(() => setStatus("No se pudo cambiar a esa cámara."));
  }, [selectedDeviceId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        captureFrame();
      }
      if (event.code === "F10") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">Captura rápida de producto</h3>
            <p className="text-xs text-slate-400">
              SKU: <span className="font-mono text-emerald-300">{sku}</span>
              {productName ? ` · ${productName}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold">
            Omitir por ahora (F10)
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-slate-800 bg-black p-2">
            <video ref={videoRef} autoPlay muted playsInline className="h-[420px] w-full rounded-lg object-contain" />
          </div>
          <aside className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Cámara activa
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">Predeterminada</option>
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={captureFrame}
              disabled={!canCapture}
              className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-sm font-black text-slate-950 disabled:opacity-50"
            >
              Disparar captura (Espacio)
            </button>

            <button
              onClick={() => void saveToSku()}
              disabled={!capturedDataUrl || saving}
              className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-slate-950 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar y Asignar a SKU"}
            </button>

            <p className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">{status}</p>

            {capturedDataUrl ? (
              <img src={capturedDataUrl} alt="Captura" className="w-full rounded-lg border border-slate-700 object-cover" />
            ) : null}
          </aside>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
