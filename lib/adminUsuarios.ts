import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { mkdir, open, readFile, stat, unlink, writeFile, type FileHandle } from "fs/promises";
import path from "path";

export const ROLES_USUARIO = ["admin", "cajero", "mostrador", "trabajador"] as const;
export const HORARIOS_USUARIO = ["matutino", "vespertino", "completo"] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];
export type HorarioUsuario = (typeof HORARIOS_USUARIO)[number];

export type UsuarioPublico = {
  usuario: string;
  nombre: string;
  rol: RolUsuario;
  horario: HorarioUsuario;
  creadoEn: string;
};

export type DestinoLector = "mostrador" | "admin";

export type HuellaGuardada = {
  id: string;
  registradoEn: string;
};

type UsuarioGuardado = UsuarioPublico & {
  passwordHash: string;
  nfcUids: string[];
  huellas: HuellaGuardada[];
};

export type LectorConfig = {
  activo: boolean;
  destinos: DestinoLector[];
};

export type LectoresGuardados = {
  nfc: LectorConfig;
  huella: LectorConfig & { origen: string };
};

type ArchivoAcceso = {
  usuarios: UsuarioGuardado[];
  lectores?: LectoresGuardados;
};

export type EnrolamientoPublico = {
  usuario: string;
  nombre: string;
  rol: RolUsuario;
  nfcUids: string[];
  huellas: HuellaGuardada[];
};

export type ResultadoLector =
  | { ok: true; usuario: UsuarioPublico }
  | { ok: false; status: number; error: string };

type Resultado<T = undefined> =
  | { ok: true; datos: T }
  | { ok: false; error: string };

const RUTA = path.join(process.cwd(), "data", "admin-acceso.json");
const USUARIO_INICIAL = "admin";
const CLAVE_INICIAL = "admin";

let cola: Promise<unknown> = Promise.resolve();

function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const ejecucion = cola.then(() => conBloqueo(tarea), () => conBloqueo(tarea));
  cola = ejecucion.then(
    () => undefined,
    () => undefined
  );
  return ejecucion;
}

async function conBloqueo<T>(tarea: () => Promise<T>): Promise<T> {
  const lockPath = `${RUTA}.lock`;
  await mkdir(path.dirname(RUTA), { recursive: true });
  let handle: FileHandle | null = null;
  for (let intento = 0; intento < 50; intento += 1) {
    try {
      handle = await open(lockPath, "wx");
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        const info = await stat(lockPath);
        if (Date.now() - info.mtimeMs > 10_000) {
          await unlink(lockPath);
          continue;
        }
      } catch {
        continue;
      }
      await new Promise((resolver) => setTimeout(resolver, 40));
    }
  }
  if (!handle) throw new Error("No se pudo guardar el acceso.");
  try {
    return await tarea();
  } finally {
    await handle.close();
    await unlink(lockPath).catch(() => undefined);
  }
}

export function hashClave(clave: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(clave, sal, 32).toString("hex");
  return `scrypt$${sal}$${hash}`;
}

export function claveCoincide(clave: string, almacenada: string): boolean {
  const partes = almacenada.split("$");
  if (partes.length !== 3 || partes[0] !== "scrypt") return false;
  const sal = partes[1];
  const hash = partes[2];
  if (!sal || !hash || !/^[0-9a-f]+$/i.test(hash)) return false;
  const calculado = scryptSync(clave, sal, 32);
  const previo = Buffer.from(hash, "hex");
  if (calculado.length !== previo.length) return false;
  return timingSafeEqual(calculado, previo);
}

function publico(usuario: UsuarioGuardado): UsuarioPublico {
  return {
    usuario: usuario.usuario,
    nombre: usuario.nombre,
    rol: usuario.rol,
    horario: usuario.horario,
    creadoEn: usuario.creadoEn,
  };
}

function normalizarUsuario(valor: string): string | null {
  const limpio = valor.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(limpio)) return null;
  return limpio;
}

