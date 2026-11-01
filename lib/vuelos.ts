import { promises as fs } from "fs";
import path from "path";

export const SLOTS_VUELO = ["10:00", "12:00", "14:00", "16:00"] as const;
export type SlotVuelo = (typeof SLOTS_VUELO)[number];

export const WHATSAPP_VUELO =
  "https://wa.me/522727258748?text=Hola%20Basecamp%20420,%20deseo%20validar%20disponibilidad%20para%20vuelo%20en%20parapente.";

const ARCHIVO_PILOTOS = path.join(process.cwd(), "data", "directorio_pilotos.json");
const ARCHIVO_RESERVAS = path.join(process.cwd(), "data", "reservas_vuelo.json");

export type PilotoVuelo = {
  id: string;
  nombre: string;
  telefono: string;
  prioridad: number;
  capacidad_por_slot: number;
  certificacion_tandem: boolean;
  estado: "activo" | "demo_presentacion" | "inactivo";
};

export type ChecklistRuta = {
  arnes: boolean;
  casco: boolean;
  radio: boolean;
  paracaidas: boolean;
};

export type ReservaVuelo = {
  id: string;
  fecha: string;
  horario: SlotVuelo;
  pasajero: string;
  telefono: string;
  pesoKg: number;
  anticipo: "Pagado" | "Pendiente";
  pilotoId: string;
  piloto: string;
  pilotoDemo?: boolean;
  fotoInspeccion?: string;
  checklist: ChecklistRuta;
  creadaEn: string;
};

export function esSlotVuelo(valor: string): valor is SlotVuelo {
  return SLOTS_VUELO.includes(valor as SlotVuelo);
}

async function leerJson<T>(archivo: string, vacio: T): Promise<T> {
  try {
    const texto = await fs.readFile(archivo, "utf8");
    return JSON.parse(texto) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return vacio;
    throw error;
  }
}

