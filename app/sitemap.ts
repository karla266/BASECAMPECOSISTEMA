import type { MetadataRoute } from "next";
import { leerInventarioTheTrip } from "@/lib/inventarioThetrip";

const baseUrl = "https://www.basecamp420.com";

const rutasEstaticas: MetadataRoute.Sitemap = [
  { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { url: `${baseUrl}/thetrip`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${baseUrl}/parapente`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${baseUrl}/reservar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/calendario`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/ecosistema`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${baseUrl}/convenio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/cima-digital`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/cimadigital`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${baseUrl}/anturios`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/el-paraiso`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/experiencia-completa`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/aliados`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${baseUrl}/ordenar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${baseUrl}/pilotos/alta`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${baseUrl}/tienda`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/movimiento-canabico/podcasts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${baseUrl}/terminos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

function rutasDeProductos(): MetadataRoute.Sitemap {
  const data = leerInventarioTheTrip();
  const modificado = new Date(data.ultima_actualizacion || Date.now());
  const vistas = new Set<string>();
  const rutas: MetadataRoute.Sitemap = [];

  for (const producto of data.productos) {
    if (!producto.sku) continue;
    const url = `${baseUrl}/thetrip/producto/${producto.sku.toLowerCase()}`;
    if (vistas.has(url)) continue;
    vistas.add(url);
    rutas.push({
      url,
      lastModified: modificado,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return rutas;
}

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    return [...rutasEstaticas, ...rutasDeProductos()];
  } catch (error) {
    console.error("Error al generar rutas dinámicas del sitemap:", error);
    return rutasEstaticas;
  }
}