function normalizarNombre(valor: string): string | null {
  const limpio = valor.trim().replace(/\s+/g, " ");
  if (limpio.length < 2 || limpio.length > 80) return null;
  if (/[\u0000-\u001F]/.test(limpio)) return null;
  return limpio;
}

function rolGuardado(valor: unknown): RolUsuario {
  if (valor === "admin" || valor === "cajero" || valor === "mostrador" || valor === "trabajador") {
    return valor;
  }
  return "cajero";
}

function horarioGuardado(valor: unknown): HorarioUsuario {
  if (valor === "matutino" || valor === "vespertino" || valor === "completo") return valor;
  return "completo";
}

export function rolDeAlta(valor: string): "admin" | "cajero" | null {
  const limpio = valor.trim().toLowerCase();
  if (limpio === "admin" || limpio === "cajero") return limpio;
  return null;
}

export function horarioDeAlta(valor: string): HorarioUsuario | null {
  const limpio = valor.trim().toLowerCase();
  if (limpio === "matutino" || limpio === "vespertino" || limpio === "completo") return limpio;
  return null;
}

function validarClaveNueva(clave: string): string | null {
  if (clave.length < 4 || clave.length > 128) {
    return "La contraseña nueva debe tener entre 4 y 128 caracteres.";
  }
  return null;
}

function credencialIgual(izquierda: string, derecha: string): boolean {
  return timingSafeEqual(createHash("sha256").update(izquierda).digest(), createHash("sha256").update(derecha).digest());
}

export function normalizarUid(valor: string): string | null {
  const compacto = valor.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (compacto.length < 4 || compacto.length > 64) return null;
  return compacto;
}

export function normalizarCredentialId(valor: string): string | null {
  const limpio = valor.trim().replace(/=+$/g, "");
  if (!/^[A-Za-z0-9_-]{16,512}$/.test(limpio)) return null;
  return limpio;
}

function normalizarUids(valor: unknown): { uids: string[]; cambio: boolean } {
  if (!Array.isArray(valor)) return { uids: [], cambio: true };
  const uids: string[] = [];
  const vistos = new Set<string>();
  let cambio = false;
  for (const item of valor) {
    if (typeof item !== "string") {
      cambio = true;
      continue;
    }
    const uid = normalizarUid(item);
    if (!uid || vistos.has(uid)) {
      cambio = true;
      continue;
    }
    vistos.add(uid);
    if (uid !== item) cambio = true;
    uids.push(uid);
  }
  return { uids, cambio };
}

function normalizarHuellas(valor: unknown): { huellas: HuellaGuardada[]; cambio: boolean } {
  if (!Array.isArray(valor)) return { huellas: [], cambio: true };
  const huellas: HuellaGuardada[] = [];
  const vistos = new Set<string>();
  let cambio = false;
  for (const item of valor) {
    if (!item || typeof item !== "object") {
      cambio = true;
      continue;
    }
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string") {
      cambio = true;
      continue;
    }
    const id = normalizarCredentialId(row.id);
    if (!id || vistos.has(id)) {
      cambio = true;
      continue;
    }
    vistos.add(id);
    const registradoEn =
      typeof row.registradoEn === "string" && row.registradoEn ? row.registradoEn : new Date().toISOString();
    if (id !== row.id || registradoEn !== row.registradoEn) cambio = true;
    huellas.push({ id, registradoEn });
  }
  return { huellas, cambio };
}

export function normalizarDestinos(valor: unknown): DestinoLector[] {
  if (valor === "ambos") return ["mostrador", "admin"];
  if (valor === "mostrador" || valor === "admin") return [valor];
  if (!Array.isArray(valor)) return [];
  const salida: DestinoLector[] = [];
  for (const item of valor) {
    if ((item === "mostrador" || item === "admin") && !salida.includes(item)) salida.push(item);
  }
  return salida;
}

