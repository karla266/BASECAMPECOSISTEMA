import type { Metadata } from "next";
import FormularioIngreso from "./formulario";

export const metadata: Metadata = {
  title: "Entrar al panel | Basecamp 420",
};

export default function IngresoAdminPage() {
  return <FormularioIngreso />;
}
