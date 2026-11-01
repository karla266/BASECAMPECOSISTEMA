const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const CATEGORIA_URL = "https://tiaraexpress.mx/categoria/otros-productos";
const OUTPUT_IMG_DIR = path.join(__dirname, "../public/assets/productos/tiaraexpress");
const INVENTARIO_PATH = path.join(__dirname, "../data/inventario_thetrip.json");
const IMAGEN_BASE = "/assets/productos/watermarked_img_4565543973787279676.jpg";
const MAX_PAGINAS = 20;

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

const cliente = axios.create({ headers, timeout: 20000, maxRedirects: 5 });

function slugDe(titulo) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function precioDe(texto) {
  const montos = String(texto).match(/\d[\d.,]*/g) || [];
  const ultimo = montos[montos.length - 1] || "0";
  const normalizado = ultimo.includes(",") && ultimo.includes(".")
    ? ultimo.replace(/,/g, "")
    : ultimo.replace(",", ".");
  const precio = Number.parseFloat(normalizado);
  return Number.isFinite(precio) ? precio : 0;
}

async function descargarImagen(url, destino) {
  const respuesta = await cliente.get(url, { responseType: "arraybuffer" });
  if (respuesta.status !== 200 || !respuesta.data) {
    throw new Error(`Error HTTP ${respuesta.status} al descargar imagen.`);
  }
  fs.writeFileSync(destino, Buffer.from(respuesta.data));
  return destino;
}

async function scrapeTiaraOtrosProductos() {
  fs.mkdirSync(OUTPUT_IMG_DIR, { recursive: true });
  console.log(`Iniciando extracción de: ${CATEGORIA_URL}`);
  let pagina = 1;
  let seguir = true;
  const productosNuevos = [];
  const vistos = new Set();

  while (seguir && pagina <= MAX_PAGINAS) {
    const urlActual = pagina === 1 ? CATEGORIA_URL : `${CATEGORIA_URL}/page/${pagina}/`;
    console.log(`\nConsultando página ${pagina}: ${urlActual}`);

    try {
      const { data } = await cliente.get(urlActual);
      const $ = cheerio.load(data);
      const elementos = $("li.product, div.product-small, .type-product").toArray();

      if (elementos.length === 0) {
        console.log(`No se detectaron más productos en la página ${pagina}. Finalizando recorrido.`);
        seguir = false;
        break;
      }

      console.log(`Encontrados ${elementos.length} productos en esta página.`);

      for (const nodo of elementos) {
        const el = $(nodo);
        const titulo = el.find(".woocommerce-loop-product__title, .product-title, .name, h2, h3").first().text().trim();
        if (!titulo) continue;

        const slug = slugDe(titulo);
        if (!slug || vistos.has(slug)) continue;
        vistos.add(slug);

        const sku = `TE-OTROS-${slug.toUpperCase()}`.substring(0, 40);
        const precio = precioDe(el.find(".price").last().text());
        const imgEl = el.find("img").first();
        let imgUrl = imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || imgEl.attr("src") || "";
        if (imgUrl.startsWith("//")) imgUrl = `https:${imgUrl}`;
        if (imgUrl.startsWith("/")) imgUrl = `https://tiaraexpress.mx${imgUrl}`;

        let rutaImagenLocal = IMAGEN_BASE;
        if (imgUrl.startsWith("http") && !imgUrl.includes("data:image") && !imgUrl.includes("svg")) {
          const extension = path.extname(imgUrl.split("?")[0]) || ".jpg";
          const nombreArchivo = `te-otros-${slug}${extension}`.slice(0, 120);
          const rutaDestino = path.join(OUTPUT_IMG_DIR, nombreArchivo);
          try {
            console.log(`Descargando: ${nombreArchivo}`);
            await descargarImagen(imgUrl, rutaDestino);
            rutaImagenLocal = `/assets/productos/tiaraexpress/${nombreArchivo}`;
          } catch (error) {
            console.warn(`No se pudo bajar la foto de "${titulo}". Usando imagen base. ${error.message}`);
          }
        }

        productosNuevos.push({
          id: `prod_${slug}`,
          sku,
          nombre: titulo,
          categoria: "Otros Productos",
          subcategoria: "Tiara Express",
          descripcion: `${titulo} — Producto oficial importado por Tiara Express. Disponible bajo esquema de pre-venta exclusiva con despacho a partir del 1 de Diciembre.`,
          precio_mxn: precio,
          costo_interno: Number((precio * 0.55).toFixed(2)),
          stock_disponible: 15,
          disponibilidad: "PRE-VENTA",
          fecha_llegada: "1 de Diciembre",
          imagenes: [rutaImagenLocal],
          tags: ["Tiara Express", "Otros Productos", "Pre-Venta", "1 de Diciembre"],
        });
      }

      const haySiguiente = $("a.next, .woocommerce-pagination a.next, a.next.page-number").length > 0;
      if (haySiguiente) pagina += 1;
      else seguir = false;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`Fin de paginación alcanzado en página ${pagina}.`);
      } else {
        console.error(`Error consultando página ${pagina}:`, error.message);
        throw error;
      }
      seguir = false;
    }
  }

  if (productosNuevos.length === 0) {
    throw new Error("La categoría no devolvió productos. El inventario no se modificó.");
  }

  const catalogo = JSON.parse(fs.readFileSync(INVENTARIO_PATH, "utf8"));
  if (!Array.isArray(catalogo.productos)) {
    throw new Error("inventario_thetrip.json no tiene una lista de productos.");
  }

  const skusNuevos = new Set(productosNuevos.map((producto) => producto.sku));
  const idsNuevos = new Set(productosNuevos.map((producto) => producto.id));
  catalogo.productos = catalogo.productos.filter(
    (producto) => !skusNuevos.has(producto.sku) && !idsNuevos.has(producto.id) && producto.subcategoria !== "Tiara Express"
  );
  catalogo.productos.push(...productosNuevos);
  catalogo.ultima_actualizacion = new Date().toISOString();
  fs.writeFileSync(INVENTARIO_PATH, JSON.stringify(catalogo, null, 2), "utf8");

  const muestra = catalogo.productos.filter((producto) => producto.categoria === "Otros Productos");
  const invalidos = muestra.filter(
    (producto) => producto.disponibilidad !== "PRE-VENTA" || producto.fecha_llegada !== "1 de Diciembre"
  );
  if (invalidos.length > 0) {
    throw new Error("Hay productos de Otros Productos sin la pre-venta del 1 de Diciembre.");
  }

  console.log("\nProceso completado:");
  console.log(`   - Productos extraídos: ${productosNuevos.length}`);
  console.log("   - Estatus asignado: PRE-VENTA");
  console.log("   - Fecha programada: 1 de Diciembre");
  console.log("   - Catálogo guardado en: data/inventario_thetrip.json");
}

scrapeTiaraOtrosProductos().catch((error) => {
  console.error("Error en la extracción:", error.message);
  process.exitCode = 1;
});
