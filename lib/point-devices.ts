import fs from "fs";
import path from "path";

export interface PointDevice {
  device_id: string;
  name: string;
  source: "local" | "remote";
}

export interface PointDevicesState {
  activeDeviceId: string;
  devices: PointDevice[];
}

const CONFIG_PATH = path.resolve(process.cwd(), "..", "data", "point-devices.json");

let memoryState: PointDevicesState = {
  activeDeviceId: "",
  devices: [],
};

function normalizeDeviceId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function dedupe(devices: PointDevice[]): PointDevice[] {
  const map = new Map<string, PointDevice>();
  for (const device of devices) {
    const id = normalizeDeviceId(device.device_id);
    if (!id) continue;
    const current = map.get(id);
    if (!current || current.source === "remote") {
      map.set(id, { ...device, device_id: id });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function normalizeState(input: unknown): PointDevicesState {
  if (!input || typeof input !== "object") return { activeDeviceId: "", devices: [] };
  const record = input as { activeDeviceId?: unknown; devices?: unknown };
  const devices = Array.isArray(record.devices)
    ? record.devices
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const row = item as { device_id?: unknown; name?: unknown; source?: unknown };
          const device_id = normalizeDeviceId(row.device_id);
          if (!device_id) return null;
          const source = row.source === "remote" ? "remote" : "local";
          return {
            device_id,
            name: normalizeName(row.name, `Terminal ${device_id}`),
            source,
          } as PointDevice;
        })
        .filter((item): item is PointDevice => Boolean(item))
    : [];
  return {
    activeDeviceId: normalizeDeviceId(record.activeDeviceId),
    devices: dedupe(devices),
  };
}

function saveState(state: PointDevicesState): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const content = JSON.stringify(state, null, 2);
  fs.writeFileSync(CONFIG_PATH, content, "utf8");
}

export function readPointDevicesState(): PointDevicesState {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    memoryState = normalizeState(parsed);
  } catch {
    memoryState = normalizeState(memoryState);
  }
  return memoryState;
}

export function writePointDevicesState(state: PointDevicesState): PointDevicesState {
  const normalized = normalizeState(state);
  memoryState = normalized;
  saveState(normalized);
  return normalized;
}

export function mergePointDevices(devices: PointDevice[]): PointDevicesState {
  const state = readPointDevicesState();
  const merged = dedupe([...devices, ...state.devices]);
  const activeExists = merged.some((device) => device.device_id === state.activeDeviceId);
  const activeDeviceId = activeExists ? state.activeDeviceId : merged[0]?.device_id || "";
  return writePointDevicesState({ activeDeviceId, devices: merged });
}

export function setActivePointDevice(deviceId: string): PointDevicesState {
  const normalizedId = normalizeDeviceId(deviceId);
  const state = readPointDevicesState();
  if (!normalizedId) {
    return writePointDevicesState({ ...state, activeDeviceId: "" });
  }
  const exists = state.devices.some((item) => item.device_id === normalizedId);
  const devices = exists
    ? state.devices
    : [
        ...state.devices,
        { device_id: normalizedId, name: `Terminal ${normalizedId}`, source: "local" as const },
      ];
  return writePointDevicesState({
    activeDeviceId: normalizedId,
    devices,
  });
}

export function getActivePointDeviceId(): string {
  return readPointDevicesState().activeDeviceId;
}

export async function getActivePointTerminal(): Promise<string> {
  return getActivePointDeviceId();
}
