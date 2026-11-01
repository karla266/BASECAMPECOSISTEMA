'use client'

import { useEffect, useMemo, useState } from 'react'
import { posApiUrl } from '@/lib/apiBase'
import BannerDropCountdown from '@/components/thetrip/BannerDropCountdown'
import BluntWrapSelector from '@/components/thetrip/BluntWrapSelector'
import CatalogoPreVenta from '@/components/thetrip/CatalogoPreVenta'
import BotonCompraProducto from '@/components/thetrip/BotonCompraProducto'
import { faseComercial } from '@/lib/ctaProducto'
import { useCart } from '@/context/CartContext'

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

interface CartLine extends ProductoSmoke {
  quantity: number
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
  const [cart, setCart] = useState<CartLine[]>([])
  const { addItem } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'local_delivery'>('pickup')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cartTotal = useMemo(() => cart.reduce((sum, line) => sum + Number(line.precio) * line.quantity, 0), [cart])

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

  const registrarAnticipo = async (producto: ProductoSmoke) => {
    if (!customerPhone.trim()) {
      setMensaje('Escribe el teléfono en el pedido para registrar el anticipo.')
      return
    }
    setLoading(true)
    setMensaje('')
    try {
      const response = await fetch(posApiUrl('/api/v1/factory/preorders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: customerPhone.trim(),
          sku: producto.sku,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo registrar el anticipo.')
      }
      setMensaje(
        `Anticipo ${data.orden_id}: pagado $${pesosDesdeCents(data.anticipo_pagado_cents)} MXN, saldo $${pesosDesdeCents(data.saldo_pendiente_cents)} MXN.`,
      )
      await cargarCorte()
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'No se pudo registrar el anticipo.'
      setMensaje(detail)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (producto: ProductoSmoke) => {
    setCart((prev) => {
      const found = prev.find((item) => item.sku === producto.sku)
      if (found) {
        return prev.map((item) => (item.sku === producto.sku ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...producto, quantity: 1 }]
    })
  }

  const updateQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.sku === sku ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const finalizarCompra = async () => {
    if (!cart.length) {
      setMensaje('Agrega productos al carrito para continuar.')
      return
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setMensaje('Nombre y teléfono son obligatorios para procesar el pedido.')
      return
    }

    setLoading(true)
    setMensaje('')
    try {
      await fetch(posApiUrl('/api/v1/web/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: customerName.trim(),
          email: customerEmail.trim() || `${customerPhone.replace(/\D/g, '')}@thetrip.local`,
          telefono: customerPhone.trim(),
          rfc: '',
          tenant_id: 'basecamp_420',
        }),
      })

      const items = cart.map((item) => ({
        sku: item.sku,
        title: item.nombre,
        quantity: item.quantity,
        price: Number(item.precio),
        category: 'parafernalia',
      }))

      const orderResponse = await fetch(posApiUrl('/api/v1/thetrip/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim(),
          delivery_type: deliveryType,
          notes: notes.trim(),
          items,
        }),
      })
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || 'No se pudo registrar el pedido para preparación.')
      }

      const mpResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const mpData = await mpResponse.json()
      if (!mpResponse.ok || !mpData.init_point) {
        throw new Error(mpData.error || 'No se pudo iniciar checkout de Mercado Pago.')
      }

      window.location.href = mpData.init_point
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'No se pudo completar la compra.'
      setMensaje(detail)
    } finally {
      setLoading(false)
    }
  }

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
            <a
              href="/"
              className="block w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold rounded-xl text-xs transition"
            >
              Salir hacia Basecamp 420
            </a>
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
                  {faseComercial(item.fase_comercial) === 'PREVENTA' ? (
                    <>
                      <BotonCompraProducto
                        nombre={item.nombre}
                        sku={item.sku}
                        fase={item.fase_comercial}
                        categoria={item.categoria}
                        mercadolibre_url={item.mercadolibre_url}
                        link_cobro={item.link_cobro_mp}
                        className="mt-0"
                      />
                      <button
                        type="button"
                        onClick={() => addItem({
                          sku: item.sku,
                          nombre: item.nombre,
                          precio: Number(item.precio) || 0,
                          imagen_url: item.imagen_url || '',
                          disponibilidad: 'PREVENTA',
                          mercadolibre_url: item.mercadolibre_url || item.link_cobro_mp || '',
                        })}
                        className="w-full block text-center py-2.5 border border-zinc-600 text-white font-bold text-xs rounded-xl"
                      >
                        Agregar al Carrito
                      </button>
                    </>
                  ) : faseComercial(item.fase_comercial) === 'EN_STOCK' ? (
                    <>
                      <a href="/thetrip#checkout" className="w-full block text-center py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl">
                        Comprar / Retiro en tienda
                      </a>
                      <button
                        type="button"
                        onClick={() => addItem({
                          sku: item.sku,
                          nombre: item.nombre,
                          precio: Number(item.precio) || 0,
                          imagen_url: item.imagen_url || '',
                          disponibilidad: 'EN_STOCK',
                          mercadolibre_url: item.mercadolibre_url || '',
                        })}
                        className="w-full block text-center py-2.5 border border-zinc-600 text-white font-bold text-xs rounded-xl"
                      >
                        Agregar al Carrito
                      </button>
                    </>
                  ) : vista === 'sobre_pedido' ? (
                    <button
                      onClick={() => registrarAnticipo(item)}
                      disabled={loading}
                      className="w-full block text-center py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold text-xs rounded-xl transition uppercase tracking-wider"
                    >
                      Registrar anticipo
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full block text-center py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition uppercase tracking-wider"
                    >
                      Agregar al carrito
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {vista === 'stock_fisico' ? (
      <section id="checkout" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h2 className="text-lg font-semibold">Checkout y preparación de pedido</h2>
          <div className="space-y-2 text-sm">
            {cart.length === 0 ? (
              <p className="text-zinc-500">Tu carrito está vacío.</p>
            ) : (
              cart.map((line) => (
                <div key={line.sku} className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold">{line.nombre}</span>
                    <span className="ml-2 text-zinc-400 text-xs">{line.sku}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(line.sku, -1)} className="rounded bg-zinc-800 px-2 py-1 text-xs">
                      -
                    </button>
                    <span className="font-mono">{line.quantity}</span>
                    <button onClick={() => updateQty(line.sku, 1)} className="rounded bg-zinc-800 px-2 py-1 text-xs">
                      +
                    </button>
                    <span className="font-mono">${(line.quantity * Number(line.precio)).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-right font-bold text-amber-400">Total: ${cartTotal.toFixed(2)} MXN</div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nombre completo"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Teléfono"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <input
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="Correo (opcional)"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm md:col-span-2"
            />
            <select
              value={deliveryType}
              onChange={(event) => setDeliveryType(event.target.value as 'pickup' | 'local_delivery')}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="pickup">Recolección en tienda</option>
              <option value="local_delivery">Envío local discreto</option>
            </select>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notas de preparación o envío"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            disabled={loading}
            onClick={finalizarCompra}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
          >
            {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
          </button>
          {mensaje ? <p className="text-sm text-red-300">{mensaje}</p> : null}
        </div>
      </section>
      ) : (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <h2 className="text-lg font-semibold">Anticipo de sobre pedido</h2>
            <p className="text-sm text-zinc-400">
              El anticipo no pasa por la caja del mostrador. Deja el teléfono y usa el botón de cada producto. El saldo se liquida al corte de miércoles o domingo.
            </p>
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Teléfono para el anticipo"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            {mensaje ? <p className="text-sm text-amber-200">{mensaje}</p> : null}
          </div>
        </section>
      )}
    </div>
  )
}
