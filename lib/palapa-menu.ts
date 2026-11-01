import menu from "@/data/menu_palapa.json";

export const PUNTOS_ENTREGA = [
  { id: "palapa_aterrizaje", etiqueta: "Al aterrizar mi vuelo en Palapa El Paraíso" },
  { id: "anturios_1400", etiqueta: "Desayuno en Restaurante Anturios (09:00 hrs)" },
  { id: "mesa_palapa", etiqueta: "Consumo en mesa en la palapa" },
] as const;

export type PuntoEntregaId = (typeof PUNTOS_ENTREGA)[number]["id"];

export type ProductoPalapa = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

export function leerMenu() {
  return menu as ProductoPalapa[];
}

export function etiquetaPunto(id: string) {
  return PUNTOS_ENTREGA.find((punto) => punto.id === id)?.etiqueta || "";
}

export function pesosDesdeCentavos(centavos: number) {
  return Math.trunc(centavos / 100);
}
