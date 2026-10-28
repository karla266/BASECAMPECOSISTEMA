import type { Metadata } from "next";
import PantallaAcceso from "./pantalla";

export const metadata: Metadata = {
  title: "Usuarios y contraseña | Basecamp 420",
};

export default function AccesoAdminPage() {
  return <PantallaAcceso />;
}
