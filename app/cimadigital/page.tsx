import type { Metadata } from "next";
import Header from "./components/Header";
import HeroCima from "./components/HeroCima";

export const metadata: Metadata = {
  title: "Cima Digital | AI Software Factory",
  description:
    "Fábrica de software e ecosistemas digitales. Agentes IA, pasarelas de pago y orquestación de datos a nivel industrial.",
};

export default function CimaDigital() {
  return (
    <main className="relative m-0 p-0">
      <Header />
      <HeroCima />
    </main>
  );
}