function origenHuellaValido(valor: string): boolean {
  return valor === "http://localhost:3000" || valor === "http://127.0.0.1:3000";
}

function lectoresIniciales(): LectoresGuardados {
  return {
    nfc: { activo: false, destinos: [] },
    huella: { activo: false, destinos: [], origen: "" },
  };
}

function normalizarLectores(valor: unknown): { lectores: LectoresGuardados; cambio: boolean } {
  if (!valor || typeof valor !== "object") return { lectores: lectoresIniciales(), cambio: true };
  const row = valor as Record<string, unknown>;
  const nfcRow = row.nfc && typeof row.nfc === "object" ? (row.nfc as Record<string, unknown>) : null;
  const huellaRow = row.huella && typeof row.huella === "object" ? (row.huella as Record<string, unknown>) : null;
  if (!nfcRow || !huellaRow) return { lectores: lectoresIniciales(), cambio: true };
  const nfc: LectorConfig = {
    activo: nfcRow.activo === true,
    destinos: normalizarDestinos(nfcRow.destinos),
  };
  const origenBruto = typeof huellaRow.origen === "string" ? huellaRow.origen : "";
  const huella = {
    activo: huellaRow.activo === true,
    destinos: normalizarDestinos(huellaRow.destinos),
    origen: origenHuellaValido(origenBruto) ? origenBruto : "",
  };
  const cambio =
    nfcRow.activo !== nfc.activo ||
    huellaRow.activo !== huella.activo ||
    JSON.stringify(nfcRow.destinos) !== JSON.stringify(nfc.destinos) ||
    JSON.stringify(huellaRow.destinos) !== JSON.stringify(huella.destinos) ||
    origenBruto !== huella.origen;
  return { lectores: { nfc, huella }, cambio };
}

function usuarioAdminInicial(): UsuarioGuardado {
  return {
    usuario: USUARIO_INICIAL,
    nombre: "Administrador",
    rol: "admin",
    horario: "completo",
    passwordHash: hashClave(CLAVE_INICIAL),
    creadoEn: new Date().toISOString(),
    nfcUids: [],
    huellas: [],
  };
}

function normalizarRegistro(item: unknown): { registro: UsuarioGuardado; cambio: boolean } | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  if (typeof row.usuario !== "string" || typeof row.passwordHash !== "string") return null;
  const usuario = normalizarUsuario(row.usuario);
  if (!usuario || !row.passwordHash.startsWith("scrypt$")) return null;
  const nombreNormal = typeof row.nombre === "string" ? normalizarNombre(row.nombre) : null;
  const nombre = nombreNormal ?? usuario;
  const rol = usuario === USUARIO_INICIAL ? "admin" : rolGuardado(row.rol);
  const horario = horarioGuardado(row.horario);
  const creadoEn =
    typeof row.creadoEn === "string" && row.creadoEn ? row.creadoEn : new Date().toISOString();
  const uids = normalizarUids(row.nfcUids);
  const huellas = normalizarHuellas(row.huellas);
  const cambio =
    row.usuario !== usuario ||
    row.nombre !== nombre ||
    row.rol !== rol ||
    row.horario !== horario ||
    row.creadoEn !== creadoEn ||
    uids.cambio ||
    huellas.cambio;
  return {
    registro: {
      usuario,
      nombre,
      rol,
      horario,
      passwordHash: row.passwordHash,
      creadoEn,
      nfcUids: uids.uids,
      huellas: huellas.huellas,
    },
    cambio,
  };
}

function asegurarAdmin(registros: UsuarioGuardado[]): { registros: UsuarioGuardado[]; cambio: boolean } {
  const indice = registros.findIndex((item) => item.usuario === USUARIO_INICIAL);
  if (indice < 0) {
    return { registros: [usuarioAdminInicial(), ...registros], cambio: true };
  }
  const actual = registros[indice];
  if (actual.rol === "admin") return { registros, cambio: false };
  const copia = registros.slice();
  copia[indice] = { ...actual, rol: "admin" };
  return { registros: copia, cambio: true };
}

