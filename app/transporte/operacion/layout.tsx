import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cabina de Transporte Sprinter | Basecamp 420",
  description: "Inspección pre-ruta, abordaje de las 08:30 y maletero de parapente para el chofer de la Sprinter.",
  robots: { index: false, follow: false },
};

export default function CabinaTransporteLayout({ children }: { children: ReactNode }) {
  return children;
}
