import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  configInicial,
  esTono,
  idsMultiservicio,
  semilla,
  type MultiservicioConfig,
  type TonoMultiservicio,
} from "@/lib/multiservicios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ARCHIVO = path.join(process.cwd(), "data", "multiservicios_config.json");
const IDS = idsMultiservicio();

function documento(servicios: Record<string, MultiservicioConfig>) {
  return { servicios };
}

function normalizar(guardado: Partial<MultiservicioConfig> | undefined, base: MultiservicioConfig): MultiservicioConfig {
  const tone = typeof guardado?.tone === "string" && esTono(guardado.tone) ? guardado.tone : base.tone;
  const guardrails = Array.isArray(guardado?.strict_guardrails)
    ? guardado.strict_guardrails.filter((item): item is string => typeof item === "string").map((item) => item.slice(0, 300)).slice(0, 20)
    : base.strict_guardrails;
  const precio = typeof guardado?.base_price === "number" && Number.isFinite(guardado.base_price) ? guardado.base_price : base.base_price;
  return {
    service_id: base.service_id,
    is_active: typeof guardado?.is_active === "boolean" ? guardado.is_active : base.is_active,
    base_price: precio,
    system_prompt: typeof guardado?.system_prompt === "string" ? guardado.system_prompt.slice(0, 2000) : base.system_prompt,
    tone,
    allow_stock_query: typeof guardado?.allow_stock_query === "boolean" ? guardado.allow_stock_query : base.allow_stock_query,
    allow_price_quote: typeof guardado?.allow_price_quote === "boolean" ? guardado.allow_price_quote : base.allow_price_quote,
    strict_guardrails: guardrails,
  };
}

function leer(): Record<string, MultiservicioConfig> {
  const salida = semilla();
  try {
    const crudo = JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) as { servicios?: Record<string, Partial<MultiservicioConfig>> };
    const servicios = crudo?.servicios;
    if (!servicios || typeof servicios !== "object") return salida;
    for (const id of IDS) {
      const base = configInicial(id);
      if (!base) continue;
      salida[id] = normalizar(servicios[id], base);
    }
  } catch {
    return salida;
  }
  return salida;
}

function escribir(servicios: Record<string, MultiservicioConfig>) {
  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  const temporal = `${ARCHIVO}.${process.pid}.tmp`;
  fs.writeFileSync(temporal, JSON.stringify(documento(servicios), null, 2), "utf8");
  fs.copyFileSync(temporal, ARCHIVO);
  fs.unlinkSync(temporal);
}

export async function GET() {
  const servicios = leer();
  if (!fs.existsSync(ARCHIVO)) {
    try {
      escribir(servicios);
    } catch {
      return NextResponse.json(documento(servicios));
    }
  }
  return NextResponse.json(documento(servicios));
}

function validar(cuerpo: unknown): { ok: true; config: MultiservicioConfig } | { ok: false; error: string } {
  if (!cuerpo || typeof cuerpo !== "object") {
    return { ok: false, error: "El cuerpo debe ser un objeto." };
  }
  const data = cuerpo as Record<string, unknown>;
  const serviceId = typeof data.service_id === "string" ? data.service_id.trim() : "";
  if (!IDS.has(serviceId)) {
    return { ok: false, error: "Ese multiservicio no existe." };
  }
  if (typeof data.is_active !== "boolean") {
    return { ok: false, error: "is_active debe ser booleano." };
  }
  if (typeof data.base_price !== "number" || !Number.isFinite(data.base_price)) {
    return { ok: false, error: "base_price debe ser un número." };
  }
  if (typeof data.system_prompt !== "string") {
    return { ok: false, error: "system_prompt debe ser texto." };
  }
  if (typeof data.tone !== "string" || !esTono(data.tone)) {
    return { ok: false, error: "Tono desconocido. Usa formal, aventurero, tecnico o comercial." };
  }
  if (typeof data.allow_stock_query !== "boolean") {
    return { ok: false, error: "allow_stock_query debe ser booleano." };
  }
  if (typeof data.allow_price_quote !== "boolean") {
    return { ok: false, error: "allow_price_quote debe ser booleano." };
  }
  if (!Array.isArray(data.strict_guardrails) || data.strict_guardrails.some((item) => typeof item !== "string")) {
    return { ok: false, error: "strict_guardrails debe ser una lista de textos." };
  }
  const tone: TonoMultiservicio = data.tone;
  return {
    ok: true,
    config: {
      service_id: serviceId,
      is_active: data.is_active,
      base_price: data.base_price,
      system_prompt: data.system_prompt.slice(0, 2000),
      tone,
      allow_stock_query: data.allow_stock_query,
      allow_price_quote: data.allow_price_quote,
      strict_guardrails: data.strict_guardrails.map((item) => item.trim()).filter(Boolean).slice(0, 20),
    },
  };
}

async function guardar(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const validado = validar(cuerpo);
  if (!validado.ok) {
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }
  const servicios = leer();
  servicios[validado.config.service_id] = validado.config;
  try {
    escribir(servicios);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la configuración." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...documento(servicios) });
}

export async function PUT(request: Request) {
  return guardar(request);
}

export async function POST(request: Request) {
  return guardar(request);
}
