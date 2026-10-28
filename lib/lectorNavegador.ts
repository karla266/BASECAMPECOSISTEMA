export function hayHuellaEnEsteNavegador(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function" && !!navigator.credentials;
}

export function hayNfcEnEsteNavegador(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

function idDeCredencial(credencial: Credential | null): string {
  if (!credencial || credencial.type !== "public-key") {
    throw new Error("El equipo no entregó una huella.");
  }
  const id = (credencial as PublicKeyCredential).id;
  if (!id) throw new Error("El equipo no entregó una huella.");
  return id;
}

export async function enrolarHuellaEnEquipo(usuario: string, nombre: string): Promise<string> {
  if (!hayHuellaEnEsteNavegador()) {
    throw new Error("Este navegador no tiene lector de huellas (Web Authentication).");
  }
  const credencial = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Basecamp 420", id: location.hostname },
      user: {
        id: new TextEncoder().encode(usuario),
        name: usuario,
        displayName: nombre || usuario,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      timeout: 60_000,
      attestation: "none",
    },
  });
  return idDeCredencial(credencial);
}

export async function leerHuellaEnEquipo(): Promise<string> {
  if (!hayHuellaEnEsteNavegador()) {
    throw new Error("Este navegador no tiene lector de huellas (Web Authentication).");
  }
  const credencial = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      userVerification: "required",
      timeout: 60_000,
    },
  });
  return idDeCredencial(credencial);
}

type RegistroNdef = { data?: BufferSource; recordType?: string };
type EventoNdef = Event & { serialNumber?: string; message?: { records?: RegistroNdef[] } };
type LectorNdef = {
  scan: () => Promise<void>;
  onreading: ((event: EventoNdef) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
};

export async function leerTarjetaNfc(): Promise<string> {
  const Ctor = (window as unknown as { NDEFReader?: new () => LectorNdef }).NDEFReader;
  if (!Ctor) {
    throw new Error("Este navegador no trae Web NFC. Pega el identificador o usa el lector en modo teclado.");
  }
  const lector = new Ctor();
  return new Promise((resolve, reject) => {
    const tiempo = window.setTimeout(() => reject(new Error("No se acercó ninguna tarjeta.")), 20_000);
    lector.onreadingerror = () => {
      window.clearTimeout(tiempo);
      reject(new Error("No se pudo leer la tarjeta."));
    };
    lector.onreading = (event) => {
      window.clearTimeout(tiempo);
      const serial = (event.serialNumber || "").trim();
      if (serial) {
        resolve(serial);
        return;
      }
      for (const record of event.message?.records ?? []) {
        if (!record.data) continue;
        try {
          const texto = new TextDecoder().decode(record.data).trim();
          if (texto) {
            resolve(texto);
            return;
          }
        } catch {
          continue;
        }
      }
      reject(new Error("La tarjeta no trae un identificador legible."));
    };
    lector.scan().catch((error: unknown) => {
      window.clearTimeout(tiempo);
      reject(error instanceof Error ? error : new Error("No se pudo abrir el lector NFC."));
    });
  });
}

export function mensajeHuella(error: unknown): string {
  if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError")) {
    return "No se completó la huella. El acceso con contraseña sigue disponible.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "No se pudo usar la huella. El acceso con contraseña sigue disponible.";
}
