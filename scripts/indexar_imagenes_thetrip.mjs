import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const RAIZ = process.env.FOTOS_RAIZ || "C:\\Proyectos";
const CATALOGO = path.resolve("data", "catalogo_the_trip.json");
const SALIDA = path.resolve("data", "mapeo_imagenes_thetrip.json");
const REPORTE = path.resolve("data", "reporte_indexacion_fotos.md");

const EXTENSIONES = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ARCHIVOS_SISTEMA = new Set(["desktop.ini", "thumbs.db", ".ds_store"]);
const CARPETAS_OMITIDAS = new Set([
  "node_modules",
  ".git",
  "tmp",
  "temp",
  ".tmp",
  "cache",
  ".next",
  "$recycle.bin",
  "system volume information",
]);
const VACIAS = new Set(["de", "la", "el", "los", "las", "y", "para", "con", "en", "del", "una", "un", "cm", "modelos", "colores", "surtidos"]);
const MARCAS = [
  ["swisher", "sweets"],
  ["dutch"],
  ["supreme"],
  ["g-rolls", "grolls", "conos"],
  ["kush", "terpenos"],
];

function sinAcentos(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(valor) {
  return [...new Set(sinAcentos(valor).split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !VACIAS.has(token)))];
}

function transparente(ruta) {
  const normal = sinAcentos(ruta);
  return normal.includes("fondo transparente") || normal.includes("sin fondo");
}

async function listarImagenes(raiz) {
  const encontradas = [];
  const pila = [raiz];
  while (pila.length) {
    const actual = pila.pop();
    let entradas = [];
    try {
      entradas = await readdir(actual, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entrada of entradas) {
      const nombre = entrada.name;
      if (ARCHIVOS_SISTEMA.has(nombre.toLowerCase())) continue;
      const ruta = path.join(actual, nombre);
      if (entrada.isDirectory()) {
        if (CARPETAS_OMITIDAS.has(nombre.toLowerCase())) continue;
        pila.push(ruta);
        continue;
      }
      if (!entrada.isFile()) continue;
      if (!EXTENSIONES.has(path.extname(nombre).toLowerCase())) continue;
      encontradas.push({
        ruta,
        tokens: tokens(`${path.basename(actual)} ${nombre}`),
        texto: sinAcentos(`${actual} ${nombre}`),
        portada: transparente(ruta),
      });
    }
  }
  return encontradas;
}

function puntaje(producto, imagen) {
  const sku = sinAcentos(producto.sku).replace(/[^a-z0-9]/g, "");
  const archivo = imagen.texto.replace(/[^a-z0-9]/g, "");
  if (sku && sku.length >= 4 && archivo.includes(sku)) return { puntaje: 100, motivo: "sku" };

  const codigos = [producto.codigo_barras, producto.barcode, producto.ean, producto.upc]
    .map((valor) => String(valor || "").replace(/\D/g, ""))
    .filter((valor) => valor.length >= 8);
  const digitos = imagen.texto.replace(/\D/g, "");
  if (codigos.some((codigo) => digitos.includes(codigo))) return { puntaje: 100, motivo: "codigo de barras" };

  const delProducto = new Set(tokens(`${producto.nombre} ${producto.categoria || ""} ${producto.sku || ""}`));
  let puntos = 0;
  for (const token of imagen.tokens) {
    if (delProducto.has(token)) puntos += token.length >= 5 ? 3 : 2;
  }
  const nombre = sinAcentos(producto.nombre);
  for (const marca of MARCAS) {
    const enProducto = marca.some((parte) => nombre.includes(parte));
    const enFoto = marca.some((parte) => imagen.texto.includes(parte));
    if (enProducto && enFoto) puntos += 12;
  }
  if (puntos < 4) return null;
  return { puntaje: puntos, motivo: "tokens del nombre" };
}

function cargarCatalogo(texto) {
  const datos = JSON.parse(texto);
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos.productos)) return datos.productos;
  if (Array.isArray(datos.items)) return datos.items;
  throw new Error("El catálogo no tiene una lista de productos.");
}

const imagenes = await listarImagenes(RAIZ);
const catalogo = cargarCatalogo(await readFile(CATALOGO, "utf8"));
const usadas = new Set();
const productos = catalogo.map((producto) => {
  const candidatas = imagenes
    .map((imagen) => {
      const evaluacion = puntaje(producto, imagen);
      if (!evaluacion) return null;
      return { ruta: imagen.ruta, portada: imagen.portada, ...evaluacion };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.portada) - Number(a.portada) || b.puntaje - a.puntaje)
    .slice(0, 8);
  const principal = candidatas.find((candidata) => !usadas.has(candidata.ruta)) || candidatas[0] || null;
  if (principal) usadas.add(principal.ruta);
  return {
    sku: producto.sku || "",
    nombre: producto.nombre || "",
    fotoPrincipal: principal?.ruta || "",
    candidatas: candidatas.map(({ ruta, puntaje: nota, motivo, portada }) => ({ ruta, puntaje: nota, motivo, fondoTransparente: portada })),
  };
});

const sinAsignar = imagenes.filter((imagen) => !usadas.has(imagen.ruta)).map((imagen) => imagen.ruta);
const mapeo = {
  generadoEn: new Date().toISOString(),
  raiz: RAIZ,
  imagenesEscaneadas: imagenes.length,
  productos: productos.length,
  conPortada: productos.filter((producto) => producto.fotoPrincipal).length,
  sinAsignar: sinAsignar.length,
  asignaciones: productos,
  sobrantes: sinAsignar.slice(0, 200),
};

await mkdir(path.dirname(SALIDA), { recursive: true });
await writeFile(SALIDA, JSON.stringify(mapeo, null, 2), "utf8");

const lineas = [
  "# Reporte de indexación de fotos — The Trip",
  "",
  `Generado: ${mapeo.generadoEn}`,
  `Raíz: ${RAIZ}`,
  `Imágenes: ${mapeo.imagenesEscaneadas}`,
  `Productos con portada: ${mapeo.conPortada} de ${mapeo.productos}`,
  `Fotos sin asignar: ${mapeo.sinAsignar}`,
  "",
  "## Asignaciones",
  "",
];
for (const producto of productos) {
  lineas.push(`### ${producto.sku} — ${producto.nombre}`);
  lineas.push(producto.fotoPrincipal ? `Portada: ${producto.fotoPrincipal}` : "Portada: sin coincidencia");
  for (const candidata of producto.candidatas) {
    lineas.push(`- ${candidata.puntaje} (${candidata.motivo}${candidata.fondoTransparente ? ", fondo transparente" : ""}): ${candidata.ruta}`);
  }
  lineas.push("");
}
await writeFile(REPORTE, lineas.join("\n"), "utf8");
console.log(`Indexadas ${imagenes.length} imágenes. Portadas: ${mapeo.conPortada}/${mapeo.productos}.`);
console.log(SALIDA);
console.log(REPORTE);
