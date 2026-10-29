import { getTenantConfig } from "@/lib/tenant";

const BASE_PHONE = getTenantConfig().supportPhone;
const BASE_URL = `https://wa.me/${BASE_PHONE}`;
const BRAND_NAME = getTenantConfig().brandName;

function buildWhatsAppLink(message: string): string {
  return `${BASE_URL}?text=${encodeURIComponent(message)}`;
}

type PassengerConfirmationInput = {
  passengerName: string;
  folio: string;
  activity: string;
  dateText?: string;
  amount?: number;
  comprobanteUrl?: string;
};

export function buildPassengerConfirmationLink(input: PassengerConfirmationInput): string {
  const dateLine = input.dateText ? `\nFecha confirmada: ${input.dateText}` : "";
  const amountLine = typeof input.amount === "number" ? `\nMonto: $${input.amount.toLocaleString("es-MX")} MXN` : "";
  const voucherLine = input.comprobanteUrl ? `\nComprobante: ${input.comprobanteUrl}` : "";
  const message =
    `Hola ${input.passengerName}, tu reserva en ${BRAND_NAME} quedó confirmada.` +
    `\nFolio: ${input.folio}` +
    `\nActividad: ${input.activity}` +
    `${dateLine}` +
    `${amountLine}` +
    `${voucherLine}` +
    `\nConserva este mensaje para el check-in en pista.`;
  return buildWhatsAppLink(message);
}

type FortinCoordinatesInput = {
  folio: string;
  mapsUrl?: string;
  passengerName?: string;
};

export function buildFortinCoordinatesLink(input: FortinCoordinatesInput): string {
  const mapsUrl = input.mapsUrl || "https://maps.google.com/?q=19.5330,-96.9368";
  const nameLine = input.passengerName ? `\nPasajero: ${input.passengerName}` : "";
  const message =
    `Compartimos coordenadas para tu salida de vuelo ${BRAND_NAME}.` +
    `\nFolio: ${input.folio}` +
    `${nameLine}` +
    `\nPunto de encuentro: Gasolinera / Pista de Fortín de las Flores.` +
    `\nUbicación GPS: ${mapsUrl}` +
    `\nRecomendaciones: calzado cerrado, ropa cómoda y peso máximo 95 kg.`;
  return buildWhatsAppLink(message);
}

type WeatherAlertInput = {
  folio: string;
  conditionSummary: string;
};

export function buildWeatherAlertLink(input: WeatherAlertInput): string {
  const message =
    `Alerta de condiciones de viento para folio ${input.folio}.` +
    `\nReporte: ${input.conditionSummary}` +
    `\nFavor de confirmar ventana operativa con Salvador Lara antes del traslado.`;
  return buildWhatsAppLink(message);
}

type SalvadorAlertInput = {
  folio: string;
  customerName: string;
  reservationDate?: string;
  reservationSlot?: string;
  amount?: number;
  activity?: string;
};

export function buildSalvadorAlertLink(input: SalvadorAlertInput): string {
  const scheduleLine = input.reservationDate ? `\nReserva: ${input.reservationDate}${input.reservationSlot ? ` ${input.reservationSlot}` : ""}` : "";
  const amountLine = typeof input.amount === "number" ? `\nMonto: $${input.amount.toLocaleString("es-MX")} MXN` : "";
  const message =
    `Salvador, confirmación de reserva para ${BRAND_NAME}.` +
    `\nFolio: ${input.folio}` +
    `\nPasajero: ${input.customerName}` +
    `\nActividad: ${input.activity || "Vuelo tándem Fortín"}` +
    `${scheduleLine}` +
    `${amountLine}` +
    `\nNecesitamos validar horario y condiciones de viento antes del despegue.`;
  return buildWhatsAppLink(message);
}

export function buildSalvadorWindConfirmationLink(folio: string): string {
  const message =
    `Salvador, por favor confirmar condiciones de viento para el folio ${folio}.` +
    `\nNecesitamos validación final para despegue seguro en Fortín.`;
  return buildWhatsAppLink(message);
}
