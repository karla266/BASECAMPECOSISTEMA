import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NOMBRE_COOKIE_ROL, NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import KeypadPin from "./keypad";
import PantallaAcceso from "./pantalla";

export const metadata: Metadata = {
  title: "Acceso rápido | Basecamp 420",
};

export default async function AccesoAdminPage() {
  const jar = await cookies();
  const sesion = await verificarSesionAdmin(jar.get(NOMBRE_COOKIE_ROL)?.value || jar.get(NOMBRE_COOKIE_SESION)?.value);
  if (sesion?.rol === "operador_foto") redirect("/admin/camara");
  if (sesion?.rol === "admin") return <PantallaAcceso />;
  if (sesion) redirect("/admin");
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-300">Cargando acceso…</p>}>
      <KeypadPin />
    </Suspense>
  );
}
