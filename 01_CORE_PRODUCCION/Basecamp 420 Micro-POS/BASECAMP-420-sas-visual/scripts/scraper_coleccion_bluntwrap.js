const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../public/assets/productos/bluntwrap_2x");
const pagesToScrape = [
  "https://tienda.bluntwrap.com.mx/collections/bluntwrap-2x?page=1",
  "https://tienda.bluntwrap.com.mx/collections/bluntwrap-2x?page=2",
];

const cliente = axios.create({
  timeout: 20000,
  maxRedirects: 5,
  headers: {
    "User-Agent": "Basecamp420-catalogo/1.0",
    Accept: "text/html,application/xhtml+xml",
  },
});

function asegurarDirectorio() {
  fs.mkdirSync(outputDir, { recursive: true });
}

function primeraUrl(valor) {
  if (!valor) return "";
  return String(valor).split(",")[0].trim().split(/\s+/)[0];
}

function imagenLista(valor) {
  let src = primeraUrl(valor);
  if (!src) return "";
  if (src.startsWith("//")) src = `https:${src}`;
  if (!src.includes("/cdn/shop/") && !src.includes("cdn.shopify.com")) return "";
  return src.split("{width}").join("1080");
}

function saborDesdeProducto(productUrl) {
  const ruta = String(productUrl).split("?")[0].replace(/\/$/, "");
  const nombre = ruta.split("/").pop() || "";
  const marca = "blunt-wrap-2x-";
  if (nombre.startsWith(marca)) return nombre.slice(marca.length) || nombre;
  return nombre.split("-").pop() || nombre;
}

async function downloadImage(url, filepath) {
  const respuesta = await cliente.get(url, { responseType: "arraybuffer" });
  if (respuesta.status !== 200 || !respuesta.data) {
    throw new Error(`Falló la descarga (${respuesta.status}): ${url}`);
  }
  fs.writeFileSync(filepath, Buffer.from(respuesta.data));
  return filepath;
}

async function scrapeCollection() {
  asegurarDirectorio();
  const vistos = new Set();
  let totalDownloaded = 0;

  for (const url of pagesToScrape) {
    console.log(`\nEscaneando página: ${url}`);
    const { data } = await cliente.get(url);
    const $ = cheerio.load(data);
    const products = $('a[href*="/products/blunt-wrap-2x"]').toArray();
    console.log(`Encontrados ${products.length} enlaces de producto en esta página.`);

    for (const nodo of products) {
      const productUrl = $(nodo).attr("href") || "";
      const clave = productUrl.split("?")[0];
      if (!clave || vistos.has(clave)) continue;

      const imgEl = $(nodo).find("img").first();
      const src = imagenLista(imgEl.attr("data-src") || imgEl.attr("src") || imgEl.attr("srcset") || imgEl.attr("data-srcset"));
      if (!src) continue;

      vistos.add(clave);
      const slug = saborDesdeProducto(productUrl);
      const ext = path.extname(src.split("?")[0]) || ".jpg";
      const filename = `bw2x-${slug}${ext}`;
      const filepath = path.join(outputDir, filename);

      console.log(`Descargando sabor [${slug}]: ${filename}`);
      await downloadImage(src, filepath);
      totalDownloaded += 1;
    }
  }

  console.log(`\nExtracción completada. ${totalDownloaded} imágenes en public/assets/productos/bluntwrap_2x/`);
  if (totalDownloaded === 0) {
    throw new Error("La colección no devolvió imágenes de producto.");
  }
}

scrapeCollection().catch((error) => {
  console.error("Error en el web scraping:", error.message);
  process.exitCode = 1;
});
