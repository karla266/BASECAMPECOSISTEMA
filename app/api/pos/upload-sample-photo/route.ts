import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHOTO_DIR = path.resolve(process.cwd(), "..", "data", "media", "sales_photos");
const SKU_MAP_PATH = path.resolve(process.cwd(), "..", "data", "sku-photo-map.json");

type SkuPhotoMap = Record<string, string>;

function readSkuMap(): SkuPhotoMap {
  try {
    const raw = fs.readFileSync(SKU_MAP_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const output: SkuPhotoMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) output[key] = value;
    }
    return output;
  } catch {
    return {};
  }
}

function writeSkuMap(map: SkuPhotoMap) {
  fs.mkdirSync(path.dirname(SKU_MAP_PATH), { recursive: true });
  fs.writeFileSync(SKU_MAP_PATH, JSON.stringify(map, null, 2), "utf8");
}

function normalizeSku(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().toUpperCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { sku?: unknown; image_data_url?: unknown }
    | null;
  const sku = normalizeSku(body?.sku);
  if (!sku) {
    return NextResponse.json({ ok: false, error: "SKU requerido." }, { status: 400 });
  }
  const dataUrl = typeof body?.image_data_url === "string" ? body.image_data_url : "";
  const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return NextResponse.json({ ok: false, error: "Formato de imagen inválido." }, { status: 400 });
  }
  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  let binary: Buffer;
  try {
    binary = Buffer.from(match[2], "base64");
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo leer la imagen." }, { status: 400 });
  }
  if (binary.length < 1024 || binary.length > 10_000_000) {
    return NextResponse.json({ ok: false, error: "Tamaño de imagen fuera de rango." }, { status: 400 });
  }

  fs.mkdirSync(PHOTO_DIR, { recursive: true });
  const filename = `${sku}_${Date.now()}.${extension}`;
  const filePath = path.join(PHOTO_DIR, filename);
  fs.writeFileSync(filePath, binary);

  const map = readSkuMap();
  map[sku] = filename;
  writeSkuMap(map);

  return NextResponse.json({
    ok: true,
    sku,
    filename,
    url: `/api/webcam/${encodeURIComponent(filename)}`,
  });
}