async function escribir(usuarios: UsuarioGuardado[], lectores: LectoresGuardados): Promise<void> {
  await mkdir(path.dirname(RUTA), { recursive: true });
  const asegurado = asegurarAdmin(usuarios).registros;
  const cuerpo: ArchivoAcceso = { usuarios: asegurado, lectores };
  await writeFile(RUTA, `${JSON.stringify(cuerpo, null, 2)}\n`, "utf8");
}

async function leerCrudo(): Promise<{ registros: UsuarioGuardado[]; lectores: LectoresGuardados; cambio: boolean } | null> {
  let texto: string;
  try {
    texto = await readFile(RUTA, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  let data: unknown;
  try {
    data = JSON.parse(texto);
  } catch {
    throw new Error("No se pudo leer el acceso del panel.");
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as ArchivoAcceso).usuarios)) {
    throw new Error("No se pudo leer el acceso del panel.");
  }
  let cambio = false;
  const registros: UsuarioGuardado[] = [];
  const vistos = new Set<string>();
  for (const item of (data as { usuarios: unknown[] }).usuarios) {
    const normal = normalizarRegistro(item);
    if (!normal) {
      cambio = true;
      continue;
    }
    if (vistos.has(normal.registro.usuario)) {
      cambio = true;
      continue;
    }
    vistos.add(normal.registro.usuario);
    if (normal.cambio) cambio = true;
    registros.push(normal.registro);
  }
  const lectoresNorm = normalizarLectores((data as { lectores?: unknown }).lectores);
  if (lectoresNorm.cambio) cambio = true;
  return { registros, lectores: lectoresNorm.lectores, cambio };
}

async function guardar(usuarios: UsuarioGuardado[]): Promise<void> {
  const crudo = await leerCrudo();
  const mapa = new Map<string, UsuarioGuardado>();
  for (const item of crudo?.registros ?? []) mapa.set(item.usuario, item);
  for (const item of usuarios) mapa.set(item.usuario, item);
  await escribir([...mapa.values()], crudo?.lectores ?? lectoresIniciales());
}

async function leerOSembrar(): Promise<{ usuarios: UsuarioGuardado[]; lectores: LectoresGuardados }> {
  const crudo = await leerCrudo();
  if (!crudo) {
    const sembrado = [usuarioAdminInicial()];
    const lectores = lectoresIniciales();
    await escribir(sembrado, lectores);
    return { usuarios: sembrado, lectores };
  }
  const asegurado = asegurarAdmin(crudo.registros);
  if (crudo.cambio || asegurado.cambio) {
    await escribir(asegurado.registros, crudo.lectores);
  }
  return { usuarios: asegurado.registros, lectores: crudo.lectores };
}

export function autenticar(usuario: string, clave: string): Promise<UsuarioPublico | null> {
  return enCola(async () => {
    const data = await leerOSembrar();
    const normalizado = normalizarUsuario(usuario);
    if (!normalizado) return null;
    const encontrado = data.usuarios.find((item) => item.usuario === normalizado);
    if (!encontrado || !claveCoincide(clave, encontrado.passwordHash)) return null;
    return publico(encontrado);
  });
}

export function listarUsuarios(): Promise<UsuarioPublico[]> {
  return enCola(async () => {
    const data = await leerOSembrar();
    return data.usuarios.map(publico);
  });
}

