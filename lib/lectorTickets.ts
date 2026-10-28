import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const RUTA = path.join(process.cwd(), "data", "lector-tickets.json");
const TTL_MS = 90_000;

type TicketMostrador = {
  ticket: string;
  usuario: string;
  destino: "mostrador";
  expira: number;
};

function vigentes(tickets: unknown): TicketMostrador[] {
  if (!Array.isArray(tickets)) return [];
  const ahora = Date.now();
  const salida: TicketMostrador[] = [];
  for (const item of tickets) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.ticket !== "string" || typeof row.usuario !== "string" || typeof row.expira !== "number") continue;
    if (row.destino !== "mostrador" || row.expira <= ahora) continue;
    salida.push({ ticket: row.ticket, usuario: row.usuario, destino: "mostrador", expira: row.expira });
  }
  return salida;
}

async function leer(): Promise<TicketMostrador[]> {
  try {
    const texto = await readFile(RUTA, "utf8");
    const data = JSON.parse(texto) as { tickets?: unknown };
    return vigentes(data.tickets);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

async function escribir(tickets: TicketMostrador[]): Promise<void> {
  await mkdir(path.dirname(RUTA), { recursive: true });
  await writeFile(RUTA, `${JSON.stringify({ tickets }, null, 2)}\n`, "utf8");
}

export async function crearTicketMostrador(usuario: string): Promise<string> {
  const tickets = await leer();
  const ticket = randomBytes(24).toString("hex");
  tickets.push({ ticket, usuario, destino: "mostrador", expira: Date.now() + TTL_MS });
  await escribir(tickets);
  return ticket;
}
