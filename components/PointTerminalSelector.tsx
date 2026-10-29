"use client";

import { useEffect, useMemo, useState } from "react";

type PointDevice = {
  device_id: string;
  name: string;
  source: "local" | "remote";
};

type PointResponse = {
  ok: boolean;
  devices: PointDevice[];
  activeDeviceId: string;
  error?: string;
};

const STORAGE_KEY = "bc420.point.active.device";

export default function PointTerminalSelector() {
  const [devices, setDevices] = useState<PointDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [manualDeviceId, setManualDeviceId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDevices() {
    setLoading(true);
    try {
      const response = await fetch("/api/point/devices", { cache: "no-store" });
      const data = (await response.json()) as PointResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudieron leer terminales.");
      setDevices(Array.isArray(data.devices) ? data.devices : []);

      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) || "" : "";
      const fallback = data.activeDeviceId || "";
      const candidate =
        stored && data.devices.some((device) => device.device_id === stored) ? stored : fallback;
      setActiveDeviceId(candidate);
      if (candidate) {
        localStorage.setItem(STORAGE_KEY, candidate);
      }
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "No se pudieron leer terminales Point.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDevices();
  }, []);

  const activeLabel = useMemo(() => {
    if (!activeDeviceId) return "Sin terminal activa";
    const found = devices.find((device) => device.device_id === activeDeviceId);
    return found ? `${found.name} (${found.device_id})` : activeDeviceId;
  }, [devices, activeDeviceId]);

  async function saveActive(deviceId: string) {
    setActiveDeviceId(deviceId);
    setStatus("Guardando terminal activa...");
    try {
      const response = await fetch("/api/point/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-active", device_id: deviceId }),
      });
      const data = (await response.json()) as PointResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo guardar.");
      setDevices(Array.isArray(data.devices) ? data.devices : []);
      setActiveDeviceId(data.activeDeviceId || deviceId);
      localStorage.setItem(STORAGE_KEY, data.activeDeviceId || deviceId);
      setStatus("Terminal activa guardada.");
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la terminal activa.");
    }
  }

  async function addManual() {
    const id = manualDeviceId.trim();
    if (!id) {
      setStatus("Escribe un número de serie de terminal.");
      return;
    }
    setStatus("Registrando terminal manual...");
    try {
      const response = await fetch("/api/point/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-manual", device_id: id, name: `Point ${id}` }),
      });
      const data = (await response.json()) as PointResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo registrar terminal.");
      setDevices(Array.isArray(data.devices) ? data.devices : []);
      setManualDeviceId("");
      setStatus("Terminal manual registrada. Selecciónala para cobro.");
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "No se pudo registrar terminal.");
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Terminal Point activa</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <select
          value={activeDeviceId}
          onChange={(event) => void saveActive(event.target.value)}
          disabled={loading || devices.length === 0}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
        >
          <option value="">{loading ? "Cargando..." : "Seleccionar terminal"}</option>
          {devices.map((device) => (
            <option key={device.device_id} value={device.device_id}>
              {device.name} ({device.device_id})
            </option>
          ))}
        </select>
        <input
          value={manualDeviceId}
          onChange={(event) => setManualDeviceId(event.target.value)}
          placeholder="device_id manual"
          className="w-32 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
        />
        <button
          type="button"
          onClick={() => void addManual()}
          className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"
        >
          Guardar
        </button>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">{activeLabel}</p>
      {status ? <p className="mt-1 text-[10px] text-cyan-300">{status}</p> : null}
    </div>
  );
}
