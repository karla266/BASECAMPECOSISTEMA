import { promises as fs } from "fs";
import path from "path";
import { etiquetaPunto, leerMenu, pesosDesdeCentavos, type PuntoEntregaId } from "@/lib/palapa-menu";

const ARCHIVO = path.join(process.cwd(), "data", "ordenes_palapa.json");

export type LineaPalapa = {
  id: string;
  nombre: string;
  cantidad: number;
  precioCentavos: number;
};

export type OrdenPalapa = {
  id: string;
  referencia: string;
  nombre: string;
  telefono: string;
  punto: PuntoEntregaId;
  puntoEtiqueta: string;
  notas: string;
  items: LineaPalapa[];
  totalCentavos: number;
  estatus: "pendiente" | "pagado" | "cancelado";
  pagoId?: string;
  avisoWhatsapp: "pendiente" | "enviado";
  creadaEn: string;
  pagadaEn?: string;
};

async function leerOrdenes() {
  try {
    const texto = await fs.readFile(ARCHIVO, "utf8");
    const lista = JSON.parse(texto) as OrdenPalapa[];
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function guardarOrdenes(ordenes: OrdenPalapa[]) {
  await fs.mkdir(path.dirname(ARCHIVO), { recursive: true });
  const temporal = `${ARCHIVO}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(ordenes, null, 2), "utf8");
  await fs.rename(temporal, ARCHIVO);
}

export async function buscarOrdenPalapa(id: string) {
  const ordenes = await leerOrdenes();
  return ordenes.find((orden) => orden.id === id || orden.referencia === id) || null;
}

export async function crearOrdenPalapa(entrada: {
  nombre: string;
  telefono: string;
  punto: string;
  notas?: string;
  items: Array<{ id?: string; cantidad?: number }>;
}) {
  const nombre = entrada.nombre.trim().replace(/\s+/g, " ");
  const telefono = entrada.telefono.replace(/\D/g, "");
  const punto = etiquetaPunto(entrada.punto);
  if (nombre.length < 3) return { error: "Escribe el nombre del cliente." as const };
  if (!/^\d{10}$/.test(telefono)) return { error: "El WhatsApp debe tener 10 dígitos." as const };
  if (!punto) return { error: "Elige el punto de entrega." as const };
  const catalogo = new Map(leerMenu().filter((producto) => producto.disponible).map((producto) => [producto.id, producto]));
  const items: LineaPalapa[] = [];
  for (const linea of entrada.items) {
    const producto = catalogo.get(String(linea.id || ""));
    const cantidad = Math.trunc(Number(linea.cantidad));
    if (!producto || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 30) continue;
    if (!Number.isInteger(producto.precio) || producto.precio < 0) {
      return { error: "Hay un precio de menú inválido." as const };
    }
    items.push({
      id: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioCentavos: producto.precio * 100,
    });
  }
  if (!items.length) return { error: "Agrega al menos un producto disponible." as const };
  const totalCentavos = items.reduce((total, linea) => total + linea.precioCentavos * linea.cantidad, 0);
  const id = `pal-${Date.now()}`;
  const orden: OrdenPalapa = {
    id,
    referencia: `PALAPA-${id}`,
    nombre,
    telefono,
    punto: entrada.punto as PuntoEntregaId,
    puntoEtiqueta: punto,
    notas: String(entrada.notas || "").trim().slice(0, 240),
    items,
    totalCentavos,
    estatus: "pendiente",
    avisoWhatsapp: "pendiente",
    creadaEn: new Date().toISOString(),
  };
  const ordenes = await leerOrdenes();
  ordenes.unshift(orden);
  await guardarOrdenes(ordenes);
  return { orden };
}

export async function cancelarOrdenPalapa(id: string) {
  const ordenes = await leerOrdenes();
  const indice = ordenes.findIndex((orden) => orden.id === id);
  if (indice < 0 || ordenes[indice].estatus === "pagado") return;
  ordenes[indice] = { ...ordenes[indice], estatus: "cancelado" };
  await guardarOrdenes(ordenes);
}

export function preferenciaMercadoPago(orden: OrdenPalapa, sitio: string) {
  return {
    items: orden.items.map((linea) => ({
      id: linea.id,
      title: linea.nombre,
      quantity: linea.cantidad,
      currency_id: "MXN",
      unit_price: linea.precioCentavos / 100,
    })),
    payer: {
      name: orden.nombre,
      phone: { number: orden.telefono },
    },
    back_urls: {
      success: `${sitio}/ordenar/exito?orden=${orden.id}`,
      failure: `${sitio}/ordenar?pago=rechazado`,
      pending: `${sitio}/ordenar/exito?orden=${orden.id}&estado=pendiente`,
    },
    auto_return: "approved",
    ...(sitio.startsWith("https://") ? { notification_url: `${sitio}/api/webhooks/mercadopago` } : {}),
    statement_descriptor: "BASECAMP 420",
    external_reference: orden.referencia,
    metadata: {
      product_type: "pedido_palapa",
      orden_id: orden.id,
      telefono: orden.telefono,
      nombre: orden.nombre,
      punto: orden.puntoEtiqueta,
    },
  };
}

export function mensajeConfirmacion(orden: OrdenPalapa) {
  const detalle = orden.items.map((linea) => `- ${linea.cantidad} x ${linea.nombre}`).join("\n");
  const notas = orden.notas ? `\n${orden.notas}` : "";
  return [
    "🍻 *¡Pago confirmado en Mercado Pago! - Basecamp 420*",
    "",
    `Hola ${orden.nombre}, tu pago por $${pesosDesdeCentavos(orden.totalCentavos)} MXN ya cayó a Mercado Pago y tu pedido está confirmado:`,
    `${detalle}${notas}`,
    "",
    `📍 *Punto de entrega:* ${orden.puntoEtiqueta}`,
    "⏰ Tu comida y bebidas estarán listas para cuando aterrices o toques base. Dudas directas al 2727258748.",
  ].join("\n");
}

export async function confirmarPagoPalapa(referencia: string, pagoId: string) {
  const ordenes = await leerOrdenes();
  const indice = ordenes.findIndex((orden) => orden.referencia === referencia || orden.id === referencia.replace(/^PALAPA-/, ""));
  if (indice < 0) throw new Error("La orden de palapa no está en el registro local.");
  const actual = ordenes[indice];
  if (actual.avisoWhatsapp === "enviado") return actual;
  const pagada: OrdenPalapa = {
    ...actual,
    estatus: "pagado",
    pagoId,
    pagadaEn: actual.pagadaEn || new Date().toISOString(),
  };
  ordenes[indice] = pagada;
  await guardarOrdenes(ordenes);
  await enviarWhatsapp(pagada);
  ordenes[indice] = { ...pagada, avisoWhatsapp: "enviado" };
  await guardarOrdenes(ordenes);
  return ordenes[indice];
}

async function enviarWhatsapp(orden: OrdenPalapa) {
  const base = (process.env.WHATSAPP_API_BASE || "http://127.0.0.1:8005").replace(/\/$/, "");
  const respuesta = await fetch(`${base}/api/v1/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telefono: `52${orden.telefono}`,
      mensaje: mensajeConfirmacion(orden),
    }),
  });
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`El aviso de WhatsApp no salió (${respuesta.status}). ${detalle.slice(0, 180)}`);
  }
}
