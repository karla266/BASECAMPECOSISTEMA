import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Basecamp 420 Adventure | Vuelos y expediciones",
  description: "Experiencias de aventura, vuelos en parapente y expediciones de Basecamp 420.",
  alternates: {
    canonical: "https://www.basecamp420.com/adventure",
  },
};

export default function AdventureLayout({ children }: { children: ReactNode }) {
  return children;
}
