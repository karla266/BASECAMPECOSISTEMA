import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secreto = process.env.SPOTIFY_CLIENT_SECRET;
  const show = process.env.SPOTIFY_SHOW_ID;
  if (!id || !secreto || !show) {
    return NextResponse.json(
      {
        conectado: false,
        error: "Faltan SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET o SPOTIFY_SHOW_ID.",
        feed: "https://www.basecamp420.com/api/podcasts/feed.xml",
      },
      { status: 200 }
    );
  }

  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secreto}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const acceso = (await token.json()) as { access_token?: string };
  if (!token.ok || !acceso.access_token) {
    return NextResponse.json({ conectado: false, error: "Spotify rechazó las credenciales." }, { status: 502 });
  }

  const programa = await fetch(`https://api.spotify.com/v1/shows/${show}?market=MX`, {
    headers: { Authorization: `Bearer ${acceso.access_token}` },
  });
  const datos = (await programa.json()) as {
    name?: string;
    total_episodes?: number;
    external_urls?: { spotify?: string };
    error?: { message?: string };
  };
  if (!programa.ok) {
    return NextResponse.json(
      { conectado: false, error: datos.error?.message || "Spotify no encontró el programa." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    conectado: true,
    nombre: datos.name,
    episodios: datos.total_episodes ?? 0,
    url: datos.external_urls?.spotify || "",
    feed: "https://www.basecamp420.com/api/podcasts/feed.xml",
  });
}
