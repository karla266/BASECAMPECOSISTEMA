import { NextResponse } from "next/server";
import { leerEpisodios } from "@/lib/podcasts";
import { construirFeed } from "@/lib/rss-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const episodios = await leerEpisodios();
  const xml = construirFeed(episodios);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate",
    },
  });
}
