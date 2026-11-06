"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type ProductoCatalogo = {
  sku: string;
  nombre: string;
  precio: number;
  imagen_url?: string;
  disponibilidad?: "PREVENTA" | "EN_STOCK";
};

type Mensaje = {
  id: string;
  autor: "cliente" | "asistente";
  texto: string;
  producto?: ProductoCatalogo;
  directCheckout?: boolean;
};

const PRODUCTOS_FALLBACK: ProductoCatalogo[] = [
  {
    sku: "PARAPENTE-TANDEM",
    nombre: "Vuelo tándem de parapente",
    precio: 2900,
    disponibilidad: "EN_STOCK",
    imagen_url: "/images/parapente.jpg",
  },
  {
    sku: "RENTA-EQUIPO",
    nombre: "Renta de equipo outdoor",
    precio: 980,
    disponibilidad: "EN_STOCK",
    imagen_url: "/images/renta.jpg",
  },
  {
    sku: "THE-TRIP-STARTER",
    nombre: "The Trip Starter Pack",
    precio: 650,
    disponibilidad: "EN_STOCK",
    imagen_url: "/images/thetrip.jpg",
  },
];

function normalizar(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function obtenerProductoMasApto(consulta: string, catalogo: ProductoCatalogo[]) {
  const clave = normalizar(consulta);
  if (!clave) return null;

  const ranked = [...catalogo].map((producto) => {
    const nombre = normalizar(producto.nombre);
    const sku = normalizar(producto.sku);
    let score = 0;

    if (nombre.includes(clave)) score += 5;
    if (sku.includes(clave)) score += 4;
    const tokens = clave.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      if (token.length < 2) continue;
      if (nombre.includes(token)) score += 2;
      if (sku.includes(token)) score += 1;
    }

    return { producto, score };
  });

  return ranked.sort((a, b) => b.score - a.score)[0]?.producto ?? null;
}

