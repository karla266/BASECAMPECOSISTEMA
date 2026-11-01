import type { MetadataRoute } from "next";
import { getTenantSiteBaseUrl } from "@/lib/tenant";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getTenantSiteBaseUrl();
  const routes = [
    "/",
    "/ecosistema",
    "/reservar",
    "/calendario",
    "/convenio",
    "/the-trip",
    "/thetrip",
    "/explore",
    "/cima-digital",
    "/cimadigital",
    "/parapente",
    "/anturios",
    "/el-paraiso",
    "/experiencia-completa",
    "/aliados",
    "/ordenar",
    "/pilotos/alta",
    "/transporte/operacion",
    "/tienda",
    "/blog",
    "/movimiento-canabico/podcasts",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "daily",
    priority: route === "/" ? 1 : 0.8,
    lastModified: new Date(),
  }));
}
