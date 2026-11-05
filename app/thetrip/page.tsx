'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { posApiUrl } from '@/lib/apiBase'
import BannerDropCountdown from '@/components/thetrip/BannerDropCountdown'
import BluntWrapSelector from '@/components/thetrip/BluntWrapSelector'
import CatalogoPreVenta from '@/components/thetrip/CatalogoPreVenta'
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
  tipo_disponibilidad?: 'stock_fisico' | 'sobre_pedido' | string
  fase_comercial?: string
  mercadolibre_url?: string
  costo?: number
  departamento?: string
  subcategoria?: string
}

type VistaCatalogo = 'stock_fisico' | 'sobre_pedido'

function pesosDesdeCents(cents: number): string {
  const abs = Math.abs(Math.trunc(cents))
  const pesos = Math.floor(abs / 100)
  const fraccion = String(abs % 100).padStart(2, '0')
  return `${pesos}.${fraccion}`
}

function textoRestante(iso: string, ahora = Date.now()): string {
  const destino = Date.parse(iso)
  if (!Number.isFinite(destino)) return '--'
  const delta = Math.max(0, destino - ahora)
  const totalSeg = Math.floor(delta / 1000)
  const dias = Math.floor(totalSeg / 86400)
  const horas = Math.floor((totalSeg % 86400) / 3600)
  const minutos = Math.floor((totalSeg % 3600) / 60)
  const segundos = totalSeg % 60
  return `${dias}d ${horas}h ${minutos}m ${segundos}s`
}

const CATEGORIAS = ['TODOS', 'CRISTALERIA', 'ROLADO', 'GRINDERS', 'VAPORIZADORES', 'ACCESORIOS']

