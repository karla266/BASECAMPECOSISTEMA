'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { posApiUrl } from '@/lib/apiBase'
import BotonCompraProducto from '@/components/thetrip/BotonCompraProducto'

interface ProductoSmoke {
  id: number
  sku: string
  nombre: string
  categoria: string
  descripcion: string
  precio: number
  precio_cents?: number
  stock: number
  imagen_url: string
  link_cobro_mp: string
  departamento?: string
  subcategoria?: string
}

const CATEGORIAS = ['TODOS', 'CRISTALERIA', 'ROLADO', 'GRINDERS', 'VAPORIZADORES', 'ACCESORIOS']

export default function TheTripSmokeShop() {
  const [mayorDeEdad, setMayorDeEdad] = useState<boolean | null>(null)
  const [productos, setProductos] = useState<ProductoSmoke[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const verificado = localStorage.getItem('thetrip_adult_verified')
    setMayorDeEdad(verificado === 'true')
  }, [])

  const confirmarEdad = () => {
    localStorage.setItem('thetrip_adult_verified', 'true')
    setMayorDeEdad(true)
  }

  // Cargar catálogo completo una sola vez al iniciar
  useEffect(() => {
    if (!mayorDeEdad) return
    async function fetchCatalogo() {
      try {
        const response = await fetch(posApiUrl('/api/v1/thetrip/productos/search?limit=500'), { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setProductos(Array.isArray(data.items) ? data.items : [])
        }
      } catch (error) {
        console.error('Error al cargar catálogo:', error)
      }
    }
    fetchCatalogo()
  }, [mayorDeEdad])

  // Filtrado local en tiempo real por categoría y texto de búsqueda
  const productosFiltrados = useMemo(() => {
    return productos.filter((item) => {
      const cumpleCategoria = categoriaActiva === 'TODOS' || item.categoria?.toUpperCase() === categoriaActiva.toUpperCase()
      const q = query.toLowerCase().trim()
      const cumpleQuery =
        !q ||
        item.nombre?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.descripcion?.toLowerCase().includes(q)
      return cumpleCategoria && cumpleQuery
    })
  }, [productos, categoriaActiva, query])

  if (mayorDeEdad === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Validando acceso...</p>
      </div>
    )
  }

  if (mayorDeEdad === false) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6">
          <div className="inline-block p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 font-bold text-xl">
            Acceso 18+
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wider">THE TRIP SMOKE SHOP</h2>
            <p className="text-xs text-zinc-400 mt-2">
              El contenido y la parafernalia mostrados en este sitio están destinados exclusivamente a personas mayores
              de edad con fines legales y de colección.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={confirmarEdad}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
            >
              Soy mayor de 18 años - Entrar
            </button>
            <Link
              href="/"
              className="block w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold rounded-xl text-xs transition"
            >
              Salir hacia Basecamp 420
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Cabecera Principal */}
      <section className="py-16 px-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase rounded-full">
            División de Parafernalia y 420 Lifestyle
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            THE TRIP <span className="text-amber-500 font-light">SMOKE SHOP</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto">
            Catálogo general conectado a inventario SICAR/Micro-POS con preparación de pedidos para envío o recolección.
          </p>
        </div>
      </section>

      {/* Controles Unificados: Buscador y Categorías */}
      <section className="max-w-6xl mx-auto px-6 py-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
          <div className="w-full md:w-96">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por SKU, nombre o descripción..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-400"
            />
          </div>

          <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wider transition border whitespace-nowrap ${
                    categoriaActiva === cat
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Listado de Productos Filtrados */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-xs">No se encontraron productos para el filtro actual.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productosFiltrados.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-zinc-400">{item.sku}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">{item.categoria}</span>
                  </div>
                  <div className="h-44 w-full bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-center mb-4 overflow-hidden relative">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono">Sin imagen</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.nombre}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{item.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-black text-white">${Number(item.precio).toLocaleString('es-MX')} MXN</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">{item.stock} en tienda</span>
                  </div>
                  <BotonCompraProducto
                    nombre={item.nombre}
                    sku={item.sku}
                    fase="EN_STOCK"
                    categoria={item.categoria}
                    departamento={item.departamento}
                    subcategoria={item.subcategoria}
                    precio={Number(item.precio) || 0}
                    imagen_url={item.imagen_url}
                    className="mt-0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Checkout interno */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Checkout interno</h2>
          <p className="text-sm text-zinc-400">
            Agrega los productos al carrito y finaliza tu compra de forma segura.
          </p>
          <a href="/checkout" className="flex min-h-12 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-zinc-950">
            Proceder al Pago
          </a>
        </div>
      </section>
    </div>
  )
}