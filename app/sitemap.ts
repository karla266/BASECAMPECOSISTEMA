import type { MetadataRoute } from "next";
import { getTenantSiteBaseUrl } from "@/lib/tenant";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getTenantSiteBaseUrl();
  const routes = [
    "/",
    "/reservar",
    "/calendario",
    "/convenio",
    "/the-trip",
    "/thetrip",
    "/explore",
    "/cima-digital",
    "/cimadigital",
    "/blog",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "daily",
    priority: route === "/" ? 1 : 0.8,
    lastModified: new Date(),
  }));
}