export default function FloatingSalesAssistant() {
  const router = useRouter();
  const { addItem } = useCart();
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>(PRODUCTOS_FALLBACK);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "welcome",
      autor: "asistente",
      texto: "Hola, soy tu asesor premium de Basecamp 420. Puedo recomendarte una experiencia, cerrar una compra o llevarte al checkout seguro en segundos.",
    },
  ]);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarCatalogo() {
      try {
        const respuesta = await fetch("/api/chat/catalogo", { cache: "no-store" });
        if (!respuesta.ok) return;
        const cuerpo = (await respuesta.json()) as { productos?: ProductoCatalogo[] };
        const lista = Array.isArray(cuerpo.productos) && cuerpo.productos.length > 0 ? cuerpo.productos : PRODUCTOS_FALLBACK;
        if (!cancelado) setCatalogo(lista.slice(0, 6));
      } catch {
        if (!cancelado) setCatalogo(PRODUCTOS_FALLBACK);
      }
    }

    void cargarCatalogo();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const nodo = contenedorRef.current;
    if (!nodo) return;
    nodo.scrollTop = nodo.scrollHeight;
  }, [abierto, mensajes]);

  const inteligencia = useMemo(
    () => [
      { keywords: ["parapente", "vuelo", "tandem", "volar", "montana", "fortin"], tipo: "Parapente" },
      { keywords: ["renta", "equipo", "mochila", "carpa", "camping", "senderismo"], tipo: "Renta" },
      { keywords: ["the trip", "smoke", "cannabis", "producto", "cigarro", "cannabino"], tipo: "The Trip" },
      { keywords: ["pagar", "comprar", "checkout", "reservar", "apartar", "precio"], tipo: "Compra" },
    ],
    []
  );

  const sugerenciasRapidas = ["Parapente", "Renta", "The Trip", "Checkout"];

  const responder = async (entrada: string) => {
    const consulta = entrada.trim();
    if (!consulta) return;

    const entradaCliente: Mensaje = { id: `msg-${Date.now()}-user`, autor: "cliente", texto: consulta };
    setMensajes((actual) => [...actual, entradaCliente]);
    setCargando(true);

    const normalizada = normalizar(consulta);
    let sugerencia: ProductoCatalogo | null = null;

    if (/[pago|comprar|checkout|pagar|reservar|apartar|quiero]/.test(normalizada)) {
      sugerencia = obtenerProductoMasApto(normalizada.replace(/(pago|comprar|checkout|pagar|reservar|apartar|quiero)/g, ""), catalogo) || catalogo[0] || null;
    } else {
      sugerencia = obtenerProductoMasApto(consulta, catalogo) || catalogo[0] || null;
    }

    const intencion = inteligencia.find((item) => item.keywords.some((palabra) => normalizada.includes(normalizar(palabra))));

    const baseTexto =
      intencion && intencion.tipo === "Parapente"
        ? "Estoy viendo la mejor experiencia de parapente tándem para tu perfil."
        : intencion && intencion.tipo === "Renta"
          ? "Tengo opciones premium de renta para aventura, senderismo y montaña."
          : intencion && intencion.tipo === "The Trip"
            ? "Te recomiendo una pieza premium de The Trip con cierre directo y pago seguro."
            : "Puedo ayudarte a convertir esta intención en una compra segura y rápida.";

    const respuestaAsistente: Mensaje = {
      id: `msg-${Date.now()}-assistant`,
      autor: "asistente",
      texto: sugerencia
        ? `${baseTexto} ${sugerencia.nombre} encaja muy bien con lo que buscas.`
        : `${baseTexto} Te llevo a la pasarela oficial para cerrar la venta sin salir del sitio.`,
      producto: sugerencia ?? undefined,
      directCheckout: !!sugerencia,
    };

    window.setTimeout(() => {
      setMensajes((actual) => [...actual, respuestaAsistente]);
      setCargando(false);
    }, 350);
  };

  const abrirCheckout = (producto?: ProductoCatalogo) => {
    const item = producto ?? catalogo[0];
    if (item) {
      addItem({
        sku: item.sku,
        nombre: item.nombre,
        precio: item.precio,
        imagen_url: item.imagen_url || "",
        disponibilidad: item.disponibilidad || "EN_STOCK",
      });
      router.push(`/checkout?sku=${encodeURIComponent(item.sku)}`);
    } else {
      router.push("/checkout");
    }
  };

  const abrirTelefono = () => {
    window.location.href = "tel:+522727258748";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {abierto ? (
        <div className="mb-3 w-[min(92vw,24rem)] overflow-hidden rounded-[1.8rem] border border-emerald-400/40 bg-zinc-950/95 shadow-[0_25px_80px_rgba(16,185,129,0.18)] backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-emerald-500/20 via-zinc-900 to-amber-400/15 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 text-lg font-black text-zinc-950 shadow-lg shadow-emerald-500/30">
                B
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Basecamp 420</p>
                <p className="text-sm font-bold text-white">Asesor premium</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                online
              </span>
              <button type="button" onClick={() => setAbierto(false)} className="min-h-9 rounded-xl border border-zinc-700 px-2 text-[10px] font-bold text-zinc-200 transition hover:border-zinc-500">
                Cerrar
              </button>
            </div>
          </header>

          <div className="bg-zinc-900/80 px-3 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sugerenciasRapidas.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => void responder(sugerencia)}
                  className="whitespace-nowrap rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-[10px] font-bold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>

          <div ref={contenedorRef} className="max-h-[28rem] space-y-3 overflow-y-auto px-4 py-4">
            {mensajes.map((mensaje) => (
              <div key={mensaje.id} className={mensaje.autor === "cliente" ? "ml-8 flex justify-end" : "mr-8 flex justify-start"}>
                <div className={mensaje.autor === "cliente" ? "rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-300 px-3 py-2 text-sm font-medium text-zinc-950 shadow-lg shadow-emerald-500/20" : "rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-800"}>
                  <p>{mensaje.texto}</p>

                  {mensaje.producto ? (
                    <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950/80 p-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-11 w-11 overflow-hidden rounded-lg bg-zinc-800">
                          {mensaje.producto.imagen_url ? <img src={mensaje.producto.imagen_url} alt={mensaje.producto.nombre} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-zinc-200">{mensaje.producto.nombre}</p>
                          <p className="mt-0.5 text-[10px] text-emerald-300">${Number(mensaje.producto.precio).toLocaleString("es-MX")} MXN</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {mensaje.directCheckout && mensaje.producto ? (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => abrirCheckout(mensaje.producto)}
                        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 px-3 text-[11px] font-black text-zinc-950 transition hover:brightness-110"
                      >
                        Pago Directo en Web
                      </button>
                      <button
                        type="button"
                        onClick={abrirTelefono}
                        className="flex min-h-11 w-full items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-500/20"
                      >
                        Hablar con un Agente Especialista en Ventas
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {cargando ? (
              <div className="mr-8 flex justify-start">
                <div className="rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-zinc-200 ring-1 ring-zinc-800">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Analizando mejor opción...
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="flex gap-2 border-t border-zinc-800 bg-zinc-950 p-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              const valor = mensaje.trim();
              if (!valor) return;
              setMensaje("");
              void responder(valor);
            }}
          >
            <input
              value={mensaje}
              onChange={(evento) => setMensaje(evento.target.value)}
              placeholder="Escribe: parapente, The Trip, renta..."
              className="min-h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
            <button type="submit" className="min-h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-3 text-sm font-black text-zinc-950 transition hover:brightness-110">
              Enviar
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="group relative flex items-center gap-3 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 px-4 py-3 text-sm font-black text-zinc-950 shadow-[0_18px_55px_rgba(16,185,129,0.38)] transition hover:scale-[1.02]"
        aria-label="Abrir asistente premium de ventas"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-lg text-emerald-300 shadow-inner shadow-emerald-400/20">
          ✦
        </span>
        <span className="hidden sm:inline">Asistente premium</span>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg">
          1
        </span>
      </button>
    </div>
  );
}
