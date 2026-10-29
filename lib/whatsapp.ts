const BASE_PHONE = "522727258748";
const BASE_URL = `https://wa.me/${BASE_PHONE}`;

function buildWhatsAppLink(message: string): string {
  return `${BASE_URL}?text=${encodeURIComponent(message)}`;
}

type PassengerConfirmationInput = {
  passengerName: string;
  folio: string;
  activity: string;
  dateText?: string;
};

export function buildPassengerConfirmationLink(input: PassengerConfirmationInput): string {
  const dateLine = input.dateText ? `\nFecha confirmada: ${input.dateText}` : "";
  const message =
    `Hola ${input.passengerName}, tu reserva en Basecamp 420 quedó confirmada.` +
    `\nFolio: ${input.folio}` +
    `\nActividad: ${input.activity}` +
    `${dateLine}` +
    `\nConserva este mensaje para el check-in en pista.`;
  return buildWhatsAppLink(message);
}

type FortinCoordinatesInput = {
  folio: string;
  mapsUrl?: string;
};

export function buildFortinCoordinatesLink(input: FortinCoordinatesInput): string {
  const mapsUrl = input.mapsUrl || "https://maps.google.com/?q=19.5330,-96.9368";
  const message =
    `Compartimos coordenadas para tu salida de vuelo Basecamp 420.` +
    `\nFolio: ${input.folio}` +
    `\nPunto de encuentro: Gasolinera / Pista de Fortín de las Flores.` +
    `\nUbicación GPS: ${mapsUrl}`;
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

export function buildSalvadorWindConfirmationLink(folio: string): string {
  const message =
    `Salvador, por favor confirmar condiciones de viento para el folio ${folio}.` +
    `\nNecesitamos validación final para despegue seguro en Fortín.`;
  return buildWhatsAppLink(message);
}
