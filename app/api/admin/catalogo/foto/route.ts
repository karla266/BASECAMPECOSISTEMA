import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verificarSesionAdmin } from "@/lib/adminSession";
import {
  asignarImagenCatalogo,
  buscarProductoFoto,
  guardarWebp,
  listarProductosFoto,
  skuValido,
} from "@/lib/fotoProducto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function exigirAdmin() {
  const token = cookies().get("bc_admin_sesion")?.value;
  const sesion = await verificarSesionAdmin(token);
  if (!sesion) {
    return NextResponse.json({ success: false, detail: "La sesión de administración no es válida." }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const rechazo = await exigirAdmin();
  if (rechazo) return rechazo;
  const url = new URL(request.url);
  const consulta = (url.searchParams.get("q") || "").trim().toLowerCase();
  const sinFoto = url.searchParams.get("sinFoto") === "1";
  const productos = listarProductosFoto()
    .filter((producto) => (sinFoto ? !producto.imagen_url : true))
    .filter((producto) => {
      if (!consulta) return true;
      return producto.sku.toLowerCase().includes(consulta) || producto.nombre.toLowerCase().includes(consulta);
    })
    .slice(0, 40);
  return NextResponse.json({ productos });
}

export async function POST(request: Request) {
  const rechazo = await exigirAdmin();
  if (rechazo) return rechazo;
  const contenido = request.headers.get("content-type") || "";
  let sku = "";
  let imageBase64 = "";
  if (contenido.includes("multipart/form-data")) {
    const formulario = await request.formData();
    sku = String(formulario.get("sku") || "");
    imageBase64 = String(formulario.get("imageBase64") || "");
  } else {
    const cuerpo = (await request.json().catch(() => null)) as { sku?: string; imageBase64?: string } | null;
    sku = cuerpo?.sku || "";
    imageBase64 = cuerpo?.imageBase64 || "";
  }
  let skuLimpio = "";
  try {
    skuLimpio = skuValido(sku);
  } catch (error) {
    return NextResponse.json({ success: false, detail: error instanceof Error ? error.message : "SKU inválido." }, { status: 400 });
  }
  const producto = buscarProductoFoto(skuLimpio);
  if (!producto) {
    return NextResponse.json({ success: false, detail: "Ese SKU no está en el catálogo." }, { status: 404 });
  }
  const coincidencia = imageBase64.match(/^data:image\/(?:jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  const carga = coincidencia?.[1] || imageBase64.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(carga)) {
    return NextResponse.json({ success: false, detail: "La imagen no viene en base64." }, { status: 400 });
  }
  const bytes = Buffer.from(carga, "base64");
  if (bytes.length < 32 || bytes.length > 12_000_000) {
    return NextResponse.json({ success: false, detail: "El tamaño de la foto está fuera de rango." }, { status: 400 });
  }
  try {
    const imagenUrl = guardarWebp(bytes, skuLimpio);
    asignarImagenCatalogo(skuLimpio, imagenUrl, producto.nombre);
    return NextResponse.json({ success: true, sku: producto.sku, imagen_url: imagenUrl });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "No se pudo guardar la foto.";
    const codigo = detalle.includes("precio") ? 409 : 500;
    return NextResponse.json({ success: false, detail: detalle }, { status: codigo });
  }
}
