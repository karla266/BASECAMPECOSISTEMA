'use client';

import { useState, useEffect } from 'react';

interface Camara {
  id: number;
  nombre_camara: string;
  tipo: string;
  rtsp_url: string;
  zona_vigilada: string;
  estado: string;
}

export default function GestionCamarasPage() {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre_camara: '',
    tipo: 'ip_directa',
    rtsp_url: '',
    zona_vigilada: 'Mostrador',
  });

  const cargarCamaras = async () => {
    try {
      const res = await fetch('/api/camaras');
      const data = await res.json();
      if (data.success) setCamaras(data.data);
    } catch (err) {
      console.error('Error cargando cámaras:', err);
    }
  };

  useEffect(() => {
    cargarCamaras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/camaras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id_cliente: 1 }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.mensaje);
        setForm({ nombre_camara: '', tipo: 'ip_directa', rtsp_url: '', zona_vigilada: 'Mostrador' });
        cargarCamaras();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al guardar cámara:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Configuración de Cámaras e IA</h1>
          <p className="text-slate-400 text-sm mt-1">
            Conecta tus cámaras IP directas o canales de tu DVR Dahua / Hikvision para monitoreo en vivo y análisis por IA.
          </p>
        </div>

        {/* Formulario de registro */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-sky-400">➕ Registrar Nueva Cámara</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre de la Cámara</label>
              <input
                type="text"
                required
                placeholder="Ej. Cámara Entrada / Mostrador"
                value={form.nombre_camara}
                onChange={(e) => setForm({ ...form, nombre_camara: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo de Dispositivo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ip_directa">Cámara IP Directa (ONVIF/RTSP)</option>
                <option value="dvr_dahua">DVR Dahua</option>
                <option value="dvr_hikvision">DVR Hikvision</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">URL RTSP de la Cámara</label>
              <input
                type="text"
                required
                placeholder="rtsp://admin:password@192.168.1.100:554/stream1"
                value={form.rtsp_url}
                onChange={(e) => setForm({ ...form, rtsp_url: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Zona Vigilada</label>
              <input
                type="text"
                placeholder="Ej. Caja, Pasillo Central, Almacén"
                value={form.zona_vigilada}
                onChange={(e) => setForm({ ...form, zona_vigilada: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cámara'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Cámaras Activas */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-white">📹 Cámaras Registradas</h2>
          
          {camaras.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay cámaras registradas todavía.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camaras.map((cam) => (
                <div key={cam.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-base text-sky-400">{cam.nombre_camara}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {cam.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400"><strong>Tipo:</strong> {cam.tipo}</p>
                    <p className="text-xs text-slate-400"><strong>Zona:</strong> {cam.zona_vigilada}</p>
                    <p className="text-xs text-slate-500 font-mono mt-2 truncate bg-slate-900 p-1.5 rounded">
                      {cam.rtsp_url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
