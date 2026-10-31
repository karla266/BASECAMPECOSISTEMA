'use client'

import { useMemo, useState } from 'react'

const DEFAULT_URLS = [
  'https://tiaraexpress.mx/categoria/otros-productos',
  'https://tienda.bluntwrap.com.mx/collections/bluntwrap-hemp',
  'https://tienda.bluntwrap.com.mx/collections/bluntwrap-2x',
]

export default function PanelCatalogoBlunts() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [mostrarSinExistencia, setMostrarSinExistencia] = useState(false)
  const [error, setError] = useState('')
  const [syncNotice, setSyncNotice] = useState('')
  const [urls, setUrls] = useState(DEFAULT_URLS.join('\n'))

  const sincronizarCatalogo = async () => {
    setCargando(true)
    setError('')

    try {
      const sourceUrls = urls
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

      const response = await fetch('/api/admin/catalogo/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: sourceUrls.length ? sourceUrls : DEFAULT_URLS }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo sincronizar el catálogo.')
      }

      setProductos(Array.isArray(data.items) ? data.items : [])
      setSyncNotice(`Catálogo sincronizado: ${Array.isArray(data.items) ? data.items.length : 0} productos cargados.`)
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'No se pudo sincronizar.')
      setSyncNotice('')
    } finally {
      setCargando(false)
    }
  }

  const inyectarAlPos = async () => {
    setIsSyncing(true)
    setError('')
    setSyncNotice('')

    try {
      const response = await fetch('/api/pos/sincronizar-catalogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo inyectar el catálogo al POS.')
      }

      setSyncNotice(`POS sincronizado: ${Number(data.count) || 0} productos registrados.`)
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'No se pudo sincronizar el POS.')
      setSyncNotice('')
    } finally {
      setIsSyncing(false)
    }
  }

  const productosVisibles = useMemo(() => {
    if (!mostrarSinExistencia) {
      return productos.filter((producto) => Number(producto.stock) > 0)
    }

    return productos
  }, [productos, mostrarSinExistencia])

  const cambiarStock = (index, nextStock) => {
    setProductos((prev) => prev.map((producto, i) => (i === index ? { ...producto, stock: nextStock } : producto)))
  }

  const editarProducto = (producto) => {
    const nuevoStock = window.prompt(`Stock actual de ${producto.nombre}:`, String(producto.stock))
    if (nuevoStock === null) return

    const parsed = Number(nuevoStock)
    if (Number.isFinite(parsed)) {
      cambiarStock(productos.indexOf(producto), Math.max(0, Math.round(parsed)))
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">The Trip Smoke Shop</p>
              <h2 className="mt-2 text-3xl font-black text-white">Catálogo base de venta</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={sincronizarCatalogo}
                disabled={cargando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />
                    Sincronizando...
                  </>
                ) : (
                  'Sincronizar y Descargar Catálogo'
                )}
              </button>

              <button
                type="button"
                onClick={inyectarAlPos}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSyncing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200/40 border-t-cyan-200" />
                    Inyectando...
                  </>
                ) : (
                  'Inyectar al POS / Caja'
                )}
              </button>

              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span className="text-xs font-medium text-slate-200">Mostrar productos sin existencia</span>
                <button
                  type="button"
                  aria-label="mostrar productos sin existencia"
                  onClick={() => setMostrarSinExistencia((prev) => !prev)}
                  className={`relative h-6 w-11 rounded-full transition ${mostrarSinExistencia ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${mostrarSinExistencia ? 'left-6' : 'left-1'}`}
                  />
                </button>
              </label>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            URLs base para importar
          </label>
          <textarea
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-xs text-slate-100 outline-none focus:border-emerald-400"
            placeholder="https://...\nhttps://..."
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {syncNotice ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {syncNotice}
          </div>
        ) : null}

        {productosVisibles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center text-slate-400">
            {productos.length === 0
              ? 'Aún no hay catálogo sincronizado. Pulsa “Sincronizar y Descargar Catálogo”.'
              : 'No hay productos visibles con el filtro actual.'}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {productosVisibles.map((producto, index) => {
              const stock = Number(producto.stock) || 0
              const isAgotado = stock === 0
              const image = Array.isArray(producto.media?.images) ? producto.media.images[0] : ''
              const mediaDone = Array.isArray(producto.media?.images) ? producto.media.images.filter(Boolean).length : 0
              const hasVideo = Boolean(producto.media?.video)

              return (
                <article
                  key={`${producto.sku}-${index}`}
                  className={`group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:border-slate-700 ${
                    isAgotado ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <div className="relative h-52 overflow-hidden border-b border-slate-800 bg-slate-800">
                    {image ? (
                      <img src={image} alt={producto.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-500">
                        Sin imagen
                      </div>
                    )}

                    {isAgotado ? (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        AGOTADO
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">{producto.sku}</p>
                        <h3 className="mt-2 text-lg font-bold text-white">{producto.nombre}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Precio</span>
                      <span className="text-base font-black text-amber-300">${Number(producto.precio || 0).toFixed(2)} MXN</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Stock</span>
                      <span className={`font-bold ${stock === 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                        {stock}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Pipeline multimedia</span>
                        <span className="font-semibold text-slate-200">
                          {mediaDone}/4 imágenes
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Video</span>
                        <span className={`font-semibold ${hasVideo ? 'text-emerald-300' : 'text-slate-500'}`}>
                          {hasVideo ? 'Listo' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => editarProducto(producto)}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => cambiarStock(index, 0)}
                        className="flex-1 rounded-xl bg-red-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-400"
                      >
                        Forzar stock 0
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
