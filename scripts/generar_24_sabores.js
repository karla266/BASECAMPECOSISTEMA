const fs = require("fs");
const path = require("path");

const sabores = [
  { slug: "berries", nombre: "Berries / Moras" },
  { slug: "cherry", nombre: "Wet Cherry / Cereza" },
  { slug: "purple", nombre: "Purple / Uva" },
  { slug: "mango", nombre: "Mango Dulce" },
  { slug: "vanilla", nombre: "French Vanilla" },
  { slug: "choco", nombre: "Chocolate Suave" },
  { slug: "watermelon", nombre: "Watermelon / Sandía" },
  { slug: "blueberry", nombre: "Blueberry / Arándano" },
  { slug: "strawberry", nombre: "Strawberry / Fresa" },
  { slug: "peach", nombre: "Peach / Durazno" },
  { slug: "apple", nombre: "Apple Martini" },
  { slug: "bubble", nombre: "Bubble Gum / Chicle" },
  { slug: "pinacolada", nombre: "Piña Colada" },
  { slug: "mojito", nombre: "Mojito Menta" },
  { slug: "ginjuice", nombre: "Gin & Juice" },
  { slug: "cosmo", nombre: "Cosmopolitan" },
  { slug: "russian", nombre: "Russian Cream" },
  { slug: "kush", nombre: "Kush Herbal" },
  { slug: "zero", nombre: "Zero / Natural" },
  { slug: "diamond", nombre: "Diamond Clásico" },
  { slug: "cognac", nombre: "Cognac / Cacao" },
  { slug: "tropical", nombre: "Tropical Passion" },
  { slug: "mello", nombre: "Mello Mango" },
  { slug: "banana", nombre: "Banana Cream" },
];

const productos = [];

sabores.forEach((sabor) => {
  productos.push({
    sku: `BW2X-${sabor.slug.toUpperCase()}-PZ`,
    sabor: sabor.nombre,
    tipo: "PIEZA",
    nombre: `Blunt Wrap 2X — ${sabor.nombre} (Sobre Individual)`,
    descripcion: `Sobre individual con 2 sábanas de blunt aromatizadas sabor ${sabor.nombre}. Combustión lenta.`,
    categoria: "Blunts y Enrolado",
    costo_interno: 10.75,
    precio_mxn: 30.0,
    stock_disponible: 25,
    disponibilidad: "PRE-VENTA",
    fecha_llegada: "Jueves",
  });

  productos.push({
    sku: `BW2X-${sabor.slug.toUpperCase()}-BOX`,
    sabor: sabor.nombre,
    tipo: "DISPLAY",
    nombre: `Display Blunt Wrap 2X — ${sabor.nombre} (Caja 25 sobres)`,
    descripcion: `Caja display cerrada con 25 sobres sellados (50 sábanas en total) sabor ${sabor.nombre}.`,
    categoria: "Blunts y Enrolado",
    costo_interno: 268.75,
    precio_mxn: 650.0,
    stock_disponible: 1,
    descuenta_sku_piezas: `BW2X-${sabor.slug.toUpperCase()}-PZ`,
    descuenta_cantidad: 25,
    disponibilidad: "PRE-VENTA",
    fecha_llegada: "Jueves",
  });
});

const outputPath = path.join(__dirname, "../data/inventario_thetrip.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({ total_variantes: productos.length, productos }, null, 2), "utf8");

const piezas = productos.filter((item) => item.tipo === "PIEZA").length;
const displays = productos.filter((item) => item.tipo === "DISPLAY").length;
if (sabores.length !== 24 || piezas !== 24 || displays !== 24) {
  throw new Error(`Catálogo incompleto: ${sabores.length} sabores, ${piezas} piezas, ${displays} displays.`);
}

console.log(outputPath);
console.log(`Catálogo generado: ${sabores.length} sabores, ${productos.length} SKU (${piezas} piezas y ${displays} displays).`);