export default function TheTripSmokeShop() {
  const [mayorDeEdad, setMayorDeEdad] = useState<boolean | null>(null)
  const [productos, setProductos] = useState<ProductoSmoke[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS')
  const [vista, setVista] = useState<VistaCatalogo>('stock_fisico')
  const [proximoCorte, setProximoCorte] = useState('')
  const [fondosCents, setFondosCents] = useState(0)
  const [faltanteCents, setFaltanteCents] = useState(250000)
  const [reloj, setReloj] = useState(Date.now())
  const [query, setQuery] = useState('')

  useEffect(() => {
    const verificado = localStorage.getItem('thetrip_adult_verified')
    setMayorDeEdad(verificado === 'true')
  }, [])

  const confirmarEdad = () => {
    localStorage.setItem('thetrip_adult_verified', 'true')
    setMayorDeEdad(true)
  }

  const cargarCatalogoMostrador = async () => {
    const params = new URLSearchParams()
    params.set('categoria', categoriaActiva)
    params.set('only_in_stock', 'true')
    params.set('limit', '120')
    if (query.trim()) params.set('q', query.trim())
    const response = await fetch(`${posApiUrl('/api/v1/thetrip/productos/search')}?${params.toString()}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`No se pudo cargar el catalogo (${response.status})`)
    }
    const data = await response.json()
    setProductos(Array.isArray(data.items) ? data.items : [])
  }

  const cargarCatalogo = async () => {
    const params = new URLSearchParams()
    params.set('disponibilidad', vista)
    params.set('categoria', categoriaActiva)
    params.set('limit', '120')
    if (query.trim()) params.set('q', query.trim())
    const response = await fetch(`${posApiUrl('/api/v1/factory/catalog')}?${params.toString()}`, { cache: 'no-store' })
    if (!response.ok) {
      if (vista === 'stock_fisico') {
        await cargarCatalogoMostrador()
        return
      }
      throw new Error(`No se pudo cargar el catalogo (${response.status})`)
    }
    const data = await response.json()
    setProductos(Array.isArray(data.items) ? data.items : [])
  }

  const cargarCorte = async () => {
    const response = await fetch(posApiUrl('/api/v1/factory/preorders-status'), { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setProximoCorte(typeof data.proximo_corte === 'string' ? data.proximo_corte : '')
    setFondosCents(Number.isFinite(data.fondos_acumulados_cents) ? data.fondos_acumulados_cents : 0)
    setFaltanteCents(Number.isFinite(data.faltante_cents) ? data.faltante_cents : 250000)
  }

  useEffect(() => {
    if (!mayorDeEdad) return
    cargarCatalogo().catch((error) => {
      console.error('No se pudo consultar el catalogo de The Trip:', error)
      setProductos([])
    })
  }, [mayorDeEdad, categoriaActiva, query, vista])

  useEffect(() => {
    if (!mayorDeEdad || vista !== 'sobre_pedido') return
    cargarCorte().catch(() => undefined)
    const timer = window.setInterval(() => setReloj(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [mayorDeEdad, vista])

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
              El contenido y la parafernalia mostrados en este sitio estan destinados exclusivamente a personas mayores
              de edad con fines legales y de coleccion.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={confirmarEdad}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
            >
              Soy mayor de 18 anos - Entrar
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
      <BannerDropCountdown />
      <section className="py-16 px-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase rounded-full">
            Division de Parafernalia y 420 Lifestyle
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            THE TRIP <span className="text-amber-500 font-light">SMOKE SHOP</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto">
            Catalogo conectado a inventario SICAR/Micro-POS con preparación de pedidos para envío o recolección.
          </p>
        </div>
      </section>

      <BluntWrapSelector />
      <CatalogoPreVenta />

      <section className="max-w-6xl mx-auto px-6 py-8 space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setVista('stock_fisico')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition border ${
              vista === 'stock_fisico'
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Entrega Inmediata (Mostrador)
          </button>
          <button
            onClick={() => setVista('sobre_pedido')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition border ${
              vista === 'sobre_pedido'
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Sobre Pedido (Catálogo Extendido)
          </button>
        </div>
        {vista === 'sobre_pedido' ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Corte semanal</p>
            <p className="text-sm text-amber-100">
              Miércoles y domingos a las 20:00. Siguiente corte en {proximoCorte ? textoRestante(proximoCorte, reloj) : '--'}.
            </p>
            <p className="text-xs text-zinc-300">
              Fondos para la orden consolidada: ${pesosDesdeCents(fondosCents)} MXN. Faltan ${pesosDesdeCents(faltanteCents)} MXN para el umbral de $2500.00 MXN.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition border ${
                categoriaActiva === cat
                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="max-w-xl mx-auto">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Búsqueda avanzada: SKU, nombre o descripción"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-400"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        {productos.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">No se encontraron productos para el filtro actual.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productos.map((item) => (
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
                    <span className="text-xs text-zinc-600 font-mono">{item.imagen_url || 'Sin imagen'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.nombre}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{item.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-black text-white">${Number(item.precio).toLocaleString('es-MX')} MXN</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {vista === 'sobre_pedido' ? 'Siguiente corte semanal' : `${item.stock} en tienda`}
                    </span>
                  </div>
                  <BotonCompraProducto
                    nombre={item.nombre}
                    sku={item.sku}
                    fase={item.fase_comercial || (vista === 'sobre_pedido' ? 'PREVENTA' : 'EN_STOCK')}
                    categoria={item.categoria}
                    departamento={item.departamento}
                    subcategoria={item.subcategoria}
                    precio={Number(item.precio) || 0}
                    costo={item.costo}
                    imagen_url={item.imagen_url}
                    className="mt-0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Checkout interno</h2>
          <p className="text-sm text-zinc-400">
            Agrega el producto al carrito y termina la compra en el checkout de Basecamp. La pre-venta se aparta aquí y el envío sale cuando llega a tienda.
          </p>
          <a href="/checkout" className="flex min-h-12 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-zinc-950">
            Proceder al Pago
          </a>
        </div>
      </section>
    </div>
  )
}