export function crearUsuario(entrada: {
  usuario: string;
  nombre: string;
  clave: string;
  rol: string;
  horario: string;
}): Promise<Resultado<UsuarioPublico>> {
  return enCola(async () => {
    const usuario = normalizarUsuario(entrada.usuario);
    const nombre = normalizarNombre(entrada.nombre);
    const rol = rolDeAlta(entrada.rol);
    const horario = horarioDeAlta(entrada.horario);
    if (!usuario) {
      return {
        ok: false,
        error: "El usuario debe tener de 3 a 32 caracteres: letras, números, punto, guion o guion bajo.",
      };
    }
    if (!nombre) {
      return { ok: false, error: "Indica el nombre de la persona (entre 2 y 80 caracteres)." };
    }
    if (!rol) {
      return { ok: false, error: "Elige el rol: administrador o cajero." };
    }
    if (!horario) {
      return { ok: false, error: "Elige el horario: matutino, vespertino o completo." };
    }
    const errorClave = validarClaveNueva(entrada.clave);
    if (errorClave) return { ok: false, error: errorClave };

    const data = await leerOSembrar();
    if (data.usuarios.some((item) => item.usuario === usuario)) {
      return { ok: false, error: "Ese usuario ya existe." };
    }
    const creado: UsuarioGuardado = {
      usuario,
      nombre,
      rol,
      horario,
      passwordHash: hashClave(entrada.clave),
      creadoEn: new Date().toISOString(),
      nfcUids: [],
      huellas: [],
    };
    data.usuarios.push(creado);
    await guardar(data.usuarios);
    return { ok: true, datos: publico(creado) };
  });
}

export function cambiarClave(
  usuario: string,
  actual: string,
  nueva: string
): Promise<Resultado> {
  return enCola(async () => {
    const errorClave = validarClaveNueva(nueva);
    if (errorClave) return { ok: false, error: errorClave };
    const data = await leerOSembrar();
    const indice = data.usuarios.findIndex((item) => item.usuario === usuario);
    if (indice < 0) return { ok: false, error: "La sesión ya no es válida." };
    if (!claveCoincide(actual, data.usuarios[indice].passwordHash)) {
      return { ok: false, error: "La contraseña actual no coincide." };
    }
    if (claveCoincide(nueva, data.usuarios[indice].passwordHash)) {
      return { ok: false, error: "Elige una contraseña distinta a la actual." };
    }
    data.usuarios[indice] = {
      ...data.usuarios[indice],
      passwordHash: hashClave(nueva),
    };
    await guardar(data.usuarios);
    return { ok: true, datos: undefined };
  });
}

export function puedeEntrarConLector(rol: RolUsuario, destino: DestinoLector): boolean {
  if (destino === "admin") return rol === "admin";
  return rol === "admin" || rol === "cajero" || rol === "mostrador";
}

function lectorActivoPara(lectores: LectoresGuardados, tipo: "nfc" | "huella", destino: DestinoLector): boolean {
  const lector = lectores[tipo];
  return lector.activo === true && lector.destinos.includes(destino);
}

function mensajeSinPermiso(destino: DestinoLector): string {
  if (destino === "admin") return "Esta persona no entra al administrador.";
  return "Esta persona no entra al mostrador.";
}

export function leerEstadoLectores(): Promise<LectoresGuardados> {
  return enCola(async () => (await leerOSembrar()).lectores);
}

export function leerConfiguracionLectores(): Promise<{ lectores: LectoresGuardados; usuarios: EnrolamientoPublico[] }> {
  return enCola(async () => {
    const data = await leerOSembrar();
    return {
      lectores: data.lectores,
      usuarios: data.usuarios.map((item) => ({
        usuario: item.usuario,
        nombre: item.nombre,
        rol: item.rol,
        nfcUids: item.nfcUids,
        huellas: item.huellas,
      })),
    };
  });
}

