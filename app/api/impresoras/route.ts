import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARCHIVO = path.resolve(process.cwd(), "..", "data", "impresoras.json");
const TIMEOUT_MS = 15000;

type ImpresoraLocal = {
  name: string;
  portName: string;
  isDefault: boolean;
};

function textoSalida(salida: string | Buffer): string {
  const buffer = Buffer.isBuffer(salida) ? salida : Buffer.from(salida);
  if (buffer.length >= 2 && buffer[1] === 0) return buffer.toString("utf16le");
  return buffer.toString("utf8");
}

function listarWindows(): Promise<ImpresoraLocal[]> {
  const comando = [
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;",
    "Get-CimInstance Win32_Printer | Select-Object Name, PortName, Default | ConvertTo-Json -Compress",
  ].join(" ");
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", comando],
      { timeout: TIMEOUT_MS, windowsHide: true, encoding: "buffer" },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          resolve(parsearImpresoras(textoSalida(stdout as unknown as Buffer)));
        } catch (fallo) {
          reject(fallo);
        }
      }
    );
  });
}

function parsearImpresoras(crudo: string): ImpresoraLocal[] {
  const limpio = crudo.replace(/^\uFEFF/, "").trim();
  if (!limpio) return [];
  const data = JSON.parse(limpio) as unknown;
  const filas = Array.isArray(data) ? data : [data];
  const vistas = new Set<string>();
  const salida: ImpresoraLocal[] = [];
  for (const fila of filas) {
    if (!fila || typeof fila !== "object") continue;
    const record = fila as { Name?: unknown; PortName?: unknown; Default?: unknown };
    const name = typeof record.Name === "string" ? record.Name.trim() : "";
    if (!name || vistas.has(name)) continue;
    vistas.add(name);
    salida.push({
      name,
      portName: typeof record.PortName === "string" ? record.PortName : "",
      isDefault: record.Default === true,
    });
  }
  return salida.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function leerGuardadas(): { ticketPrinter: string; labelPrinter: string } {
  try {
    const data = JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) as {
      ticketPrinter?: unknown;
      labelPrinter?: unknown;
    };
    return {
      ticketPrinter: typeof data.ticketPrinter === "string" ? data.ticketPrinter : "",
      labelPrinter: typeof data.labelPrinter === "string" ? data.labelPrinter : "",
    };
  } catch {
    return { ticketPrinter: "", labelPrinter: "" };
  }
}

function guardarArchivo(ticketPrinter: string, labelPrinter: string) {
  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  const temporal = `${ARCHIVO}.${process.pid}.tmp`;
  const contenido = JSON.stringify({ ticketPrinter, labelPrinter }, null, 2);
  fs.writeFileSync(temporal, contenido, "utf8");
  fs.copyFileSync(temporal, ARCHIVO);
  fs.unlinkSync(temporal);
}

function nombre(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  return valor.trim();
}

export async function GET() {
  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "El listado de impresoras solo está disponible en Windows." },
      { status: 501 }
    );
  }
  try {
    const printers = await listarWindows();
    const guardadas = leerGuardadas();
    return NextResponse.json({ printers, ...guardadas });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron listar las impresoras de Windows." },
      { status: 500 }
    );
  }
}

async function guardar(request: Request) {
  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "El listado de impresoras solo está disponible en Windows." },
      { status: 501 }
    );
  }
  let body: { ticketPrinter?: unknown; labelPrinter?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const ticketPrinter = nombre(body.ticketPrinter);
  const labelPrinter = nombre(body.labelPrinter);
  if (ticketPrinter === null || labelPrinter === null) {
    return NextResponse.json(
      { error: "ticketPrinter y labelPrinter deben ser texto." },
      { status: 400 }
    );
  }
  let instaladas: ImpresoraLocal[] = [];
  try {
    instaladas = await listarWindows();
  } catch {
    return NextResponse.json(
      { error: "No se pudieron comprobar las impresoras de Windows." },
      { status: 500 }
    );
  }
  const nombres = new Set(instaladas.map((impresora) => impresora.name));
  if (ticketPrinter && !nombres.has(ticketPrinter)) {
    return NextResponse.json({ error: "Esa impresora de tickets no está instalada." }, { status: 400 });
  }
  if (labelPrinter && !nombres.has(labelPrinter)) {
    return NextResponse.json({ error: "Esa impresora de etiquetas no está instalada." }, { status: 400 });
  }
  try {
    guardarArchivo(ticketPrinter, labelPrinter);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la configuración de impresoras." }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    ticketPrinter,
    labelPrinter,
    printers: instaladas,
  });
}

export async function PUT(request: Request) {
  return guardar(request);
}

export async function POST(request: Request) {
  return guardar(request);
}
