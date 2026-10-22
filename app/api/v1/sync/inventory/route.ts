import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const secretConfigured = Boolean(process.env.WEB_API_SECRET_KEY);
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/v1/sync/inventory',
    secretConfigured: secretConfigured,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const expectedSecret = process.env.WEB_API_SECRET_KEY;

    if (!expectedSecret || token !== expectedSecret) {
      return NextResponse.json(
        { status: 'error', message: 'No autorizado: Token inválido o WEB_API_SECRET_KEY faltante' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const products = body.products || body.items || [];

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { status: 'error', message: "Payload inválido. Falta el arreglo 'products'." },
        { status: 400 }
      );
    }

    const catalogPath = path.join(process.cwd(), 'public', 'assets', 'data', 'productos_locales.json');
    const dirPath = path.dirname(catalogPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let catalogo: Record<string, any> = {};
    if (fs.existsSync(catalogPath)) {
      try {
        const raw = fs.readFileSync(catalogPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item.id) catalogo[String(item.id)] = item;
          });
        }
      } catch (e) {
        console.error('Error leyendo catálogo previo:', e);
      }
    }

    let recibidos = 0;
    for (const item of products) {
      const id = String(item.sku || item.id || item.barcode);
      const stockNum = Math.max(0, parseInt(item.stock || 0, 10));

      catalogo[id] = {
        id,
        sku: id,
        barcode: String(item.barcode || id),
        name: String(item.name || '').trim(),
        price: parseFloat(item.price || 0.0),
        stock: stockNum,
        available: stockNum > 0,
        image: /assets/products/ + (item.barcode || id) + .webp,
        isPresale: false,
        updated_at: new Date().toISOString()
      };
      recibidos++;
    }

    fs.writeFileSync(catalogPath, JSON.stringify(Object.values(catalogo), null, 2), 'utf-8');

    return NextResponse.json({
      status: 'success',
      received: recibidos,
      total_catalog_size: Object.keys(catalogo).length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
