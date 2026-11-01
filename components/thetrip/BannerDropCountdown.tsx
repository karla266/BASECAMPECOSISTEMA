"use client";

import { useDropStatus } from "@/hooks/useDropStatus";

function cierreEn(dias: number) {
  if (dias <= 0) return "Cierre de pedidos hoy";
  const unidad = dias === 1 ? "día" : "días";
  return `Cierre de pedidos en ${dias} ${unidad}`;
}

export default function BannerDropCountdown() {
  const drop = useDropStatus();
  const texto = drop.esPreVenta
    ? `🔥 DROP QUINCENAL EN CURSO: Pre-ordena hoy. ${cierreEn(drop.diasRestantes)}. Entrega garantizada: ${drop.fechaEntrega}`
    : `${drop.badgeTexto}. ${drop.nombre}`;

  return (
    <aside
      className="sticky top-0 z-30 border-b border-emerald-500/50 bg-zinc-950 px-4 py-3 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold leading-6 text-amber-300 md:text-base">
        <span className="text-emerald-400">{drop.esPreVenta ? "Pre-venta abierta" : "Calendario de drops"}</span>
        <span className="mx-2 text-zinc-600">·</span>
        {texto}
      </p>
    </aside>
  );
}