export function guardarLectores(entrada: {
  nfc: { activo: boolean; destinos: unknown };
  huella: { activo: boolean; destinos: unknown; origen?: unknown };
}): Promise<Resultado<LectoresGuardados>> {
  return enCola(async () => {
    const normal = normalizarLectores({
      nfc: { activo: entrada.nfc.activo === true, destinos: entrada.nfc.destinos },
      huella: {
        activo: entrada.huella.activo === true,
        destinos: entrada.huella.destinos,
        origen: typeof entrada.huella.origen === "string" ? entrada.huella.origen : "",
      },
    });
    const lectores = normal.lectores;
    if (lectores.nfc.activo && lectores.nfc.destinos.length === 0) {
      return { ok: false, error: "Elige para qué sirve el lector NFC: mostrador, administrador o ambos." };
    }
    if (lectores.huella.activo && lectores.huella.destinos.length === 0) {
      return { ok: false, error: "Elige para qué sirve el lector de huellas: mostrador, administrador o ambos." };
    }
    const data = await leerOSembrar();
    if (!lectores.huella.origen && data.lectores.huella.origen) {
      lectores.huella.origen = data.lectores.huella.origen;
    }
    await escribir(data.usuarios, lectores);
    return { ok: true, datos: lectores };
  });
}

export function enrolarNfc(usuario: string, uid: string): Promise<Resultado<{ uid: string }>> {
  return enCola(async () => {
    const normalUsuario = normalizarUsuario(usuario);
    const normalUid = normalizarUid(uid);
    if (!normalUsuario) return { ok: false, error: "Elige un usuario existente." };
    if (!normalUid) return { ok: false, error: "El identificador de la tarjeta no es válido." };
    const data = await leerOSembrar();
    const indice = data.usuarios.findIndex((item) => item.usuario === normalUsuario);
    if (indice < 0) return { ok: false, error: "Ese usuario no existe." };
    const dueno = data.usuarios.find((item) => item.nfcUids.some((itemUid) => credencialIgual(itemUid, normalUid)));
    if (dueno?.usuario === normalUsuario) return { ok: true, datos: { uid: normalUid } };
    if (dueno) return { ok: false, error: "Esa tarjeta ya está enrolada a otra persona." };
    const actual = data.usuarios[indice];
    data.usuarios[indice] = { ...actual, nfcUids: [...actual.nfcUids, normalUid] };
    await escribir(data.usuarios, data.lectores);
    return { ok: true, datos: { uid: normalUid } };
  });
}

export function quitarNfc(usuario: string, uid: string): Promise<Resultado> {
  return enCola(async () => {
    const normalUsuario = normalizarUsuario(usuario);
    const normalUid = normalizarUid(uid);
    if (!normalUsuario || !normalUid) return { ok: false, error: "No se pudo quitar la tarjeta." };
    const data = await leerOSembrar();
    const indice = data.usuarios.findIndex((item) => item.usuario === normalUsuario);
    if (indice < 0) return { ok: false, error: "Ese usuario no existe." };
    const actual = data.usuarios[indice];
    if (!actual.nfcUids.some((itemUid) => credencialIgual(itemUid, normalUid))) {
      return { ok: false, error: "Esa tarjeta no está enrolada a ese usuario." };
    }
    data.usuarios[indice] = {
      ...actual,
      nfcUids: actual.nfcUids.filter((itemUid) => !credencialIgual(itemUid, normalUid)),
    };
    await escribir(data.usuarios, data.lectores);
    return { ok: true, datos: undefined };
  });
}

export function enrolarHuella(
  usuario: string,
  credentialId: string,
  origen: string
): Promise<Resultado<{ id: string }>> {
  return enCola(async () => {
    const normalUsuario = normalizarUsuario(usuario);
    const normalId = normalizarCredentialId(credentialId);
    if (!normalUsuario) return { ok: false, error: "Elige un usuario existente." };
    if (!normalId) return { ok: false, error: "No se pudo guardar la huella de este equipo." };
    const data = await leerOSembrar();
    const indice = data.usuarios.findIndex((item) => item.usuario === normalUsuario);
    if (indice < 0) return { ok: false, error: "Ese usuario no existe." };
    const dueno = data.usuarios.find((item) => item.huellas.some((huella) => credencialIgual(huella.id, normalId)));
    if (dueno && dueno.usuario !== normalUsuario) {
      return { ok: false, error: "Esa huella ya está enrolada a otra persona." };
    }
    if (!dueno) {
      const actual = data.usuarios[indice];
      data.usuarios[indice] = {
        ...actual,
        huellas: [...actual.huellas, { id: normalId, registradoEn: new Date().toISOString() }],
      };
    }
    if (origenHuellaValido(origen)) {
      data.lectores = {
        ...data.lectores,
        huella: { ...data.lectores.huella, origen },
      };
    }
    await escribir(data.usuarios, data.lectores);
    return { ok: true, datos: { id: normalId } };
  });
}

