"use client";

import { Html5Qrcode } from "html5-qrcode";
import { FormEvent, useEffect, useRef, useState } from "react";

const CLAVE_SESION = "bc420-cabina-sprinter";
const CHECKOUT_EMERGENCIA = "/checkout";

const PUNTOS = [
  { clave: "diesel", texto: "Diesel ≥ 50%" },
  { clave: "extintor", texto: "Extintor vigente" },
  { clave: "botiquin", texto: "Botiquín" },
  { clave: "cinturones", texto: "Cinturones de seguridad" },
  { clave: "aire", texto: "Aire acondicionado" },
] as const;

type Clave = (typeof PUNTOS)[number]["clave"];
type Estatus = "PENDIENTE" | "A BORDO";
type Pestana = "inspeccion" | "abordaje" | "maletero";

type Pasajero = {
  folio: string;
  nombre: string;
  asientos: number;
  estatus: Estatus;
};

type Equipo = { codigo: string; tipo: "vela" | "arnes" };

const CITADOS: Pasajero[] = [
  { folio: "DC-2026-001", nombre: "Muestra Alfa", asientos: 1, estatus: "PENDIENTE" },
  { folio: "DC-2026-002", nombre: "Muestra Beta", asientos: 2, estatus: "PENDIENTE" },
  { folio: "DC-2026-003", nombre: "Muestra Gamma", asientos: 1, estatus: "PENDIENTE" },
];

const CHECKS_INICIALES: Record<Clave, boolean> = {
  diesel: false,
  extintor: false,
  botiquin: false,
  cinturones: false,
  aire: false,
};

function folioDe(texto: string) {
  const hallado = texto.toUpperCase().match(/DC-2026-\d{3}/);
  return hallado ? hallado[0] : "";
}

function avisar(ok: boolean) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(ok ? [40, 30, 80] : [140]);
    }
  } catch {
    /* el teléfono puede negar la vibración */
  }
  try {
    const Contexto = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return;
    const audio = new Contexto();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = ok ? 880 : 196;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.14);
    osc.onended = () => void audio.close();
  } catch {
    /* sin salida de audio el abordaje sigue */
  }
}

