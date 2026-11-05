import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Basecamp 420 | Parapente, The Trip Smoke Shop y Aventura",
  description:
    "Basecamp 420 en Orizaba, Veracruz: vuelos en parapente tándem, cursos, renta de equipo y servicios de The Trip Smoke Shop.",
  alternates: {
    canonical: "https://www.basecamp420.com/",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
