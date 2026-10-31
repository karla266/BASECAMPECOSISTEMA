'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bc420.point.active.device';

type CatalogProduct = {
  id: string;
  sku: string;
  barcode: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string;
  activo: boolean;
};

type CartItem = {
  product: CatalogProduct;
  quantity: number;
};

const normalizeToken = (value: string): string => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export function ProductTable() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filter, setFilter] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [activeTerminal, setActiveTerminal] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setActiveTerminal(localStorage.getItem(STORAGE_KEY) || '');

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/pos/productos', { cache: 'no-store' });
        const data = (await response.json()) as {
          success?: boolean;
          count?: number;
          productos?: CatalogProduct[];
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'No se pudieron cargar los productos del POS.');
        }

        setProducts(Array.isArray(data.productos) ? data.productos : []);
      } catch (error: unknown) {
        setStatus(error instanceof Error ? error.message : 'No se pudieron cargar los productos.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const token = normalizeToken(filter);
    if (!token) return products;
    return products.filter((product) => {
      const includesSku = normalizeToken(product.sku).includes(token);
      const includesBarcode = normalizeToken(product.barcode).includes(token);
      const includesName = normalizeToken(product.nombre).includes(token);
      return includesSku || includesBarcode || includesName;
    });
  }, [filter, products]);

  const totalCart = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.precio * item.quantity, 0),
    [cart],
  );

  const updateProductStock = (product: CatalogProduct, nextStock: number) => {
    const normalizedStock = Math.max(0, Math.round(Number(nextStock) || 0));
    setProducts((current) =>
      current.map((item) =>
        item.sku === product.sku
          ? { ...item, stock: normalizedStock, activo: normalizedStock > 0 }
          : item,
      ),
    );
    setStatus(`Stock actualizado para ${product.nombre}: ${normalizedStock} unidades.`);
  };

  const addProductToCart = (product: CatalogProduct, quantity = 1) => {
    if (!product.activo || product.stock <= 0) {
      setStatus(`El producto ${product.nombre} no tiene existencia disponible.`);
      return;
    }

    const nextQuantity = Math.max(1, Number(quantity) || 1);
    setCart((current) => {
      const existing = current.find((item) => item.product.sku === product.sku);
      if (existing) {
        return current.map((item) =>
          item.product.sku === product.sku
            ? {
                ...item,
                quantity: Math.min(item.quantity + nextQuantity, product.stock),
              }
            : item,
        );
      }
      return [...current, { product, quantity: Math.min(nextQuantity, product.stock) }];
    });
    setStatus(`${product.nombre} agregado al carrito.`);
    setScannerInput('');
  };

  const resolveProductByScan = (value: string) => {
    const token = normalizeToken(value);
    if (!token) return null;

    return (
      products.find((product) => {
        const sku = normalizeToken(product.sku);
        const barcode = normalizeToken(product.barcode || product.sku);
        return sku === token || barcode === token;
      }) || null
    );
  };

  const handleScannerSubmit = () => {
    const resolved = resolveProductByScan(scannerInput);
    if (!resolved) {
      setStatus('No se encontró coincidencia por SKU/barcode en el catálogo del POS.');
      return;
    }
    addProductToCart(resolved, 1);
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      setStatus('El carrito está vacío.');
      return;
    }

    const terminalId = activeTerminal || localStorage.getItem(STORAGE_KEY) || '';
    if (!terminalId) {
      setStatus('Selecciona una terminal Point antes de cobrar.');
      return;
    }

    setIsPaying(true);
    setStatus('Esperando tarjeta en la terminal Point...');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            sku: item.product.sku,
            barcode: item.product.barcode,
            cantidad: item.quantity,
            precio: item.product.precio,
            title: item.product.nombre,
            quantity: item.quantity,
          })),
          metodoPago: 'point',
          deviceIdOverride: terminalId,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string; message?: string; checkoutUrl?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'No se pudo completar el cobro con Point.');
      }

      setStatus('Cobro con Point confirmado. Imprimiendo ticket...');
      await fetch('/api/pos/impresion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skus: cart.map((item) => item.product.sku),
          source: 'local',
        }),
      });
      setCart([]);
      setStatus('Venta cerrada correctamente.');
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'Error en el cobro.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-2xl shadow-slate-950/20">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">Micro-POS</p>
          <h2 className="mt-1 text-2xl font-black text-white">Caja / Catálogo The Trip</h2>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={scannerInput}
            onChange={(event) => setScannerInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleScannerSubmit();
              }
            }}
            placeholder="Escanea o escribe SKU/barcode"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500 md:w-72"
          />
          <button
            type="button"
            onClick={handleScannerSubmit}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.75fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Buscar producto por nombre, SKU o barcode"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
              Cargando catálogo de The Trip...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
              No hay productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredProducts.map((product) => (
                <article key={product.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <div className="flex gap-3">
                    <img
                      src={product.imagen || '/placeholder-product.png'}
                      alt={product.nombre}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{product.sku}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-white">{product.nombre}</h3>
                      <p className="mt-1 text-lg font-black text-amber-300">${product.precio.toFixed(2)} MXN</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                        <span>Stock: {product.stock}</span>
                        <span className={product.stock > 0 ? 'text-emerald-300' : 'text-red-300'}>
                          {product.stock > 0 ? 'Disponible' : 'Sin stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const value = window.prompt(`Stock actual de ${product.nombre}:`, String(product.stock));
                        if (value === null) return;
                        updateProductStock(product, Number(value));
                      }}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
                    >
                      Editar stock
                    </button>
                    <button
                      type="button"
                      onClick={() => addProductToCart(product, 1)}
                      disabled={product.stock <= 0}
                      className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Carrito</h3>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-cyan-300">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} uds
            </span>
          </div>

          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
                Sin artículos en el carrito.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.sku} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-2">
                  <img src={item.product.imagen || '/placeholder-product.png'} alt={item.product.nombre} className="h-12 w-12 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{item.product.nombre}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-300">${(item.product.precio * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{item.quantity} und</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Total</span>
              <span className="text-xl font-black text-white">${totalCart.toFixed(2)}</span>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Terminal activa: {activeTerminal || 'Sin terminal'}
            </div>
          </div>

          <button
            type="button"
            disabled={isPaying || cart.length === 0}
            onClick={() => void handleCheckout()}
            className="mt-4 w-full rounded-lg bg-emerald-500 px-3 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isPaying ? 'Esperando tarjeta en la terminal Point...' : 'Cobrar con Point'}
          </button>

          {status ? <p className="mt-3 text-xs text-cyan-300">{status}</p> : null}
        </aside>
      </div>
    </section>
  );
}
