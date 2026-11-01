import { spawn } from "node:child_process";
import path from "node:path";

export function raizPos(): string {
  if (process.env.BASECAMP_POS_ROOT) return process.env.BASECAMP_POS_ROOT;
  return path.resolve(process.cwd(), "..");
}

export function tenantDe(request: Request): string {
  return (request.headers.get("x-tenant-id") || "").trim();
}

export function ejecutarTienda(comando: string, payload: Record<string, unknown>, timeoutMs = 20000): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const child = spawn("python", ["-m", "services.tienda.cli", comando], {
      cwd: raizPos(),
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    let salida = "";
    let error = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ status: 504, body: { detail: "La operación de tienda tardó demasiado." } });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      salida += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve({ status: 500, body: { detail: "No se pudo iniciar Python para la tienda." } });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const body = JSON.parse(salida || "{}") as Record<string, unknown>;
        const status = code === 0 ? 200 : Number(body.status_code || 500);
        resolve({ status, body });
      } catch {
        resolve({ status: 500, body: { detail: error || salida || "La tienda no devolvió JSON." } });
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
