import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.MELI_CLIENT_ID || process.env.MELI_APP_ID!,
      client_secret: process.env.MELI_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.MELI_REDIRECT_URI!,
    }),
  });

  const data = await res.json();
  return NextResponse.json({ message: 'Autenticación exitosa', tokens: data });
}
