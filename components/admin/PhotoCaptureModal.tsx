"use client";

import { useEffect, useRef, useState } from "react";

type ProductoFoto = {
  sku: string;
  nombre: string;
  departamento: string;
  categoria: string;
  costo: number;
  precio: number;
  imagen_url: string;
};

type Props = {
  skuInicial?: string;
  onClose: () => void;
  onSaved: (sku: string, imagenUrl: string) => void;
};

export default function PhotoCaptureModal({ skuInicial = "", onClose, onSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const [camaras, setCamaras] = useState<{ deviceId: string; label: string }[]>([]);
  const [camaraId, setCamaraId] = useState("");
  const [consulta, setConsulta] = useState(skuInicial);
  const [sinFoto, setSinFoto] = useState(!skuInicial);
  const [resultados, setResultados] = useState<ProductoFoto[]>([]);
  const [producto, setProducto] = useState<ProductoFoto | null>(null);
  const [capturada, setCapturada] = useState(false);
  const [brillo, setBrillo] = useState(100);
  const [contraste, setContraste] = useState(100);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [arrastre, setArrastre] = useState(false);

  function soltarCamara() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function abrirCamara(deviceId?: string) {
    soltarCamara();
    if (!navigator.mediaDevices?.getUserMedia) {
      setAviso("Este navegador no puede abrir la cámara.");
      return;
    }
    const video = deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
      : { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const lista = await navigator.mediaDevices.enumerateDevices();
      const cams = lista
        .filter((item) => item.kind === "videoinput")
        .map((item, indice) => ({ deviceId: item.deviceId, label: item.label || `Cámara ${indice + 1}` }));
      setCamaras(cams);
      if (!deviceId && cams[0]) setCamaraId(cams[0].deviceId);
      setAviso("");
    } catch {
      setAviso("No se concedió permiso de cámara. Puedes soltar una foto desde el explorador.");
    }
  }

  useEffect(() => {
    abrirCamara().catch(() => setAviso("No se pudo iniciar la cámara."));
    return () => soltarCamara();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (consulta.trim()) params.set("q", consulta.trim());
      if (sinFoto) params.set("sinFoto", "1");
      fetch(`/api/admin/catalogo/foto?${params.toString()}`, { cache: "no-store" })
        .then((respuesta) => respuesta.json())
        .then((cuerpo) => setResultados(Array.isArray(cuerpo.productos) ? cuerpo.productos : []))
        .catch(() => setResultados([]));
    }, 180);
    return () => clearTimeout(timer);
  }, [consulta, sinFoto]);

  function pintar(imagen: CanvasImageSource) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 1200;
    canvas.height = 1200;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 1200);
    ctx.filter = `brightness(${brillo}%) contrast(${contraste}%)`;
    const ancho = "videoWidth" in imagen ? Number(imagen.videoWidth) : Number((imagen as HTMLImageElement).naturalWidth);
    const alto = "videoHeight" in imagen ? Number(imagen.videoHeight) : Number((imagen as HTMLImageElement).naturalHeight);
    const lado = Math.min(ancho, alto);
    const origenX = (ancho - lado) / 2;
    const origenY = (alto - lado) / 2;
    ctx.drawImage(imagen, origenX, origenY, lado, lado, 0, 0, 1200, 1200);
    ctx.filter = "none";
  }

  function capturar() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setAviso("La cámara todavía no está lista.");
      return;
    }
    const temporal = document.createElement("canvas");
    const ctx = temporal.getContext("2d");
    if (!ctx) return;
    const lado = Math.min(video.videoWidth, video.videoHeight);
    temporal.width = lado;
    temporal.height = lado;
    ctx.drawImage(video, (video.videoWidth - lado) / 2, (video.videoHeight - lado) / 2, lado, lado, 0, 0, lado, lado);
    const imagen = new Image();
    imagen.onload = () => {
      baseRef.current = imagen;
      setCapturada(true);
      setAviso("Encuadre congelado. Ajusta brillo y contraste o guarda la foto.");
    };
    imagen.src = temporal.toDataURL("image/png");
    soltarCamara();
  }

  function repetir() {
    setCapturada(false);
    setBrillo(100);
    setContraste(100);
    baseRef.current = null;
    abrirCamara(camaraId).catch(() => setAviso("No se pudo reabrir la cámara."));
  }

  useEffect(() => {
    if (capturada && baseRef.current) pintar(baseRef.current);
  }, [brillo, contraste, capturada]);

  function cargarArchivo(archivo: File) {
    const lector = new FileReader();
    lector.onload = () => {
      const imagen = new Image();
      imagen.onload = () => {
        baseRef.current = imagen;
        setCapturada(true);
        soltarCamara();
        pintar(imagen);
        setAviso("Foto cargada desde el explorador.");
      };
      imagen.src = String(lector.result || "");
    };
    lector.readAsDataURL(archivo);
  }

  async function guardar() {
    if (!producto) {
      setAviso("Elige el SKU antes de guardar.");
      return;
    }
    const canvas = canvasRef.current;
    if (!capturada || !canvas) {
      setAviso("Captura o suelta una foto primero.");
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await fetch("/api/admin/catalogo/foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: producto.sku, imageBase64: canvas.toDataURL("image/jpeg", 0.92) }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok || !cuerpo.success) throw new Error(cuerpo.detail || "No se guardó la foto.");
      onSaved(cuerpo.sku, cuerpo.imagen_url);
      soltarCamara();
      onClose();
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se guardó la foto.");
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() {
    soltarCamara();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="my-4 w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Estudio de producto</p>
            <h2 className="mt-1 text-2xl font-black text-white">Captura 1:1</h2>
          </div>
          <button type="button" onClick={cerrar} className="min-h-12 rounded-xl bg-slate-800 px-4 text-sm font-bold">
            Cerrar
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div>
            <input
              value={consulta}
              onChange={(evento) => setConsulta(evento.target.value)}
              placeholder="Buscar SKU o nombre"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setSinFoto((actual) => !actual)}
              className={sinFoto ? "mt-2 min-h-12 w-full rounded-xl bg-amber-500 px-3 text-sm font-bold text-zinc-950" : "mt-2 min-h-12 w-full rounded-xl border border-slate-700 px-3 text-sm font-bold"}
            >
              Mostrar solo productos sin foto
            </button>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {resultados.map((item) => (
                <button
                  key={item.sku}
                  type="button"
                  onClick={() => setProducto(item)}
                  className={producto?.sku === item.sku ? "w-full rounded-xl border border-amber-400 bg-amber-500/10 px-3 py-2 text-left" : "w-full rounded-xl border border-slate-800 px-3 py-2 text-left"}
                >
                  <span className="block font-mono text-xs text-amber-200">{item.sku}</span>
                  <span className="block text-sm font-semibold">{item.nombre}</span>
                </button>
              ))}
            </div>
            {producto ? (
              <div className="mt-3 rounded-xl border border-slate-800 p-3 text-sm">
                <p className="font-bold text-white">{producto.nombre}</p>
                <p className="text-slate-400">{producto.departamento || producto.categoria || "Sin departamento"}</p>
                <p className="mt-1">Costo ${producto.costo.toFixed(2)} · Precio ${producto.precio.toFixed(2)}</p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <select
                value={camaraId}
                onChange={(evento) => {
                  setCamaraId(evento.target.value);
                  if (!capturada) abrirCamara(evento.target.value).catch(() => setAviso("No se pudo cambiar de cámara."));
                }}
                className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
              >
                {camaras.length === 0 ? <option value="">Cámara del dispositivo</option> : null}
                {camaras.map((camara) => (
                  <option key={camara.deviceId} value={camara.deviceId}>
                    {camara.label}
                  </option>
                ))}
              </select>
            </div>
            <div
              onDragOver={(evento) => {
                evento.preventDefault();
                setArrastre(true);
              }}
              onDragLeave={() => setArrastre(false)}
              onDrop={(evento) => {
                evento.preventDefault();
                setArrastre(false);
                const archivo = evento.dataTransfer.files?.[0];
                if (archivo) cargarArchivo(archivo);
              }}
              className={arrastre ? "relative mx-auto aspect-square w-full max-w-[32rem] overflow-hidden rounded-3xl border-2 border-amber-400" : "relative mx-auto aspect-square w-full max-w-[32rem] overflow-hidden rounded-3xl border border-slate-700"}
            >
              <video ref={videoRef} autoPlay playsInline muted className={capturada ? "hidden" : "h-full w-full object-cover"} />
              <canvas ref={canvasRef} className={capturada ? "h-full w-full" : "hidden"} />
              <div className="pointer-events-none absolute inset-[8%] rounded-2xl border-2 border-white/80" />
            </div>
            <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-600 text-sm font-semibold">
              Arrastra una foto o elige archivo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(evento) => {
                  const archivo = evento.target.files?.[0];
                  if (archivo) cargarArchivo(archivo);
                }}
              />
            </label>
            {capturada ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Brillo {brillo}%
                  <input type="range" min={50} max={150} value={brillo} onChange={(evento) => setBrillo(Number(evento.target.value))} className="mt-1 w-full" />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Contraste {contraste}%
                  <input type="range" min={50} max={150} value={contraste} onChange={(evento) => setContraste(Number(evento.target.value))} className="mt-1 w-full" />
                </label>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {capturada ? (
                <button type="button" onClick={repetir} className="min-h-12 rounded-xl bg-slate-800 px-4 text-sm font-bold">
                  🔄 Repetir
                </button>
              ) : (
                <button type="button" onClick={capturar} className="min-h-12 rounded-xl bg-white px-4 text-sm font-bold text-slate-950">
                  📸 Capturar Foto
                </button>
              )}
              <button type="button" onClick={guardar} disabled={guardando} className="min-h-12 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-zinc-950 disabled:opacity-40">
                {guardando ? "Guardando..." : "💾 Guardar y Asignar"}
              </button>
            </div>
            {aviso ? <p className="mt-3 text-sm text-amber-200">{aviso}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