export default function CabinaTransportePage() {
  const archivoRef = useRef<HTMLInputElement>(null);
  const validarRef = useRef<(texto: string) => void>(() => undefined);
  const equipoRef = useRef<(texto: string) => void>(() => undefined);
  const [pestana, setPestana] = useState<Pestana>("inspeccion");
  const [hora, setHora] = useState("--:--:--");
  const [checks, setChecks] = useState<Record<Clave, boolean>>(CHECKS_INICIALES);
  const [vistaFoto, setVistaFoto] = useState("");
  const [nombreFoto, setNombreFoto] = useState("");
  const [fotoConfirmada, setFotoConfirmada] = useState(false);
  const [aprobada, setAprobada] = useState(false);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>(CITADOS);
  const [folio, setFolio] = useState("");
  const [aviso, setAviso] = useState("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [codigoEquipo, setCodigoEquipo] = useState("");
  const [camara, setCamara] = useState<null | "pase" | "equipo">(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const marcar = () => {
      setHora(
        new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/Mexico_City",
        }).format(new Date())
      );
    };
    marcar();
    const reloj = window.setInterval(marcar, 1000);
    return () => window.clearInterval(reloj);
  }, []);

  useEffect(() => {
    const crudo = window.sessionStorage.getItem(CLAVE_SESION);
    if (crudo) {
      try {
        const datos = JSON.parse(crudo) as {
          checks?: Partial<Record<Clave, boolean>>;
          nombreFoto?: string;
          fotoConfirmada?: boolean;
          aprobada?: boolean;
          pasajeros?: Pasajero[];
          equipos?: Equipo[];
        };
        if (datos.checks) {
          setChecks({ ...CHECKS_INICIALES, ...datos.checks });
        }
        if (typeof datos.nombreFoto === "string") setNombreFoto(datos.nombreFoto);
        if (datos.fotoConfirmada) setFotoConfirmada(true);
        if (datos.aprobada) setAprobada(true);
        if (Array.isArray(datos.pasajeros)) {
          setPasajeros(
            CITADOS.map((base) => {
              const previo = datos.pasajeros?.find((item) => item.folio === base.folio);
              return previo?.estatus === "A BORDO" ? { ...base, estatus: "A BORDO" } : base;
            })
          );
        }
        if (Array.isArray(datos.equipos)) {
          setEquipos(
            datos.equipos.filter(
              (item) => item && (item.tipo === "vela" || item.tipo === "arnes") && typeof item.codigo === "string"
            )
          );
        }
      } catch {
        window.sessionStorage.removeItem(CLAVE_SESION);
      }
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    window.sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ checks, nombreFoto, fotoConfirmada, aprobada, pasajeros, equipos })
    );
  }, [listo, checks, nombreFoto, fotoConfirmada, aprobada, pasajeros, equipos]);

  useEffect(() => {
    return () => {
      if (vistaFoto) URL.revokeObjectURL(vistaFoto);
    };
  }, [vistaFoto]);

  useEffect(() => {
    if (!camara) return;
    let activo = true;
    const lector = new Html5Qrcode("bc420-sprinter-qr");
    lector
      .start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (texto) => {
          if (!activo) return;
          const destino = camara;
          setCamara(null);
          if (destino === "pase") validarRef.current(texto);
          else equipoRef.current(texto);
        },
        () => undefined
      )
      .catch(() => {
        if (!activo) return;
        setCamara(null);
        setAviso("La cámara trasera no está disponible. Escribe el código.");
      });
    return () => {
      activo = false;
      void lector.stop().then(() => lector.clear()).catch(() => undefined);
    };
  }, [camara]);

  const inspeccionLista = PUNTOS.every((punto) => checks[punto.clave]) && fotoConfirmada;
  const asientosCitados = pasajeros.reduce((total, persona) => total + persona.asientos, 0);
  const asientosABordo = pasajeros
    .filter((persona) => persona.estatus === "A BORDO")
    .reduce((total, persona) => total + persona.asientos, 0);
  const velas = equipos.filter((item) => item.tipo === "vela").length;
  const arneses = equipos.filter((item) => item.tipo === "arnes").length;

  function validarPase(texto: string) {
    if (!aprobada) {
      setAviso("Aprueba la inspección para abrir el abordaje.");
      avisar(false);
      return;
    }
    const codigo = folioDe(texto);
    if (!codigo) {
      setAviso("El folio se escribe DC-2026-001.");
      avisar(false);
      return;
    }
    const citado = pasajeros.find((persona) => persona.folio === codigo);
    if (!citado) {
      setAviso(`${codigo} no está citado a las 08:30.`);
      avisar(false);
      return;
    }
    if (citado.estatus === "A BORDO") {
      setAviso(`${citado.nombre} ya está a bordo.`);
      avisar(false);
      return;
    }
    setPasajeros((lista) => lista.map((persona) => (persona.folio === codigo ? { ...persona, estatus: "A BORDO" } : persona)));
    setFolio("");
    setAviso(`${citado.nombre} quedó a bordo. ${citado.asientos} asiento${citado.asientos === 1 ? "" : "s"}.`);
    avisar(true);
  }

  function registrarEquipo(texto: string) {
    const limpio = texto.trim().toUpperCase();
    const tipo = limpio.startsWith("VELA-") ? "vela" : limpio.startsWith("ARNES-") ? "arnes" : "";
    if (!tipo || limpio.length < 6) {
      setAviso("El código de maletero empieza con VELA- o ARNES-.");
      avisar(false);
      return;
    }
    if (equipos.some((item) => item.codigo === limpio)) {
      setAviso(`${limpio} ya está en el maletero.`);
      avisar(false);
      return;
    }
    setEquipos((lista) => [...lista, { codigo: limpio, tipo }]);
    setCodigoEquipo("");
    setAviso(`${limpio} cargado para el despegue de Salvador Lara.`);
    avisar(true);
  }

  validarRef.current = validarPase;
  equipoRef.current = registrarEquipo;

  function elegirFoto(archivo: File | undefined) {
    if (!archivo) return;
    if (vistaFoto) URL.revokeObjectURL(vistaFoto);
    setVistaFoto(URL.createObjectURL(archivo));
    setNombreFoto(archivo.name);
    setFotoConfirmada(false);
  }

  function quitarFoto() {
    if (vistaFoto) URL.revokeObjectURL(vistaFoto);
    setVistaFoto("");
    setNombreFoto("");
    setFotoConfirmada(false);
    if (archivoRef.current) archivoRef.current.value = "";
  }

  function aprobarInspeccion() {
    if (!inspeccionLista) return;
    setAprobada(true);
    setPestana("abordaje");
    setAviso("Inspección aprobada. El abordaje de las 08:30 está abierto.");
    avisar(true);
  }

  function sumarManual(tipo: "vela" | "arnes") {
    const prefijo = tipo === "vela" ? "VELA-M" : "ARNES-M";
    const siguiente = equipos.filter((item) => item.tipo === tipo && item.codigo.startsWith(prefijo)).length + 1;
    registrarEquipo(`${prefijo}${String(siguiente).padStart(2, "0")}`);
  }

  function quitarUltimo(tipo: "vela" | "arnes") {
    const indice = equipos.reduce((ultimo, item, posicion) => (item.tipo === tipo ? posicion : ultimo), -1);
    if (indice < 0) return;
    setEquipos((lista) => lista.filter((_, posicion) => posicion !== indice));
  }

  function enviarFolio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    validarPase(folio);
  }

  function enviarEquipo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrarEquipo(codigoEquipo);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-44 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-black leading-6 text-white">Basecamp 420 — Cabina de Transporte Sprinter</h1>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-mono text-2xl font-semibold text-white" suppressHydrationWarning>
            {hora}
          </p>
          <p
            className={
              aprobada
                ? "inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-500 px-3 text-sm font-bold text-zinc-950"
                : "inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-3 text-sm font-bold text-zinc-950"
            }
          >
            <span className={"h-3 w-3 rounded-full " + (aprobada ? "bg-emerald-950" : "bg-red-600")} aria-hidden />
            {aprobada ? "Unidad lista" : "En inspección"}
          </p>
        </div>
        <p className="mt-1 text-xs text-zinc-400">Salida 08:30 · Oriente 27 y Norte 10 · {asientosABordo}/{asientosCitados} asientos a bordo</p>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4">
        {aviso ? (
          <p className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm" role="status">
            {aviso}
          </p>
        ) : null}

        {pestana === "inspeccion" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Checklist pre-ruta</h2>
            <p className="mt-1 text-sm text-zinc-400">Los cinco puntos y la foto de neumáticos y cabina abren el abordaje.</p>
            <ul className="mt-4 space-y-3">
              {PUNTOS.map((punto) => (
                <li key={punto.clave}>
                  <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-base">
                    <input
                      type="checkbox"
                      className="h-6 w-6 accent-emerald-500"
                      checked={checks[punto.clave]}
                      onChange={() => setChecks((estado) => ({ ...estado, [punto.clave]: !estado[punto.clave] }))}
                    />
                    {punto.texto}
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => archivoRef.current?.click()}
              className="mt-4 min-h-12 w-full rounded-2xl bg-zinc-100 text-base font-semibold text-zinc-950"
            >
              Fotografiar neumáticos y cabina
            </button>
            <input
              ref={archivoRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(evento) => elegirFoto(evento.target.files?.[0])}
            />
            {vistaFoto || nombreFoto ? (
              <div className="mt-3 rounded-2xl border border-zinc-800 p-3">
                {vistaFoto ? <img src={vistaFoto} alt="Evidencia de neumáticos y cabina" className="h-40 w-full rounded-xl object-cover" /> : null}
                <p className="mt-2 text-xs text-zinc-400">{fotoConfirmada ? "Foto confirmada" : "Vista previa"} · {nombreFoto}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFotoConfirmada(Boolean(nombreFoto))}
                    className="min-h-12 flex-1 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950"
                  >
                    Confirmar foto
                  </button>
                  <button type="button" onClick={quitarFoto} className="min-h-12 flex-1 rounded-xl border border-zinc-700 text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              disabled={!inspeccionLista || aprobada}
              onClick={aprobarInspeccion}
              className="mt-4 min-h-14 w-full rounded-2xl bg-emerald-500 text-base font-bold text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {aprobada ? "Inspección aprobada" : "Aprobar Inspección y Abrir Abordaje"}
            </button>
          </section>
        ) : null}

        {pestana === "abordaje" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Pases de las 08:30</h2>
            <p className="mt-1 text-sm text-zinc-400">Escanea el QR o escribe el folio DC-2026-XXX.</p>
            <form onSubmit={enviarFolio} className="mt-4 flex flex-col gap-3">
              <input
                value={folio}
                onChange={(evento) => setFolio(evento.target.value)}
                placeholder="DC-2026-001"
                autoCapitalize="characters"
                autoComplete="off"
                className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-lg uppercase tracking-wide text-white"
              />
              <button type="submit" className="min-h-12 rounded-2xl bg-emerald-500 text-base font-semibold text-zinc-950">
                Validar folio
              </button>
              <button type="button" onClick={() => setCamara("pase")} className="min-h-12 rounded-2xl border border-zinc-700 text-base font-semibold">
                Leer QR con cámara trasera
              </button>
            </form>
            <ul className="mt-4 space-y-3">
              {pasajeros.map((persona) => (
                <li key={persona.folio} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{persona.nombre}</p>
                      <p className="text-sm text-zinc-400">{persona.folio} · {persona.asientos} asiento{persona.asientos === 1 ? "" : "s"}</p>
                    </div>
                    <span
                      className={
                        persona.estatus === "A BORDO"
                          ? "rounded-full bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950"
                          : "rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200"
                      }
                    >
                      {persona.estatus}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {pestana === "maletero" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Maletero de parapente</h2>
            <p className="mt-1 text-sm text-zinc-400">Velas y arneses para el despegue de Salvador Lara (APPI).</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Velas</p>
                <p className="text-4xl font-black text-white">{velas}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => quitarUltimo("vela")} className="min-h-12 flex-1 rounded-xl border border-zinc-700 text-xl">−</button>
                  <button type="button" onClick={() => sumarManual("vela")} className="min-h-12 flex-1 rounded-xl bg-emerald-500 text-xl font-bold text-zinc-950">+</button>
                </div>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Arneses</p>
                <p className="text-4xl font-black text-white">{arneses}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => quitarUltimo("arnes")} className="min-h-12 flex-1 rounded-xl border border-zinc-700 text-xl">−</button>
                  <button type="button" onClick={() => sumarManual("arnes")} className="min-h-12 flex-1 rounded-xl bg-emerald-500 text-xl font-bold text-zinc-950">+</button>
                </div>
              </article>
            </div>
            <form onSubmit={enviarEquipo} className="mt-4 flex flex-col gap-3">
              <input
                value={codigoEquipo}
                onChange={(evento) => setCodigoEquipo(evento.target.value)}
                placeholder="VELA-001 o ARNES-001"
                autoCapitalize="characters"
                autoComplete="off"
                className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-lg uppercase text-white"
              />
              <button type="submit" className="min-h-12 rounded-2xl bg-zinc-100 text-base font-semibold text-zinc-950">
                Registrar código
              </button>
              <button type="button" onClick={() => setCamara("equipo")} className="min-h-12 rounded-2xl border border-zinc-700 text-base font-semibold">
                Escanear etiqueta del equipo
              </button>
            </form>
            {equipos.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {equipos.map((item) => (
                  <li key={item.codigo} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm">
                    {item.codigo} · {item.tipo === "vela" ? "vela" : "arnés"}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {camara ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-700 bg-black">
            <div id="bc420-sprinter-qr" className="min-h-56 w-full" />
            <button type="button" onClick={() => setCamara(null)} className="min-h-12 w-full text-sm font-semibold text-white">
              Cerrar cámara
            </button>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950 px-3 pb-3 pt-2">
        <a href={CHECKOUT_EMERGENCIA} className="flex min-h-12 items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white">
          Emergencia o tráfico · Ir al checkout
        </a>
        <nav className="mt-2 grid grid-cols-3 gap-2" aria-label="Operación de la Sprinter">
          {(
            [
              ["inspeccion", "Inspección"],
              ["abordaje", "Abordaje"],
              ["maletero", "Maletero"],
            ] as const
          ).map(([clave, etiqueta]) => (
            <button
              key={clave}
              type="button"
              aria-current={pestana === clave ? "page" : undefined}
              onClick={() => {
                setCamara(null);
                setPestana(clave);
              }}
              className={
                pestana === clave
                  ? "min-h-12 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950"
                  : "min-h-12 rounded-xl border border-zinc-700 text-sm font-semibold text-white"
              }
            >
              {etiqueta}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

