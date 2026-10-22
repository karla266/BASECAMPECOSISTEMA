import { NextRequest, NextResponse } from 'next/server';
import { InventoryRow, searchStore, selectedStores } from '@/lib/inventory';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const storeParam = searchParams.get('store');

  const stores = selectedStores(storeParam);
  const results: InventoryRow[] = [];
  const errors: string[] = [];

  for (const store of stores) {
    try {
      results.push(...(await searchStore(store, query)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${store.label}: ${message}`);
      console.error(`Error al conectar con SICAR ${store.label}:`, message);
    }
  }

  if (results.length === 0 && errors.length > 0) {
    return NextResponse.json(
      { success: false, error: errors.join('; ') },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    data: results,
    ...(errors.length > 0 ? { warnings: errors } : {}),
  });
}
