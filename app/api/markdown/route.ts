import { NextResponse } from "next/server";

const BASE_URL = "https://www.basecamp420.com";

type PageEntry = {
  title: string;
  description: string;
  highlights: string[];
};

const PAGE_INDEX: Record<string, PageEntry> = {
  "/": {
    title: "Basecamp 420 | Hub de experiencias en Orizaba",
    description:
      "Basecamp 420 integra parapente tándem, cursos APPI, The Trip Smoke Shop y renta de equipo en Orizaba, Veracruz.",
    highlights: [
      "Reservas y compras en checkout interno del sitio",
      "Teléfono: +52 272 725 8748",
      "Correo: contacto@basecamp420.com",
    ],
  },
  "/thetrip": {
    title: "The Trip Smoke Shop",
    description: "Catálogo de productos de mostrador y preventa conectado al inventario del ecosistema Basecamp 420.",
    highlights: [
      "Productos de mostrador y sobre pedido",
      "Checkout en línea",
      "Operación local en Orizaba",
    ],
  },
  "/adventure": {
    title: "Basecamp 420 Adventure",
    description: "Servicios de parapente tándem, formación y rutas de montaña para comunidad de aventura.",
    highlights: [
      "Vuelos tándem en Fortín y Coapichapa",
      "Entrenamiento y acompañamiento",
      "Planeación de expediciones",
    ],
  },
  "/renta": {
    title: "Renta de equipo",
    description: "Renta de equipo para montaña y camping: mochilas, cascos, tiendas y accesorios.",
    highlights: [
      "Cotización y contratación dentro del sitio",
      "Cobertura local Orizaba/Fortín",
      "Equipo para actividades al aire libre",
    ],
  },
  "/ecosistema": {
    title: "Ecosistema Basecamp 420",
    description: "Marcas, aliados y servicios del grupo Basecamp 420 y su red local de operación.",
    highlights: [
      "The Trip Smoke Shop",
      "Aventura, comunidad y tecnología",
      "Presencia local en Orizaba",
    ],
  },
  "/about": {
    title: "Acerca de Basecamp 420",
    description: "Historia, misión y enfoque operativo de Basecamp 420 en Orizaba, Veracruz.",
    highlights: [
      "Origen y trayectoria de la marca",
      "Servicios principales",
      "Datos de contacto oficiales",
    ],
  },
  "/contacto": {
    title: "Contacto Basecamp 420",
    description: "Canales oficiales de contacto y atención de Basecamp 420.",
    highlights: [
      "Teléfono: +52 272 725 8748",
      "Correo: contacto@basecamp420.com",
      "Canal de ventas: checkout interno del sitio",
    ],
  },
  "/legal": {
    title: "Legal Basecamp 420",
    description: "Información legal, términos y lineamientos generales del sitio.",
    highlights: [
      "Lineamientos de uso",
      "Canales oficiales de atención",
      "Páginas relacionadas",
    ],
  },
};

function normalizarPath(input: string | null): string {
  if (!input) return "/";
  try {
    const decoded = decodeURIComponent(input);
    const onlyPath = decoded.split("?")[0] || "/";
    return onlyPath.startsWith("/") ? onlyPath : `/${onlyPath}`;
  } catch {
    return "/";
  }
}

function markdownFor(pathname: string) {
  const entry = PAGE_INDEX[pathname] || PAGE_INDEX["/"];
  const canonical = `${BASE_URL}${pathname === "/" ? "" : pathname}`;
  const lines = [
    `# ${entry.title}`,
    "",
    entry.description,
    "",
    `Canonical: ${canonical}`,
    "Contacto:",
    "- Teléfono: +52 272 725 8748",
    "- Correo: contacto@basecamp420.com",
    "- Venta digital: checkout interno del sitio",
    "",
    "Puntos clave:",
    ...entry.highlights.map((item) => `- ${item}`),
    "",
    "Enlaces útiles:",
    "- https://www.basecamp420.com/about",
    "- https://www.basecamp420.com/contacto",
    "- https://www.basecamp420.com/legal",
    "- https://www.basecamp420.com/terminos",
    "- https://www.basecamp420.com/llms.txt",
  ];
  return lines.join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = normalizarPath(searchParams.get("path"));
  const markdown = markdownFor(path);
  const response = new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      Link: `</llms.txt>; rel="alternate"; type="text/plain", </api/markdown?path=${encodeURIComponent(path)}>; rel="self"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="service"; type="application/json"`,
    },
  });
  return response;
}
