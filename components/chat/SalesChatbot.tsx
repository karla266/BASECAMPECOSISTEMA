"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type DisponibilidadCarrito } from "@/context/CartContext";

type ProductoChat = {
  sku: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  disponibilidad: DisponibilidadCarrito;
};

type Mensaje = {
  id: string;
  autor: "cliente" | "asistente";
  texto: string;
  productos?: ProductoChat[];
  pagar?: boolean;
};

function normalizar(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function SalesChatbot() {
  const router = useRouter();
  const { addItem } = useCart();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [catalogo, setCatalogo] = useState<ProductoChat[] | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "inicio",
      autor: "asistente",
      texto: "Puedo buscar un producto, agregarlo al carrito o llevarte al checkout.",
    },
  ]);

  async function cargarCatalogo() {
    if (catalogo) return catalogo;
    const respuesta = await fetch("/api/chat/catalogo");
    const cuerpo = (await respuesta.json()) as { productos?: ProductoChat[] };
    const lista = Array.isArray(cuerpo.productos) ? cuerpo.productos : [];
    setCatalogo(lista);
    return lista;
  }

  function agregar(producto: ProductoChat) {
    addItem({
      sku: producto.sku,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen_url: producto.imagen_url,
      disponibilidad: producto.disponibilidad,
    });
  }

  async function responder(entrada: string) {
    const limpio = entrada.trim();
    if (!limpio) return;
    const consulta = normalizar(limpio);
    const propio: Mensaje = { id: `${Date.now()}-c`, autor: "cliente", texto: limpio };
    if (/(pagar|checkout|comprar ahora|apartar)/.test(consulta)) {
      setMensajes((actual) => [
        ...actual,
        propio,
        { id: `${Date.now()}-a`, autor: "asistente", texto: "Te llevo al checkout para pagar con Mercado Pago.", pagar: true },
      ]);
      router.push("/checkout");
      return;
    }
    const lista = await cargarCatalogo();
    const coincidencias = lista.filter((producto) => normalizar(producto.nombre).includes(consulta) || normalizar(producto.sku).includes(consulta)).slice(0, 4);
    const sugeridos = coincidencias.length > 0 ? coincidencias : lista.slice(0, 3);
    setMensajes((actual) => [
      ...actual,
      propio,
      {
        id: `${Date.now()}-a`,
        autor: "asistente",
        texto: coincidencias.length > 0 ? "Encontré esto en el catálogo. Puedes agregarlo al carrito." : "No hubo una coincidencia exacta. Estas piezas están disponibles.",
        productos: sugeridos,
      },
    ]);
  }

  function dictar() {
    const ventana = typeof window !== "undefined" ? (window as any) : {};
    const Constructor = ventana.SpeechRecognition || ventana.webkitSpeechRecognition;
    if (!Constructor) {
      setMensajes((actual) => [...actual, { id: `${Date.now()}-v`, autor: "asistente", texto: "Este navegador no tiene dictado. Escribe el producto." }]);
      return;
    }
    const reconocimiento = new Constructor();
    reconocimiento.lang = "es-MX";
    reconocimiento.onresult = (evento: any) => {
      const dicho = evento.results?.[0]?.[0]?.transcript || "";
      setTexto(dicho);
      setEscuchando(false);
      void responder(dicho);
    };
    reconocimiento.onerror = () => setEscuchando(false);
    reconocimiento.onend = () => setEscuchando(false);
    setEscuchando(true);
    reconocimiento.start();
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(100vw-2rem,22rem)]">
      {abierto ? (
        <section className="mb-3 flex max-h-[70vh] flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
          <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-black">Asistente de The Trip</h2>
            <button type="button" onClick={() => setAbierto(false)} className="min-h-12 rounded-xl px-3 text-sm font-bold">
              Cerrar
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {mensajes.map((mensaje) => (
              <article key={mensaje.id} className={mensaje.autor === "cliente" ? "ml-8 rounded-2xl bg-zinc-800 px-3 py-2 text-sm" : "mr-6 rounded-2xl bg-zinc-900 px-3 py-2 text-sm"}>
                <p>{mensaje.texto}</p>
                {mensaje.productos?.map((producto) => (
                  <button key={producto.sku} type="button" onClick={() => agregar(producto)} className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl bg-amber-500 px-3 text-left text-xs font-black text-zinc-950">
                    <span>{producto.nombre}</span>
                    <span>${producto.precio.toFixed(2)}</span>
                  </button>
                ))}
                {mensaje.pagar ? (
                  <button type="button" onClick={() => router.push("/checkout")} className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 text-xs font-black text-zinc-950">
                    Ir al checkout
                  </button>
                ) : null}
              </article>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-zinc-800 p-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              const valor = texto;
              setTexto("");
              void responder(valor);
            }}
          >
            <input value={texto} onChange={(evento) => setTexto(evento.target.value)} placeholder="Busca un producto" className="min-h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm" />
            <button type="button" onClick={dictar} aria-label="Dictar" className="min-h-12 min-w-12 rounded-xl border border-zinc-700 text-sm font-black">
              {escuchando ? "…" : "Mic"}
            </button>
            <button type="submit" className="min-h-12 rounded-xl bg-amber-500 px-3 text-sm font-black text-zinc-950">
              Enviar
            </button>
          </form>
        </section>
      ) : null}
      <button type="button" onClick={() => setAbierto((valor) => !valor)} className="ml-auto flex min-h-12 items-center rounded-full bg-amber-500 px-5 text-sm font-black text-zinc-950">
        {abierto ? "Ocultar chat" : "Chat de ventas"}
      </button>
    </div>
  );
}