async function guardarJson(archivo: string, datos: unknown) {
  await fs.mkdir(path.dirname(archivo), { recursive: true });
  const temporal = `${archivo}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(datos, null, 2), "utf8");
  await fs.rename(temporal, archivo);
}

export function pilotoEnDemo(piloto: Pick<PilotoVuelo, "certificacion_tandem" | "estado">) {
  return piloto.certificacion_tandem === false || piloto.estado === "demo_presentacion";
}

function pilotoOperable(piloto: PilotoVuelo) {
  return piloto.estado === "activo" || piloto.estado === "demo_presentacion";
}

function cupoDelPiloto(piloto: PilotoVuelo) {
  return Math.max(1, Number(piloto.capacidad_por_slot) || 1);
}

export function siguientePiloto(pilotos: PilotoVuelo[], reservas: ReservaVuelo[], fecha: string, horario: string) {
  return [...pilotos]
    .filter(pilotoOperable)
    .sort((a, b) => a.prioridad - b.prioridad || a.nombre.localeCompare(b.nombre))
    .find((piloto) => ocupacion(reservas, fecha, horario, piloto.id) < cupoDelPiloto(piloto)) ?? null;
}

export async function leerPilotos() {
  const lista = await leerJson<PilotoVuelo[]>(ARCHIVO_PILOTOS, []);
  return Array.isArray(lista) ? lista : [];
}

export async function registrarPiloto(entrada: {
  nombre: string;
  telefono: string;
  certificacion: "tandem_appi" | "en_formacion";
}) {
  const nombre = entrada.nombre.trim().replace(/\s+/g, " ");
  const telefono = entrada.telefono.trim();
  if (nombre.length < 3 || nombre.length > 80) return { error: "Escribe el nombre completo." as const };
  if (!/^\d{10}$/.test(telefono)) return { error: "El WhatsApp debe tener 10 dígitos." as const };
  const pilotos = await leerPilotos();
  const existente = pilotos.find((piloto) => piloto.telefono.endsWith(telefono));
  if (existente) return { piloto: existente, yaExistia: true as const };
  const prioridad = pilotos.reduce((maximo, piloto) => Math.max(maximo, Number(piloto.prioridad) || 0), 0) + 1;
  const consecutivo = pilotos.reduce((maximo, piloto) => {
    const numero = Number(String(piloto.id).replace(/\D/g, ""));
    return Number.isFinite(numero) ? Math.max(maximo, numero) : maximo;
  }, 0) + 1;
  const tandem = entrada.certificacion === "tandem_appi";
  const piloto: PilotoVuelo = {
    id: `piloto_${String(consecutivo).padStart(3, "0")}`,
    nombre,
    telefono: `52${telefono}`,
    prioridad,
    capacidad_por_slot: 1,
    certificacion_tandem: tandem,
    estado: tandem ? "activo" : "demo_presentacion",
  };
  await guardarJson(ARCHIVO_PILOTOS, [...pilotos, piloto]);
  return { piloto, yaExistia: false as const };
}

export async function leerReservas() {
  const lista = await leerJson<ReservaVuelo[]>(ARCHIVO_RESERVAS, []);
  return Array.isArray(lista) ? lista : [];
}

export async function guardarReservas(reservas: ReservaVuelo[]) {
  await guardarJson(ARCHIVO_RESERVAS, reservas);
}

export async function vaciarReservas() {
  await guardarReservas([]);
}

export function ocupacion(reservas: ReservaVuelo[], fecha: string, horario: string, pilotoId: string) {
  return reservas.filter(
    (reserva) => reserva.fecha === fecha && reserva.horario === horario && reserva.pilotoId === pilotoId
  ).length;
}

export async function asignarPiloto(fecha: string, horario: SlotVuelo) {
  const [pilotos, reservas] = await Promise.all([leerPilotos(), leerReservas()]);
  return { elegido: siguientePiloto(pilotos, reservas, fecha, horario), pilotos, reservas };
}

export async function crearReserva(entrada: {
  fecha: string;
  horario: SlotVuelo;
  pasajero: string;
  telefono: string;
  pesoKg: number;
}) {
  const { elegido, reservas } = await asignarPiloto(entrada.fecha, entrada.horario);
  if (!elegido) return { error: "Ese horario ya está saturado para todos los pilotos del directorio." as const };
  const reserva: ReservaVuelo = {
    id: `rv-${Date.now()}`,
    fecha: entrada.fecha,
    horario: entrada.horario,
    pasajero: entrada.pasajero,
    telefono: entrada.telefono,
    pesoKg: entrada.pesoKg,
    anticipo: "Pendiente",
    pilotoId: elegido.id,
    piloto: elegido.nombre,
    pilotoDemo: pilotoEnDemo(elegido),
    checklist: { arnes: false, casco: false, radio: false, paracaidas: false },
    creadaEn: new Date().toISOString(),
  };
  reservas.unshift(reserva);
  await guardarReservas(reservas);
  return { reserva };
}

export async function quitarReserva(id: string) {
  const reservas = await leerReservas();
  await guardarReservas(reservas.filter((reserva) => reserva.id !== id));
}

export async function actualizarReserva(
  id: string,
  cambios: Partial<Pick<ReservaVuelo, "anticipo" | "checklist" | "fotoInspeccion">>
) {
  const reservas = await leerReservas();
  const indice = reservas.findIndex((reserva) => reserva.id === id);
  if (indice < 0) return null;
  reservas[indice] = {
    ...reservas[indice],
    ...cambios,
    checklist: { ...reservas[indice].checklist, ...(cambios.checklist || {}) },
  };
  await guardarReservas(reservas);
  return reservas[indice];
}

export async function disponibilidad(fecha: string) {
  const [pilotos, reservas] = await Promise.all([leerPilotos(), leerReservas()]);
  return SLOTS_VUELO.map((horario) => {
    const libre = siguientePiloto(pilotos, reservas, fecha, horario);
    return {
      horario,
      disponible: Boolean(libre),
      piloto: libre?.nombre || "",
      titular: libre?.prioridad === 1,
      pilotoDemo: libre ? pilotoEnDemo(libre) : false,
    };
  });
}
