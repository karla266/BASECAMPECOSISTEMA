'use client'

import { useEffect, useRef, useState } from 'react'

interface WebcamImage {
  name: string
  url: string
  size: number
  updated: string
}

export default function CamaraWebPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [images, setImages] = useState<WebcamImage[]>([])
  const [live, setLive] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const cargar = async () => {
    try {
      const res = await fetch('/api/webcam')
      const data = await res.json()
      setImages(Array.isArray(data.images) ? data.images : [])
    } catch {
      setImages([])
    }
  }

  useEffect(() => {
    cargar()
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const abrirCamara = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Este navegador no puede abrir la cámara.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setLive(true)
      setMessage(null)
    } catch {
      setMessage('No se concedió permiso para usar la cámara de esta computadora.')
    }
  }

  const cerrarCamara = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setLive(false)
  }

  const guardarFoto = async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      setMessage('Primero abre la cámara y espera a ver la imagen.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image_data_url = canvas.toDataURL('image/jpeg', 0.85)

    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/webcam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data_url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la foto.')
      setMessage('Foto guardada.')
      await cargar()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la foto.')
    } finally {
      setSaving(false)
    }
  }

  const borrarFoto = async (name: string) => {
    if (!window.confirm(`¿Borrar la foto ${name}?`)) return
    setBorrando(name)
    setMessage(null)
    try {
      const res = await fetch(`/api/webcam/${encodeURIComponent(name)}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'No se pudo borrar la foto.')
      if (selected?.endsWith(`/${encodeURIComponent(name)}`)) setSelected(null)
      setMessage('Foto borrada.')
      await cargar()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo borrar la foto.')
    } finally {
      setBorrando(null)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Cámara web</h1>
        <p className="text-sm text-slate-400 mt-1">
          Fotos ya guardadas en el mostrador y vista de la cámara de esta computadora.
        </p>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-white">Vista en vivo</h2>
          <div className="flex gap-2">
            {live ? (
              <button onClick={cerrarCamara} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm font-semibold">
                Cerrar cámara
              </button>
            ) : (
              <button onClick={abrirCamara} className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold">
                Abrir cámara
              </button>
            )}
            <button
              onClick={guardarFoto}
              disabled={!live || saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Guardar foto'}
            </button>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[240px] flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className={live ? 'w-full max-h-[420px] object-contain' : 'hidden'} />
          {!live && <p className="text-slate-500 text-sm p-8">La cámara está apagada. Pulsa Abrir cámara para ver la imagen.</p>}
        </div>
        {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Imágenes guardadas</h2>
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay fotos de la cámara web.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.name} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelected(image.url)}
                  className="block w-full text-left"
                >
                  <img src={image.url} alt={image.name} className="w-full h-36 object-cover" />
                  <span className="block px-2 py-2 text-[11px] text-slate-400 truncate">{image.name}</span>
                </button>
                <div className="px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => borrarFoto(image.name)}
                    disabled={borrando === image.name}
                    className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {borrando === image.name ? 'Borrando...' : 'Borrar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <button
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
        >
          <img src={selected} alt="Foto ampliada" className="max-h-[85vh] max-w-full rounded-xl" />
        </button>
      )}
    </div>
  )
}
