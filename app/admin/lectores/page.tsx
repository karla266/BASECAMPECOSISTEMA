import type { Metadata } from "next";
import PantallaLectores from "./pantalla";

export const metadata: Metadata = {
  title: "Lectores de acceso | Basecamp 420",
};

export default function PaginaLectores() {
  return <PantallaLectores />;
}
