import anturios from "@/data/anturios.json";
import paraiso from "@/data/el_paraiso.json";

export const TELEFONO_WHATSAPP = "522727258748";

export function enlaceWhatsapp(texto: string) {
  return `/checkout${TELEFONO_WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

export function etiquetaPrecio(centavos: number | null) {
  if (centavos == null) return "Cotización";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

export function datosAnturios() {
  return anturios;
}

export function datosParaiso() {
  return paraiso;
}

