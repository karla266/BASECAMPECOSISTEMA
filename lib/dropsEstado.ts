export type Drop = {
  id: string;
  nombre: string;
  fecha_apertura: string;
  fecha_cierre_preventa: string;
  fecha_entrega_oficial: string;
  fecha_entrega_iso: string;
  categoria_hero: string;
  anticipo_minimo_porcentaje?: number;
  descuento_preventa_porcentaje?: number;
  mensaje_whatsapp_tag: string;
  activo: boolean;
};

export type MotorDrops = {
  zona: string;
  anticipo_minimo_porcentaje: number;
  descuento_preventa_porcentaje: number;
  drop_activo: Drop;
  calendario: Drop[];
};

export type EstadoDrop = {
  esPreVenta: boolean;
  diasRestantes: number;
  fechaEntrega: string;
  badgeTexto: string;
  id: string;
  nombre: string;
};

const DIA_MS = 86_400_000;

export function diaMexico(ahora = new Date(), zona = "America/Mexico_City"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

export function ymd(valor: string): string {
  const coincidencia = valor.match(/\d{4}-\d{2}-\d{2}/);
  if (!coincidencia) throw new Error(`Fecha inválida: ${valor}`);
  return coincidencia[0];
}

export function diasEntre(desde: string, hasta: string): number {
  const inicio = Date.parse(`${ymd(desde)}T00:00:00Z`);
  const fin = Date.parse(`${ymd(hasta)}T00:00:00Z`);
  return Math.round((fin - inicio) / DIA_MS);
}

export function ventanaAbierta(drop: Drop, hoy: string): boolean {
  if (!drop.activo) return false;
  return hoy >= ymd(drop.fecha_apertura) && hoy <= ymd(drop.fecha_cierre_preventa);
}

export function dropParaMostrar(motor: MotorDrops, hoy: string): Drop {
  if (ventanaAbierta(motor.drop_activo, hoy)) return motor.drop_activo;
  const enCurso = motor.calendario.find((drop) => ventanaAbierta(drop, hoy));
  return enCurso ?? motor.drop_activo;
}

export function estadoDrop(motor: MotorDrops, ahora = new Date()): EstadoDrop {
  const hoy = diaMexico(ahora, motor.zona || "America/Mexico_City");
  const drop = dropParaMostrar(motor, hoy);
  const fechaEntrega = drop.fecha_entrega_oficial;
  const apertura = ymd(drop.fecha_apertura);
  const base = { fechaEntrega, id: drop.id, nombre: drop.nombre };

  if (ventanaAbierta(drop, hoy)) {
    return {
      ...base,
      esPreVenta: true,
      diasRestantes: Math.max(0, diasEntre(hoy, ymd(drop.fecha_cierre_preventa))),
      badgeTexto: `🔥 Pre-Venta — Llega ${fechaEntrega}`,
    };
  }

  if (hoy < apertura) {
    return {
      ...base,
      esPreVenta: false,
      diasRestantes: Math.max(0, diasEntre(hoy, apertura)),
      badgeTexto: `Próximo drop — Llega ${fechaEntrega}`,
    };
  }

  return {
    ...base,
    esPreVenta: false,
    diasRestantes: 0,
    badgeTexto: `Entrega ${fechaEntrega}`,
  };
}

export function esMotorDrops(valor: unknown): valor is MotorDrops {
  if (!valor || typeof valor !== "object") return false;
  const motor = valor as Partial<MotorDrops>;
  return Boolean(motor.drop_activo && Array.isArray(motor.calendario));
}
