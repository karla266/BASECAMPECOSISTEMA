"use client"

import React, { useEffect, useState } from 'react'
import { posApiUrl } from '@/lib/apiBase'

interface Propuesta {
  id: number
  fecha: string
  hora: string
  tipo: string
  resumen: string
  hallazgo: string
  propuesta: string
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  estado: 'PENDIENTE' | 'APROBADA' | 'DESCARTADA'
}

function GestorFavicon() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const manejarSeleccion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setArchivo(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const guardarFavicon = async () => {
    if (!archivo) return
    setCargando(true)
    setMensaje(null)

    const formData = new FormData()
    formData.append('file', archivo)

    try {
      const res = await fetch(posApiUrl('/api/v1/admin/settings/favicon'), {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setMensaje('Favicon actualizado con éxito. Recarga la app para ver los cambios.')
      } else {
        setMensaje(`Error: ${data.detail || 'No se pudo actualizar'}`)
      }
    } catch (err) {
      setMensaje('Error de conexión con el servidor POS.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#f4f4f5' }}>Ícono y Favicon de Aplicación</h3>
      <p style={{ margin: '0 0 18px', fontSize: '0.75rem', color: '#a1a1aa' }}>
        Personaliza el ícono de la pestaña y la ventana independiente del Micro-POS.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#09090b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          ) : (
            <img
              src={posApiUrl('/favicon.ico')}
              alt="Actual"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
        </div>

        <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '10px 14px', backgroundColor: '#27272a', color: '#e4e4e7', borderRadius: '10px', border: '1px solid #3f3f46', fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s ease' }}>
          Seleccionar Archivo
          <input type="file" accept=".ico,.png,.svg,.jpg,.jpeg" style={{ display: 'none' }} onChange={manejarSeleccion} />
        </label>
      </div>

      {archivo && (
        <button
          onClick={guardarFavicon}
          disabled={cargando}
          style={{ width: '100%', padding: '10px 12px', backgroundColor: cargando ? '#059669' : '#10b981', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: cargando ? 'default' : 'pointer', opacity: cargando ? 0.7 : 1, fontSize: '0.72rem' }}
        >
          {cargando ? 'Subiendo...' : 'Aplicar Nuevo Favicon'}
        </button>
      )}

      {mensaje && (
        <p style={{ marginTop: '12px', color: '#d4d4d8', backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px', fontSize: '0.72rem', lineHeight: 1.5 }}>
          {mensaje}
        </p>
      )}
    </div>
  )
}

function MandoControlRemoto() {
  const [estadoCaja, setEstadoCaja] = useState<'ACTIVA' | 'BLOQUEADA'>('ACTIVA')
  const [mensaje, setMensaje] = useState('Auditoría en proceso, por favor espere.')

  const enviarComando = async (action: string, msg: string = '') => {
    try {
      await fetch(`${posApiUrl('/api/v1/admin/remote-control')}?action=${action}&message=${encodeURIComponent(msg)}`, {
        method: 'POST',
      })
      if (action === 'LOCK_SCREEN') setEstadoCaja('BLOQUEADA')
      if (action === 'UNLOCK_SCREEN') setEstadoCaja('ACTIVA')
    } catch (e) {
      console.error('Error al contactar con la caja:', e)
    }
  }

  return (
    <div style={{ maxWidth: '420px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#fca5a5' }}>🔴 Mando de Control Remoto</h3>
      <p style={{ margin: '0 0 18px', fontSize: '0.75rem', color: '#a1a1aa' }}>
        Toma el control de la pantalla física del mostrador. Utiliza el bloqueo para auditar transacciones sin que el vendedor intervenga.
      </p>

      <div style={{ display: 'grid', gap: '14px' }}>
        {estadoCaja === 'ACTIVA' ? (
          <div>
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Mensaje de bloqueo..."
              style={{ width: '100%', backgroundColor: '#09090b', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: '10px', padding: '10px 12px', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            <button
              onClick={() => enviarComando('LOCK_SCREEN', mensaje)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              🔒 Poner Pantalla en Negro
            </button>
          </div>
        ) : (
          <button
            onClick={() => enviarComando('UNLOCK_SCREEN')}
            style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
          >
            🔓 Desbloquear Caja
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          <button
            onClick={() => enviarComando('RELOAD_APP')}
            style={{ padding: '10px', backgroundColor: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
          >
            🔄 Forzar Recarga
          </button>
          <button
            onClick={() => {
              const msg = window.prompt('Escribe el mensaje para el vendedor:')
              if (msg) enviarComando('ALERT', msg)
            }}
            style={{ padding: '10px', backgroundColor: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
          >
            💬 Enviar Alerta
          </button>
        </div>
      </div>
    </div>
  )
}

function ControlAccesoMultimedia() {
  const [status, setStatus] = useState('Sin respuesta')
  const [kind, setKind] = useState('both')
  const [lastUpdated, setLastUpdated] = useState('')

  const consultarEstado = async () => {
    try {
      const res = await fetch(posApiUrl('/api/v1/admin/remote-media/status/mostrador_principal'))
      if (!res.ok) throw new Error('offline')
      const data = await res.json()
      setStatus(data.status || 'idle')
      setKind(data.kind || 'both')
      setLastUpdated(data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Ahora')
    } catch {
      setStatus('offline')
      setLastUpdated('No disponible')
    }
  }

  useEffect(() => {
    consultarEstado()
    const interval = setInterval(consultarEstado, 5000)
    return () => clearInterval(interval)
  }, [])

  const solicitarAcceso = async (opcion: 'camera' | 'microphone' | 'both') => {
    setKind(opcion)
    try {
      await fetch(`${posApiUrl('/api/v1/admin/remote-media')}?target_id=mostrador_principal&kind=${opcion}&message=${encodeURIComponent('Solicita permiso para acceder a audio o video del mostrador.')}`, {
        method: 'POST',
      })
      setStatus('requesting')
    } catch {
      setStatus('offline')
    }
  }

  return (
    <div style={{ maxWidth: '420px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>🎥 Acceso remoto a cámara y micrófono</h3>
      <p style={{ margin: '0 0 18px', fontSize: '0.75rem', color: '#a1a1aa' }}>
        Solicita permiso desde la máquina mostrador para activar cámara o micrófono localmente y supervisar la operación.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <button onClick={() => solicitarAcceso('camera')} style={{ padding: '10px', backgroundColor: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Cámara</button>
        <button onClick={() => solicitarAcceso('microphone')} style={{ padding: '10px', backgroundColor: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Micrófono</button>
        <button onClick={() => solicitarAcceso('both')} style={{ padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Ambos</button>
      </div>

      <div style={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px', fontSize: '0.72rem', color: '#d4d4d8', lineHeight: 1.6 }}>
        <div><strong>Estado:</strong> {status}</div>
        <div><strong>Tipo:</strong> {kind}</div>
        <div><strong>Última actualización:</strong> {lastUpdated}</div>
      </div>
    </div>
  )
}

function VistaCamarasNVR() {
  const [open, setOpen] = useState(false)
  const [camaras, setCamaras] = useState<Array<{ id: number; nombre_camara: string; tipo: string; rtsp_url: string; zona_vigilada: string; estado: string }>>([])
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await fetch(posApiUrl('/api/v1/system/nvr/cameras'), { method: 'GET' })
      if (!res.ok) {
        const fallback = await fetch(posApiUrl('/api/camaras'))
        const data = await fallback.json()
        if (data.success) {
          setCamaras(data.data)
          return
        }
        throw new Error('No hay cámaras disponibles')
      }
      const data = await res.json()
      setCamaras(data.camaras || data.data || [])
    } catch (error) {
      console.error('Error al cargar cámaras del NVR:', error)
      setCamaras([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#7dd3fc' }}>📹 Cámaras del NVR</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#a1a1aa' }}>Visualiza los canales registrados en el NVR y verifica el estado de cada cámara.</p>
        </div>
        <button
          onClick={() => {
            setOpen((prev) => !prev)
            if (!open) cargar()
          }}
          style={{ padding: '10px 12px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
        >
          {open ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {open && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {loading ? (
            <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Cargando cámaras del NVR...</div>
          ) : camaras.length === 0 ? (
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 12px' }}>
              No hay cámaras registradas en el NVR o no hay respuesta del backend.
            </div>
          ) : (
            camaras.map((cam) => (
              <div key={cam.id} style={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>{cam.nombre_camara}</strong>
                  <span style={{ color: '#86efac', fontSize: '0.68rem', backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '999px', padding: '2px 8px' }}>{cam.estado || 'ACTIVA'}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.68rem', lineHeight: 1.5 }}>
                  <div><strong>Tipo:</strong> {cam.tipo}</div>
                  <div><strong>Zona:</strong> {cam.zona_vigilada || 'Sin zona'}</div>
                  <div style={{ fontFamily: 'monospace', color: '#93c5fd', wordBreak: 'break-all' }}>{cam.rtsp_url || 'Sin URL RTSP'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface EmpresaConfig {
  nombre: string
  nombre_comercial: string
  slogan: string
  telefono: string
  direccion: string
  rfc: string
  color_primario: string
  titulo_documento: string
  ofrece_tours: boolean
  ofrece_vuelos: boolean
  ofrece_renta_equipo: boolean
  logo_url?: string
  favicon_url?: string
}

function GestorActualizacionesRemotas() {
  const [versionActual, setVersionActual] = useState<string>('Consultando...')
  const [nuevaVersion, setNuevaVersion] = useState<string>('1.2.1')
  const [notas, setNotas] = useState<string>('')
  const [archivoZip, setArchivoZip] = useState<File | null>(null)
  const [desplegando, setDesplegando] = useState<boolean>(false)
  const [logResultado, setLogResultado] = useState<string | null>(null)

  useEffect(() => {
    fetch(posApiUrl('/api/v1/system/version'))
      .then(async (res) => {
        if (!res.ok) throw new Error('offline')
        const data = await res.json()
        setVersionActual(data.version || 'Desconocida')
      })
      .catch(() => setVersionActual('Offline / No conectado'))
  }, [])

  const ejecutarDespliegue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivoZip) return

    setDesplegando(true)
    setLogResultado(null)

    const formData = new FormData()
    formData.append('file', archivoZip)
    formData.append('nueva_version', nuevaVersion || '1.2.1')
    formData.append('notas_version', notas)

    try {
      const res = await fetch(posApiUrl('/api/v1/system/update/apply'), {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setLogResultado(`✅ ${data.message} | Respaldo: ${data.backup_creado}`)
        setVersionActual(nuevaVersion || data.version || versionActual)
        setArchivoZip(null)
      } else {
        setLogResultado(`❌ Error: ${data.detail || 'Fallo desconocido'}`)
      }
    } catch (error) {
      setLogResultado('❌ Error de comunicación con la máquina local de mostrador.')
      console.error(error)
    } finally {
      setDesplegando(false)
    }
  }

  return (
    <div style={{ maxWidth: '620px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#f4f4f5' }}>Despliegue de Actualizaciones Remotas</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#a1a1aa' }}>Sube un paquete .ZIP para reinstalar código en la caja local.</p>
        </div>
        <span style={{ padding: '6px 10px', border: '1px solid #27272a', borderRadius: '8px', backgroundColor: '#09090b', color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 700 }}>
          v{versionActual}
        </span>
      </div>

      <form onSubmit={ejecutarDespliegue} style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>Paquete de actualización (.ZIP)</label>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => e.target.files && setArchivoZip(e.target.files[0])}
            required
            style={{ width: '100%', color: '#a1a1aa', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px 12px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
            Nueva versión
            <input value={nuevaVersion} onChange={(e) => setNuevaVersion(e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} required />
          </label>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
            Notas
            <input value={notas} onChange={(e) => setNotas(e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          </label>
        </div>

        <button
          type="submit"
          disabled={desplegando || !archivoZip}
          style={{ width: '100%', padding: '12px 14px', backgroundColor: desplegando ? '#4f46e5' : '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: desplegando || !archivoZip ? 'not-allowed' : 'pointer', opacity: desplegando || !archivoZip ? 0.6 : 1 }}
        >
          {desplegando ? 'Subiendo y aplicando actualización...' : '🚀 Desplegar en la caja local'}
        </button>

        {logResultado && (
          <div style={{ backgroundColor: '#020817', border: '1px solid #1e293b', color: '#d4d4d8', borderRadius: '10px', padding: '10px 12px', fontSize: '0.72rem', lineHeight: 1.5 }}>
            {logResultado}
          </div>
        )}
      </form>
    </div>
  )
}

interface CursoParapente {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  instructor: string
  cupo_total: number
  cupo_disponible: number
  precio_total: number
  precio_anticipo: number
  link_cobro_anticipo: string
  link_cobro_total: string
}

interface OperadorDirectorio {
  id: number
  nombre: string
  empresa: string
  tipo: string
  telefono: string
  licencia_certificacion: string
  prioridad: number
  estado: 'DISPONIBLE' | 'LLENO' | 'INACTIVO'
  tarifa_pago_base: number
  notas: string
}

function DirectorioOperadoresAdmin() {
  const [operadores, setOperadores] = useState<OperadorDirectorio[]>([])
  const [nuevo, setNuevo] = useState({
    nombre: '',
    empresa: '',
    tipo: 'PILOTO_TANDEM',
    telefono: '',
    licencia_certificacion: '',
    prioridad: 2,
    tarifa_pago_base: '600',
    notas: '',
  })

  const cargarOperadores = async () => {
    try {
      const res = await fetch(posApiUrl('/api/v1/directorio/operadores'))
      if (!res.ok) throw new Error('offline')
      const data = await res.json()
      setOperadores(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error al cargar directorio:', error)
      setOperadores([])
    }
  }

  useEffect(() => {
    cargarOperadores()
  }, [])

  const cambiarEstado = async (id: number, nuevoEstado: 'DISPONIBLE' | 'LLENO' | 'INACTIVO') => {
    try {
      await fetch(`${posApiUrl(`/api/v1/directorio/admin/operadores/${id}/estado`)}?estado=${nuevoEstado}`, {
        method: 'PATCH',
      })
      await cargarOperadores()
    } catch (error) {
      console.error('Error al cambiar estado del operador:', error)
    }
  }

  const agregarOperador = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...nuevo,
        prioridad: Number(nuevo.prioridad),
        tarifa_pago_base: Number(nuevo.tarifa_pago_base || 0),
      }
      const res = await fetch(posApiUrl('/api/v1/directorio/admin/operadores'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('No se pudo guardar el operador.')
      setNuevo({
        nombre: '',
        empresa: '',
        tipo: 'PILOTO_TANDEM',
        telefono: '',
        licencia_certificacion: '',
        prioridad: 2,
        tarifa_pago_base: '600',
        notas: '',
      })
      await cargarOperadores()
    } catch (error) {
      console.error('Error al registrar operador:', error)
    }
  }

  return (
    <div style={{ maxWidth: '980px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#f4f4f5' }}>Directorio de Pilotos, Guías y Empresas Aliadas</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#a1a1aa' }}>
          Red de asignación y respaldo para vuelos y tours cuando Salvador Lara tenga cupos llenos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {operadores.map((op) => (
          <div
            key={op.id}
            style={{
              backgroundColor: op.prioridad === 1 ? '#1e1b4b' : '#020817',
              border: op.prioridad === 1 ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid #1e293b',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#f8fafc', fontSize: '0.82rem' }}>{op.nombre}</strong>
                  {op.prioridad === 1 && (
                    <span style={{ backgroundColor: '#6366f1', color: '#fff', borderRadius: '999px', padding: '3px 7px', fontSize: '0.62rem', fontWeight: 700 }}>
                      Titular #1
                    </span>
                  )}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.68rem', marginTop: '4px' }}>{op.empresa} · {op.tipo}</div>
              </div>
              <span
                style={{
                  borderRadius: '999px',
                  padding: '4px 8px',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  backgroundColor: op.estado === 'DISPONIBLE' ? '#052e16' : op.estado === 'LLENO' ? '#451a03' : '#111827',
                  color: op.estado === 'DISPONIBLE' ? '#86efac' : op.estado === 'LLENO' ? '#fbbf24' : '#a1a1aa',
                }}
              >
                {op.estado}
              </span>
            </div>

            <div style={{ color: '#d4d4d8', fontSize: '0.68rem', lineHeight: 1.6 }}>
              <div><strong>Licencia:</strong> {op.licencia_certificacion || 'En validación'}</div>
              <div><strong>Tel / WhatsApp:</strong> {op.telefono}</div>
              {op.notas && <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>{op.notas}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
              <a
                href={`https://wa.me/52${String(op.telefono).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${op.nombre}, te contacto desde Basecamp 420 para coordinar una salida de vuelo o tour.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
              >
                📲 WhatsApp
              </a>

              <div style={{ display: 'flex', gap: '6px' }}>
                {op.estado === 'DISPONIBLE' ? (
                  <button
                    onClick={() => cambiarEstado(op.id, 'LLENO')}
                    style={{ backgroundColor: '#f59e0b33', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '8px', padding: '7px 8px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}
                  >
                    Marcar Lleno
                  </button>
                ) : (
                  <button
                    onClick={() => cambiarEstado(op.id, 'DISPONIBLE')}
                    style={{ backgroundColor: '#10b98122', color: '#86efac', border: '1px solid rgba(134, 239, 172, 0.3)', borderRadius: '8px', padding: '7px 8px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}
                  >
                    Marcar Disponible
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={agregarOperador} style={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'grid', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>Registrar nuevo piloto, guía o empresa aliada</h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            Nombre completo
            <input value={nuevo.nombre} onChange={(e) => setNuevo((prev) => ({ ...prev, nombre: e.target.value }))} required style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          </label>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            Empresa / colectivo
            <input value={nuevo.empresa} onChange={(e) => setNuevo((prev) => ({ ...prev, empresa: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          </label>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            Tipo
            <select value={nuevo.tipo} onChange={(e) => setNuevo((prev) => ({ ...prev, tipo: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }}>
              <option value="PILOTO_TANDEM">PILOTO_TANDEM</option>
              <option value="INSTRUCTOR_APPI">INSTRUCTOR_APPI</option>
              <option value="GUIA_TOUR">GUIA_TOUR</option>
              <option value="EMPRESA_ALIADA">EMPRESA_ALIADA</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            WhatsApp / teléfono
            <input value={nuevo.telefono} onChange={(e) => setNuevo((prev) => ({ ...prev, telefono: e.target.value }))} required style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          </label>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            Licencia / certificación
            <input value={nuevo.licencia_certificacion} onChange={(e) => setNuevo((prev) => ({ ...prev, licencia_certificacion: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          </label>
          <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
            Prioridad
            <select value={nuevo.prioridad} onChange={(e) => setNuevo((prev) => ({ ...prev, prioridad: Number(e.target.value) }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }}>
              <option value={2}>Prioridad 2</option>
              <option value={3}>Prioridad 3</option>
              <option value={4}>Prioridad 4</option>
            </select>
          </label>
        </div>

        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.72rem' }}>
          Notas
          <input value={nuevo.notas} onChange={(e) => setNuevo((prev) => ({ ...prev, notas: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>

        <button type="submit" style={{ width: '100%', padding: '11px 14px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          Guardar en directorio de respaldos
        </button>
      </form>
    </div>
  )
}

function CursosParapenteAdmin() {
  const [cursos, setCursos] = useState<CursoParapente[]>([])
  const [form, setForm] = useState({
    titulo: 'Curso de Piloto APPI 1 & 2',
    fecha_inicio: '2026-11-10',
    fecha_fin: '2026-11-12',
    instructor: 'Salvador Lara (Parapentitis)',
    cupo_total: '6',
    precio_total: '18000',
    precio_anticipo: '3800',
    link_cobro_anticipo: 'https://mpago.la/anticipo-prueba',
    link_cobro_total: 'https://mpago.la/total-prueba',
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const cargarCursos = async () => {
    try {
      const res = await fetch(posApiUrl('/api/v1/cursos/proximos'))
      if (!res.ok) throw new Error('offline')
      const data = await res.json()
      setCursos(Array.isArray(data) ? data : [])
    } catch {
      setCursos([])
    }
  }

  useEffect(() => {
    cargarCursos()
  }, [])

  const guardarCurso = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const body = {
        ...form,
        cupo_total: Number(form.cupo_total || 0),
        precio_total: Number(form.precio_total || 0),
        precio_anticipo: Number(form.precio_anticipo || 0),
      }
      const res = await fetch(posApiUrl('/api/v1/cursos/admin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'No se pudo guardar el curso.')
      setMensaje('Curso registrado correctamente.')
      setForm({
        titulo: '',
        fecha_inicio: '',
        fecha_fin: '',
        instructor: '',
        cupo_total: '6',
        precio_total: '0',
        precio_anticipo: '0',
        link_cobro_anticipo: '',
        link_cobro_total: '',
      })
      await cargarCursos()
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'Error al guardar el curso.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCurso = async (id: number) => {
    try {
      const res = await fetch(posApiUrl(`/api/v1/cursos/admin/${id}`), { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar.')
      await cargarCursos()
    } catch {
      setMensaje('No se pudo eliminar el curso seleccionado.')
    }
  }

  return (
    <div style={{ maxWidth: '820px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#f4f4f5' }}>Cursos de parapente próximos</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Título
          <input value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Instructor
          <input value={form.instructor} onChange={(e) => setForm((prev) => ({ ...prev, instructor: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Fecha inicio
          <input type="date" value={form.fecha_inicio} onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Fecha fin
          <input type="date" value={form.fecha_fin} onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Cupo total
          <input type="number" min={0} value={form.cupo_total} onChange={(e) => setForm((prev) => ({ ...prev, cupo_total: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Precio total
          <input type="number" min={0} value={form.precio_total} onChange={(e) => setForm((prev) => ({ ...prev, precio_total: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Precio anticipo
          <input type="number" min={0} value={form.precio_anticipo} onChange={(e) => setForm((prev) => ({ ...prev, precio_anticipo: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem', gridColumn: '1 / -1' }}>
          Link cobro anticipo
          <input value={form.link_cobro_anticipo} onChange={(e) => setForm((prev) => ({ ...prev, link_cobro_anticipo: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem', gridColumn: '1 / -1' }}>
          Link cobro total
          <input value={form.link_cobro_total} onChange={(e) => setForm((prev) => ({ ...prev, link_cobro_total: e.target.value }))} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
      </div>

      <button onClick={guardarCurso} disabled={guardando} style={{ width: '100%', padding: '12px 14px', backgroundColor: guardando ? '#059669' : '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: guardando ? 'default' : 'pointer' }}>
        {guardando ? 'Guardando...' : 'Guardar curso'}
      </button>

      {mensaje && (
        <p style={{ marginTop: '12px', color: '#d4d4d8', backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px', fontSize: '0.72rem', lineHeight: 1.5 }}>
          {mensaje}
        </p>
      )}

      <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
        {cursos.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin cursos activos por el momento.</div>
        ) : (
          cursos.map((curso) => (
            <div key={curso.id} style={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ color: '#f8fafc' }}>{curso.titulo}</strong>
                  <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '4px' }}>
                    {curso.fecha_inicio} · {curso.fecha_fin} · {curso.instructor}
                  </div>
                </div>
                <button onClick={() => eliminarCurso(curso.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontWeight: 700 }}>Eliminar</button>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '8px' }}>
                {curso.cupo_disponible}/{curso.cupo_total} plazas · Total: ${Number(curso.precio_total).toLocaleString('es-MX')} MXN · Anticipo: ${Number(curso.precio_anticipo).toLocaleString('es-MX')} MXN
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function GestorBranding() {
  const [form, setForm] = useState<EmpresaConfig>({
    nombre: 'Basecamp 420',
    nombre_comercial: 'Basecamp 420',
    slogan: 'Micro-POS Omnicanal',
    telefono: '',
    direccion: '',
    rfc: '',
    color_primario: '#10b981',
    titulo_documento: 'Basecamp 420 | Mostrador POS',
    ofrece_tours: true,
    ofrece_vuelos: true,
    ofrece_renta_equipo: true,
    logo_url: '',
    favicon_url: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(posApiUrl('/api/v1/config/empresa'))
        if (!res.ok) return
        const data = await res.json()
        const nombreComercial = data.nombre_comercial || data.nombre || 'Basecamp 420'
        setForm({
          nombre: nombreComercial,
          nombre_comercial: nombreComercial,
          slogan: data.slogan || 'Micro-POS Omnicanal',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          rfc: data.rfc || '',
          color_primario: data.color_primario || '#10b981',
          titulo_documento: data.titulo_documento || 'Basecamp 420 | Mostrador POS',
          ofrece_tours: data.ofrece_tours !== undefined ? Boolean(data.ofrece_tours) : true,
          ofrece_vuelos: data.ofrece_vuelos !== undefined ? Boolean(data.ofrece_vuelos) : true,
          ofrece_renta_equipo: data.ofrece_renta_equipo !== undefined ? Boolean(data.ofrece_renta_equipo) : true,
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
        })
      } catch (error) {
        console.error('No fue posible cargar branding:', error)
      }
    }
    cargar()
  }, [])

  const cambiarCampo = (campo: keyof EmpresaConfig, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor as never }))
  }

  const cambiarServicio = (campo: 'ofrece_tours' | 'ofrece_vuelos' | 'ofrece_renta_equipo', valor: boolean) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const guardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const payload = {
        ...form,
        nombre: form.nombre_comercial || form.nombre,
        nombre_comercial: form.nombre_comercial || form.nombre,
      }
      const res = await fetch(posApiUrl('/api/v1/config/admin/empresa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'No se pudo guardar la configuración.')
      setMensaje('Configuración de marca aplicada correctamente.')
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'Error al guardar la marca.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ maxWidth: '620px', backgroundColor: '#111827', border: '1px solid #27272a', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#f4f4f5' }}>Datos de la marca y empresa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Nombre comercial
          <input value={form.nombre_comercial} onChange={(e) => {
            const nombre = e.target.value
            setForm((prev) => ({ ...prev, nombre_comercial: nombre, nombre }))
          }} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Slogan
          <input value={form.slogan} onChange={(e) => cambiarCampo('slogan', e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Teléfono
          <input value={form.telefono} onChange={(e) => cambiarCampo('telefono', e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          RFC
          <input value={form.rfc} onChange={(e) => cambiarCampo('rfc', e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem', gridColumn: '1 / -1' }}>
          Dirección
          <input value={form.direccion} onChange={(e) => cambiarCampo('direccion', e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Color primario
          <input type="color" value={form.color_primario} onChange={(e) => cambiarCampo('color_primario', e.target.value)} style={{ background: '#09090b', height: '42px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
        <label style={{ display: 'grid', gap: '6px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          Título del documento
          <input value={form.titulo_documento} onChange={(e) => cambiarCampo('titulo_documento', e.target.value)} style={{ background: '#09090b', color: '#fff', padding: '10px 12px', border: '1px solid #3f3f46', borderRadius: '8px' }} />
        </label>
      </div>

      <div style={{ marginTop: '16px', display: 'grid', gap: '10px', padding: '12px 14px', backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px' }}>
        <div style={{ color: '#f4f4f5', fontSize: '0.8rem', fontWeight: 700 }}>Disponibilidad de servicios</div>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          <span>Ofrece tours / actividades</span>
          <input type="checkbox" checked={form.ofrece_tours} onChange={(e) => cambiarServicio('ofrece_tours', e.target.checked)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          <span>Ofrece vuelos / parapente</span>
          <input type="checkbox" checked={form.ofrece_vuelos} onChange={(e) => cambiarServicio('ofrece_vuelos', e.target.checked)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', color: '#d4d4d8', fontSize: '0.75rem' }}>
          <span>Se renta equipo de alta montaña y camping</span>
          <input type="checkbox" checked={form.ofrece_renta_equipo} onChange={(e) => cambiarServicio('ofrece_renta_equipo', e.target.checked)} />
        </label>
      </div>

      <button onClick={guardar} disabled={guardando} style={{ marginTop: '16px', width: '100%', padding: '10px 12px', backgroundColor: guardando ? '#059669' : '#10b981', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: guardando ? 'default' : 'pointer' }}>
        {guardando ? 'Guardando...' : 'Guardar configuración de marca'}
      </button>

      {mensaje && (
        <p style={{ marginTop: '12px', color: '#d4d4d8', backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 12px', fontSize: '0.72rem', lineHeight: 1.5 }}>
          {mensaje}
        </p>
      )}
    </div>
  )
}

type FilaSicar = {
  art_id: string
  descripcion: string
  depto: string
  existencia: number
  tipo: string
}

type PanelSicar = {
  conectado: boolean
  error?: string
  fuente?: string
  total_articulos: number | null
  en_venta: number | null
  en_renta: number | null
  piezas: number | null
  activos: number | null
  valor_inventario: number | null
  productos: FilaSicar[]
  hostinger?: { conectado: boolean; motivo: string; sitio_configurado: string; lectura_ia: string | null }
}

function dinero(valor: number | null) {
  if (valor === null || Number.isNaN(valor)) return "—"
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" })
}

export default function AdminDashboardPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([])
  const [filtro, setFiltro] = useState<'PENDIENTE' | 'APROBADA' | 'DESCARTADA'>('PENDIENTE')
  const [sicar, setSicar] = useState<PanelSicar | null>(null)
  const [sicarError, setSicarError] = useState("")

  useEffect(() => {
    let vivo = true
    fetch("/api/sicar/panel", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json()
        if (!vivo) return
        if (!res.ok || !data.conectado) {
          setSicarError(data.error || "SICAR no respondió.")
          setSicar(data)
          return
        }
        setSicar(data)
        setSicarError("")
      })
      .catch(() => {
        if (vivo) setSicarError("No se pudo consultar SICAR.")
      })
    return () => {
      vivo = false
    }
  }, [])

  const cargarPropuestas = React.useCallback(async () => {
    try {
      const res = await fetch(`${posApiUrl('/api/v1/operations/audio/admin/proposals')}?estado=${filtro}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setPropuestas(data)
    } catch (error) {
      console.error('Error al cargar propuestas:', error)
      setPropuestas([])
    }
  }, [filtro])

  useEffect(() => {
    cargarPropuestas()
  }, [cargarPropuestas])

  const resolverPropuesta = async (id: number, nuevoEstado: 'APROBADA' | 'DESCARTADA') => {
    await fetch(`${posApiUrl(`/api/v1/operations/audio/admin/proposals/${id}`)}?estado=${nuevoEstado}`, {
      method: 'PATCH',
    })
    cargarPropuestas()
  }

  return (
    <div style={{ color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>Panel de Control Central</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '6px 0 0' }}>
            {sicar?.conectado ? sicar.fuente : 'Esperando SICAR. Las cifras anteriores de Tulio y ventas ya no se muestran.'}
          </p>
        </div>

        <main>
          {sicarError && (
            <p style={{ color: '#fecaca', background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
              SICAR no está disponible: {sicarError}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Artículos en SICAR</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#38bdf8' }}>{sicar?.conectado ? sicar.total_articulos?.toLocaleString('es-MX') : '—'}</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>En venta</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#22c55e' }}>{sicar?.conectado ? sicar.en_venta?.toLocaleString('es-MX') : '—'}</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>En renta</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#f59e0b' }}>{sicar?.conectado ? sicar.en_renta?.toLocaleString('es-MX') : '—'}</h3>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Valor de existencia a precio SICAR</span>
              <h3 style={{ fontSize: '1.8rem', margin: '8px 0 0', color: '#e2e8f0' }}>{sicar?.conectado ? dinero(sicar.valor_inventario) : '—'}</h3>
            </div>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Hostinger</h3>
            <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {sicar?.hostinger?.motivo || 'Hostinger no está conectado. Falta el token de API.'}
            </p>
            <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Dominio configurado en la app: {sicar?.hostinger?.sitio_configurado || 'basecamp420.com'}. No hay visitas ni ventas medidas.
            </p>
            <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
              Lectura de inteligencia artificial: {sicar?.hostinger?.lectura_ia || 'en espera del token. No se inventan métricas.'}
            </p>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Auditoría &amp; Radar Estratégico IA</h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Propuestas generadas a partir de conversaciones en tienda y mostrador</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['PENDIENTE', 'APROBADA', 'DESCARTADA'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFiltro(tab)}
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: filtro === tab ? '#fff' : '#cbd5e1',
                      backgroundColor: filtro === tab ? '#4f46e5' : '#1e293b',
                    }}
                  >
                    {tab}s
                  </button>
                ))}
              </div>
            </div>

            {propuestas.length === 0 ? (
              <p style={{ margin: 0, color: '#94a3b8', textAlign: 'center', padding: '18px 0' }}>
                No hay propuestas en estado {filtro}.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {propuestas.map((p) => (
                  <div key={p.id} style={{ backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 700 }}>
                        {p.tipo} · {p.fecha} {p.hora} hrs
                      </span>
                      <span
                        style={{
                          borderRadius: '999px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: p.prioridad === 'ALTA' ? '#ef444433' : '#3b82f633',
                          color: p.prioridad === 'ALTA' ? '#fca5a5' : '#93c5fd',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                        }}
                      >
                        Prioridad {p.prioridad}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '0.83rem' }}>
                      <strong style={{ color: '#fff' }}>Detección:</strong> {p.hallazgo}
                    </p>
                    <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #1e293b', padding: '12px', color: '#34d399', fontSize: '0.83rem' }}>
                      <strong>👉 Acción Sugerida:</strong> {p.propuesta}
                    </div>

                    {p.estado === 'PENDIENTE' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => resolverPropuesta(p.id, 'DESCARTADA')}
                          style={{
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Descartar
                        </button>
                        <button
                          onClick={() => resolverPropuesta(p.id, 'APROBADA')}
                          style={{
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#16a34a',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Aprobar / Ejecutar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', marginBottom: '20px' }}>Configuración de Branding</h3>
            <div style={{ display: 'grid', gap: '18px' }}>
              <CursosParapenteAdmin />
              <DirectorioOperadoresAdmin />
              <GestorBranding />
              <GestorFavicon />
              <GestorActualizacionesRemotas />
              <MandoControlRemoto />
              <ControlAccesoMultimedia />
              <VistaCamarasNVR />
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', marginBottom: '8px' }}>Existencias leídas de SICAR</h3>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
              {sicar?.conectado ? `${sicar.piezas?.toLocaleString('es-MX')} piezas en existencia. Artículos con status activo o sin status: ${sicar.activos?.toLocaleString('es-MX')}.` : 'Sin lectura.'}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px' }}>Departamento</th>
                  <th style={{ padding: '12px' }}>Tipo</th>
                  <th style={{ padding: '12px' }}>Existencia</th>
                </tr>
              </thead>
              <tbody>
                {(sicar?.productos || []).slice(0, 8).map((fila) => (
                  <tr key={fila.art_id}>
                    <td style={{ padding: '12px', color: '#fff' }}>{fila.descripcion}</td>
                    <td style={{ padding: '12px' }}>{fila.depto}</td>
                    <td style={{ padding: '12px' }}>{fila.tipo}</td>
                    <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>{fila.existencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
    </div>
  )
}
