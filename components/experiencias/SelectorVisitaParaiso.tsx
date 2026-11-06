"use client";

import { FormEvent, useEffect, useState } from "react";
import visitas from "@/data/el_paraiso.json";

export default function SelectorVisitaParaiso() {
  const [fecha, setFecha] = useState("");
  const [visita, setVisita] = useState(visitas.visitas[0]?.id || "recorrido");
  const [minimo, setMinimo] = useState("");

  useEffect(() => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    setMinimo(`${hoy.getFullYear()}-${mes}-${dia}`);
  }, []);

  function continuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return;
    const elegida = visitas.visitas.find((item) => item.id === visita);
    const nombre = elegida?.nombre || "visita";
    if (visita === "vuelo") {
      window.location.href = `/reservar?fecha=${fecha}`;
      return;
    }
    window.location.href = `/reservar?fecha=${fecha}&visita=${encodeURIComponent(nombre)}`;
  }

  return (
    <form onSubmit={continuar} className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <label className="grid gap-2 text-sm">
        Fecha de visita
        <input
          type="date"
          required
          min={minimo || undefined}
          value={fecha}
          onChange={(evento) => setFecha(evento.target.value)}
          className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-base"
        />
      </label>
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm">Tipo de visita</legend>
        {visitas.visitas.map((item) => (
          <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-800 px-4">
            <input type="radio" name="visita" checked={visita === item.id} onChange={() => setVisita(item.id)} />
            {item.nombre}
          </label>
        ))}
      </fieldset>
      <button type="submit" className="min-h-12 rounded-xl bg-emerald-500 text-base font-black text-zinc-950">
        {visita === "vuelo" ? "Continuar en reservas" : "Reservar esta visita"}
      </button>
    </form>
  );
}
