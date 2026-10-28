import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const BASES = ["http://127.0.0.1:8110", "http://127.0.0.1:8000"];
const AJUSTES = path.join(process.cwd(), "..", "data", "impresion.json");

function textoSalida(salida: string | Buffer): string {
  const buffer = Buffer.isBuffer(salida) ? salida : Buffer.from(salida);
  if (buffer.length >= 2 && buffer[1] === 0) return buffer.toString("utf16le");
  return buffer.toString("utf8");
}

async function impresorasWindows(): Promise<string[]> {
  if (process.platform !== "win32") return [];
  const { stdout } = await execFileAsync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; @((Get-Printer).Name) | ConvertTo-Json -Compress",
    ],
    { timeout: 20000, windowsHide: true, encoding: "buffer" }
  );
  const crudo = textoSalida(stdout as unknown as Buffer).replace(/^\uFEFF/, "").trim();
  if (!crudo) return [];
  const data = JSON.parse(crudo) as unknown;
  const nombres = (Array.isArray(data) ? data : [data]).filter((nombre): nombre is string => typeof nombre === "string" && nombre.trim() !== "");
  return [...new Set(nombres.map((nombre) => nombre.trim()))].sort((a, b) => a.localeCompare(b, "es"));
}

function leerAjustesLocales() {
  try {
    const data = JSON.parse(fs.readFileSync(AJUSTES, "utf8")) as { ticket_printer?: unknown; label_printer?: unknown };
    return {
      ticket_printer: typeof data.ticket_printer === "string" ? data.ticket_printer : "",
      label_printer: typeof data.label_printer === "string" ? data.label_printer : "",
    };
  } catch {
    return { ticket_printer: "", label_printer: "" };
  }
}

function guardarAjustesLocales(ticket: string, etiquetas: string) {
  fs.mkdirSync(path.dirname(AJUSTES), { recursive: true });
  fs.writeFileSync(AJUSTES, JSON.stringify({ ticket_printer: ticket, label_printer: etiquetas }, null, 2));
}

function detalle(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { detail?: unknown; error?: unknown; message?: unknown };
  if (typeof record.detail === "string") return record.detail;
  if (typeof record.error === "string") return record.error;
  if (typeof record.message === "string") return record.message;
  return null;
}

async function fetchPos(path: string, init?: RequestInit): Promise<Response> {
  let ultimo: Response | null = null;
  for (const base of BASES) {
    try {
      const response = await fetch(`${base}${path}`, { ...init, cache: "no-store" });
      if (response.status === 404) {
        ultimo = response;
        continue;
      }
      return response;
    } catch {
      continue;
    }
  }
  if (ultimo) return ultimo;
  throw new Error("pos-down");
}

function absoluto(ruta: unknown): string {
  if (typeof ruta !== "string" || !ruta) return "";
  if (ruta.startsWith("http")) return ruta;
  return `http://127.0.0.1:8110${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const source = url.searchParams.get("source");
  try {
    if (q !== null || source) {
      const respuesta = await fetchPos(
        `/api/v1/pos/labels/products?q=${encodeURIComponent(q || "")}&source=${encodeURIComponent(source || "local")}&limit=24`
      );
      const data = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        return NextResponse.json({ error: detalle(data) || "No se pudieron leer los productos." }, { status: respuesta.status });
      }
      return NextResponse.json(data);
    }
    let printers: string[] = [];
    try {
      printers = await impresorasWindows();
    } catch {
      printers = [];
    }
    let ticket = "";
    let etiquetas = "";
    let posLeyoAjustes = false;
    try {
      const [impresoras, ajustes] = await Promise.all([
        fetchPos("/api/v1/pos/printers"),
        fetchPos("/api/v1/pos/printer-settings"),
      ]);
      const lista = await impresoras.json().catch(() => null);
      const guardado = await ajustes.json().catch(() => null);
      if (impresoras.ok && Array.isArray(lista?.printers)) {
        const delPos = lista.printers.filter((nombre: unknown): nombre is string => typeof nombre === "string" && nombre.trim() !== "");
        printers = [...new Set([...printers, ...delPos])].sort((a, b) => a.localeCompare(b, "es"));
      }
      if (ajustes.ok) {
        ticket = typeof guardado?.ticket_printer === "string" ? guardado.ticket_printer : "";
        etiquetas = typeof guardado?.label_printer === "string" ? guardado.label_printer : "";
        posLeyoAjustes = true;
      }
    } catch {
      posLeyoAjustes = false;
    }
    if (!posLeyoAjustes || fs.existsSync(AJUSTES)) {
      const local = leerAjustesLocales();
      ticket = local.ticket_printer;
      etiquetas = local.label_printer;
    }
    if (!printers.length) {
      return NextResponse.json({ error: "No hay impresoras instaladas en este equipo." }, { status: 503 });
    }
    return NextResponse.json({
      printers,
      ticket_printer: ticket,
      label_printer: etiquetas,
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron leer las impresoras de este equipo." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  let body: { ticket_printer?: unknown; label_printer?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const ticket = typeof body.ticket_printer === "string" ? body.ticket_printer.trim() : "";
  const etiquetas = typeof body.label_printer === "string" ? body.label_printer.trim() : "";
  let instaladas: string[] = [];
  try {
    instaladas = await impresorasWindows();
  } catch {
    instaladas = [];
  }
  if (!instaladas.length) {
    return NextResponse.json({ error: "No hay impresoras instaladas en este equipo." }, { status: 503 });
  }
  if (ticket && !instaladas.includes(ticket)) {
    return NextResponse.json({ error: "Esa impresora de tickets no está instalada." }, { status: 400 });
  }
  if (etiquetas && !instaladas.includes(etiquetas)) {
    return NextResponse.json({ error: "Esa impresora de etiquetas no está instalada." }, { status: 400 });
  }
  guardarAjustesLocales(ticket, etiquetas);
  try {
    await fetchPos("/api/v1/pos/printer-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_printer: ticket, label_printer: etiquetas }),
    });
  } catch {
    // El mostrador lee el mismo archivo cuando vuelva a estar encendido.
  }
  return NextResponse.json({ status: "success", ticket_printer: ticket, label_printer: etiquetas, printers: instaladas });
}

export async function POST(request: Request) {
  let body: { skus?: unknown; source?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const skus = Array.isArray(body.skus) ? body.skus.filter((sku) => typeof sku === "string") : [];
  try {
    const respuesta = await fetchPos("/api/v1/pos/labels/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skus, source: typeof body.source === "string" ? body.source : "local" }),
    });
    const data = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !data || typeof data !== "object") {
      return NextResponse.json({ error: detalle(data) || "No se pudieron imprimir las etiquetas." }, { status: respuesta.ok ? 502 : respuesta.status });
    }
    const record = data as { preview_url?: unknown; pdf_url?: unknown };
    return NextResponse.json({
      ...record,
      preview_url: absoluto(record.preview_url),
      pdf_url: absoluto(record.pdf_url),
    });
  } catch {
    return NextResponse.json({ error: "El punto de venta no está disponible." }, { status: 503 });
  }
}
