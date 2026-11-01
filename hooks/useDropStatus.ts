"use client";

import { useEffect, useState } from "react";
import motorInicial from "@/config/drops_engine.json";
import { estadoDrop, type EstadoDrop, type MotorDrops } from "@/lib/dropsEstado";

export function useDropStatus(): EstadoDrop {
  const [estado, setEstado] = useState<EstadoDrop>(() => estadoDrop(motorInicial as MotorDrops));

  useEffect(() => {
    let vigente = true;
    fetch("/api/thetrip/drop", { cache: "no-store" })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error("No se pudo leer el drop vigente.");
        return (await respuesta.json()) as EstadoDrop;
      })
      .then((vivo) => {
        if (!vigente) return;
        if (typeof vivo.esPreVenta !== "boolean" || typeof vivo.fechaEntrega !== "string") return;
        setEstado(vivo);
      })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : "No se pudo refrescar el drop.");
      });
    return () => {
      vigente = false;
    };
  }, []);

  return estado;
}