export function quitarHuella(usuario: string, credentialId: string): Promise<Resultado> {
  return enCola(async () => {
    const normalUsuario = normalizarUsuario(usuario);
    const normalId = normalizarCredentialId(credentialId);
    if (!normalUsuario || !normalId) return { ok: false, error: "No se pudo quitar la huella." };
    const data = await leerOSembrar();
    const indice = data.usuarios.findIndex((item) => item.usuario === normalUsuario);
    if (indice < 0) return { ok: false, error: "Ese usuario no existe." };
    const actual = data.usuarios[indice];
    if (!actual.huellas.some((huella) => credencialIgual(huella.id, normalId))) {
      return { ok: false, error: "Esa huella no está enrolada a ese usuario." };
    }
    data.usuarios[indice] = {
      ...actual,
      huellas: actual.huellas.filter((huella) => !credencialIgual(huella.id, normalId)),
    };
    await escribir(data.usuarios, data.lectores);
    return { ok: true, datos: undefined };
  });
}

function resolverCredencial(
  data: { usuarios: UsuarioGuardado[]; lectores: LectoresGuardados },
  tipo: "nfc" | "huella",
  valor: string,
  destino: DestinoLector,
  textos: { apagado: string; desconocido: string; invalido: string }
): ResultadoLector {
  if (!lectorActivoPara(data.lectores, tipo, destino)) {
    return { ok: false, status: 403, error: textos.apagado };
  }
  const encontrado =
    tipo === "nfc"
      ? data.usuarios.find((item) => item.nfcUids.some((uid) => credencialIgual(uid, valor)))
      : data.usuarios.find((item) => item.huellas.some((huella) => credencialIgual(huella.id, valor)));
  if (!encontrado) return { ok: false, status: 401, error: textos.desconocido };
  if (!puedeEntrarConLector(encontrado.rol, destino)) {
    return { ok: false, status: 403, error: mensajeSinPermiso(destino) };
  }
  return { ok: true, usuario: publico(encontrado) };
}

export function verificarNfc(uid: string, destino: DestinoLector): Promise<ResultadoLector> {
  return enCola(async () => {
    const normal = normalizarUid(uid);
    if (!normal) return { ok: false, status: 400, error: "El identificador de la tarjeta no es válido." };
    const data = await leerOSembrar();
    const apagado =
      destino === "admin"
        ? "El lector NFC no está activo para el administrador."
        : "El lector NFC no está activo para el mostrador.";
    return resolverCredencial(data, "nfc", normal, destino, {
      apagado,
      desconocido: "No reconocemos esa tarjeta.",
      invalido: "El identificador de la tarjeta no es válido.",
    });
  });
}

export function verificarHuella(credentialId: string, destino: DestinoLector): Promise<ResultadoLector> {
  return enCola(async () => {
    const normal = normalizarCredentialId(credentialId);
    if (!normal) return { ok: false, status: 400, error: "La huella no es válida." };
    const data = await leerOSembrar();
    const apagado =
      destino === "admin"
        ? "El lector de huellas no está activo para el administrador."
        : "El lector de huellas no está activo para el mostrador.";
    return resolverCredencial(data, "huella", normal, destino, {
      apagado,
      desconocido: "No reconocemos esa huella.",
      invalido: "La huella no es válida.",
    });
  });
}
