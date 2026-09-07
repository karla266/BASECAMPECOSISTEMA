import { NextResponse } from 'next/server';
import { poolMadera, poolSmokeshop } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const store = searchParams.get('store') || 'all';

  try {
    let results: any[] = [];

    // Búsqueda en Papelería Madera (3306)
    if (store === 'all' || store === 'madera') {
      try {
        const [rowsMadera]: any = await poolMadera.execute(
          'SELECT clave, descripcion, existencia, precio FROM articulo WHERE descripcion LIKE ? LIMIT 10',
          [`%${query}%`]
        );
        results.push(...rowsMadera.map((item: any) => ({ ...item, sucursal: 'Papelería Madera (3306)' })));
      } catch (err: any) {
        console.error('Error al conectar con SICAR Madera:', err.message);
      }
    }

    // Búsqueda en Smokeshop / Tienda General (3307)
    if (store === 'all' || store === 'smokeshop') {
      try {
        const [rowsSmokeshop]: any = await poolSmokeshop.execute(
          'SELECT clave, descripcion, existencia, precio FROM articulo WHERE descripcion LIKE ? LIMIT 10',
          [`%${query}%`]
        );
        results.push(...rowsSmokeshop.map((item: any) => ({ ...item, sucursal: 'Tienda General (3307)' })));
      } catch (err: any) {
        console.error('Error al conectar con SICAR Smokeshop:', err.message);
      }
    }

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
