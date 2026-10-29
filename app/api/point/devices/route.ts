import { NextResponse } from "next/server";
import {
  mergePointDevices,
  readPointDevicesState,
  setActivePointDevice,
  type PointDevice,
} from "@/lib/point-devices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASES = ["http://127.0.0.1:8110", "http://127.0.0.1:8000"];

async function fetchRemoteDevices(): Promise<PointDevice[]> {
  for (const base of BASES) {
    try {
      const response = await fetch(`${base}/api/v1/point/devices`, { cache: "no-store" });
      if (!response.ok) continue;
      const data = (await response.json()) as { devices?: unknown };
      const devices: PointDevice[] = [];
      if (Array.isArray(data.devices)) {
        for (const rawItem of data.devices) {
          if (!rawItem || typeof rawItem !== "object") continue;
          const row = rawItem as { device_id?: unknown; name?: unknown };
          const device_id = typeof row.device_id === "string" ? row.device_id.trim() : "";
          if (!device_id) continue;
          devices.push({
            device_id,
            name: typeof row.name === "string" && row.name.trim() ? row.name.trim() : `Point ${device_id}`,
            source: "remote",
          });
        }
      }
      if (devices.length) return devices;
    } catch {
      continue;
    }
  }
  return [];
}

export async function GET() {
  try {
    const remote = await fetchRemoteDevices();
    const state = remote.length ? mergePointDevices(remote) : readPointDevicesState();
    return NextResponse.json({
      ok: true,
      devices: state.devices,
      activeDeviceId: state.activeDeviceId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible listar terminales Point.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      device_id?: string;
      action?: "set-active" | "add-manual";
      name?: string;
    };
    const action = body.action || "set-active";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
    if (!deviceId) {
      return NextResponse.json({ ok: false, error: "device_id es requerido." }, { status: 400 });
    }

    if (action === "add-manual") {
      const name =
        typeof body.name === "string" && body.name.trim()
          ? body.name.trim()
          : `Terminal ${deviceId}`;
      const state = mergePointDevices([{ device_id: deviceId, name, source: "local" }]);
      return NextResponse.json({ ok: true, devices: state.devices, activeDeviceId: state.activeDeviceId });
    }

    const state = setActivePointDevice(deviceId);
    return NextResponse.json({ ok: true, devices: state.devices, activeDeviceId: state.activeDeviceId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No fue posible guardar la terminal activa.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
