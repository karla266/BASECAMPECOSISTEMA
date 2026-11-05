import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Renta de equipo | Basecamp 420",
  description: "Renta de equipo de montaña y camping en Basecamp 420, Orizaba, Veracruz.",
  alternates: {
    canonical: "https://www.basecamp420.com/renta",
  },
};

export default function RentaLayout({ children }: { children: ReactNode }) {
  return children;
}
